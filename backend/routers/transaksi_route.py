import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.config import settings
from db.database import get_db
from models.transaksi_model import Barang
from schemas.transaksi_schemas import (
    TransaksiCreate,
    TransaksiCreateEnhanced,
    TransaksiOut,
    PaymentCallback,
)
from service.transaction_service import process_enhanced_transaction
from service.notification_service import build_wa_receipt, build_wa_error, redirect_to_wa
from service.payment_gateway_service import create_snap_transaction

logger = logging.getLogger(__name__)
transaksi = APIRouter()

_STATUS_SUCCESS = {"success", "settlement", "paid", "lunas"}
_STATUS_PENDING = {"pending", "pending_payment", "pending_cod"}

def _normalize_payment_status(status: str) -> str:
    if status in _STATUS_SUCCESS:
        return "lunas"
    if status in _STATUS_PENDING:
        return "pending"
    return "failed"


@transaksi.get("/{order_id}/status")
def get_order_status(order_id: str, db: Session = Depends(get_db)):
    transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
    if not transaksi_db:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    status = getattr(transaksi_db, "status", None) or "pending"
    return {
        "order_id": order_id,
        "payment_status": _normalize_payment_status(status),
        "status": status,
        "customer_name": getattr(transaksi_db, "nama_pengguna", None),
        "customer_phone": getattr(transaksi_db, "no_telp", None),
        "total": getattr(transaksi_db, "total", None),
    }


@transaksi.post("/", response_model=TransaksiOut)
def buat_transaksi(order: TransaksiCreate, db: Session = Depends(get_db)):
    # Legacy endpoint logic preserved but refactored to be thin
    transaksi_db = Barang(
        no_telp=order.no_telp,
        nama_barang=order.nama_barang,
        jumlah_barang=order.jumlah_barang,
        total=order.total,
        detail_barang=order.detail_barang,
        nama_pengguna=order.nama_pengguna,
        alamat=order.alamat,
    )
    db.add(transaksi_db)
    db.commit()
    db.refresh(transaksi_db)

    customer = {
        "first_name": order.nama_pengguna or "Customer",
        "phone": order.no_telp,
        "billing_address": {"address": order.alamat or "-"},
    }
    snap_response = create_snap_transaction(
        order_id=transaksi_db.id,
        gross_amount=transaksi_db.total,
        customer=customer,
    )

    return {
        "id": transaksi_db.id,
        "no_telp": transaksi_db.no_telp,
        "nama_barang": transaksi_db.nama_barang,
        "jumlah_barang": transaksi_db.jumlah_barang,
        "total": transaksi_db.total,
        "detail_barang": transaksi_db.detail_barang,
        "nama_pengguna": transaksi_db.nama_pengguna,
        "alamat": transaksi_db.alamat,
        "snap_token": snap_response["token"],
        "redirect_url": snap_response["redirect_url"],
    }


@transaksi.post("/enhanced", response_model=TransaksiOut)
def buat_transaksi_enhanced(order: TransaksiCreateEnhanced, db: Session = Depends(get_db)):
    try:
        return process_enhanced_transaction(order, db)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing enhanced transaction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while processing transaction")


@transaksi.post("/callback")
def payment_callback(callback_data: PaymentCallback, db: Session = Depends(get_db)):
    transaksi_db = db.query(Barang).filter(Barang.id == callback_data.order_id).first()
    if not transaksi_db:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")

    txn = callback_data.transaction_status
    fraud = callback_data.fraud_status

    if txn == "capture":
        new_status = "challenge" if fraud == "challenge" else ("accept" if fraud == "accept" else None)
        if new_status == "accept":
            new_status = "lunas"
    elif txn == "settlement":
        new_status = "lunas"
    elif txn in ("cancel", "deny", "expire"):
        new_status = "failed"
    elif txn == "pending":
        new_status = "pending"
    else:
        new_status = None

    if new_status:
        transaksi_db.status = new_status
        db.commit()
        if new_status == "lunas":
            return {
                "status": "success",
                "message": "Pembayaran berhasil",
                "redirect_url": f"/api/v1/transaksi/payment_success_wa?order_id={callback_data.order_id}",
            }

    return {"status": "success", "message": f"Callback processed, status: {new_status}"}


@transaksi.get("/wa_redirect")
def wa_redirect(text: str = "", phone: Optional[str] = None):
    admin = phone or settings.ADMIN_WHATSAPP
    if not admin:
        raise HTTPException(status_code=400, detail="No WhatsApp number configured")
    return redirect_to_wa(text or "", admin)


@transaksi.get("/payment_success_wa")
def payment_success_wa(
    order_id: str = "",
    status_code: str = "",
    transaction_status: str = "",
    admin_phone: Optional[str] = None,
    db: Session = Depends(get_db),
):
    admin = admin_phone or settings.ADMIN_WHATSAPP
    try:
        if not order_id:
            msg = "✅ PEMBAYARAN LUNAS - Terima kasih telah berbelanja di Jas Hujan Extreme Store!"
            return redirect_to_wa(msg, admin)

        if status_code == "200" or transaction_status == "settlement":
            transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
            if transaksi_db:
                transaksi_db.status = "lunas"
                db.commit()

        msg = build_wa_receipt(order_id, db)
        return redirect_to_wa(msg, admin)
    except Exception as e:
        logger.error("payment_success_wa error: %s", e)
        msg = "✅ PEMBAYARAN LUNAS - Terima kasih telah berbelanja di Jas Hujan Extreme Store!"
        return redirect_to_wa(msg, admin)


@transaksi.get("/payment_error_wa")
def payment_error_wa(
    order_id: str = "",
    status_code: str = "",
    transaction_status: str = "",
    admin_phone: Optional[str] = None,
    db: Session = Depends(get_db),
):
    admin = admin_phone or settings.ADMIN_WHATSAPP
    try:
        if not order_id:
            msg = "❌ PEMBAYARAN GAGAL - Silakan coba lagi atau hubungi admin untuk bantuan."
            return redirect_to_wa(msg, admin)

        transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
        if transaksi_db:
            transaksi_db.status = "failed"
            db.commit()

        msg = build_wa_error(order_id, db)
        return redirect_to_wa(msg, admin)
    except Exception as e:
        logger.error("payment_error_wa error: %s", e)
        msg = "❌ PEMBAYARAN GAGAL - Silakan coba lagi atau hubungi admin untuk bantuan."
        return redirect_to_wa(msg, admin)
