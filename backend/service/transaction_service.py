import json
import uuid
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models.transaksi_model import Barang
from schemas.transaksi_schemas import TransaksiCreateEnhanced
from utils.format_phone_number import format_phone_number
from utils.get_name_location import get_location_names
from service.payment_gateway_service import create_snap_transaction

logger = logging.getLogger(__name__)

def process_enhanced_transaction(order: TransaksiCreateEnhanced, db: Session) -> dict:
    order_id = str(uuid.uuid4())
    items_dict = [item.dict() for item in order.items]

    order_details = {
        "items": items_dict,
        "shipping_method": order.shipping_method,
        "shipping_cost": order.shipping_cost,
        "payment_method": order.payment_method,
        "subtotal": order.subtotal,
        "discount": order.discount,
        "total": order.total,
        "customer_info": {
            "name": order.customer_name,
            "phone": order.customer_phone,
            "address": order.customer_address,
            "province": order.province,
            "city": order.city,
            "subdistrict": order.subdistrict,
            "village": order.village,
        },
    }

    # Save to database
    transaksi_db = Barang(
        id=order_id,
        no_telp=order.customer_phone,
        nama_barang=json.dumps(items_dict),
        jumlah_barang=len(order.items),
        total=order.total,
        detail_barang=json.dumps(order_details),
        nama_pengguna=order.customer_name,
        alamat=order.customer_address,
    )
    db.add(transaksi_db)
    db.commit()
    db.refresh(transaksi_db)

    # If COD, bypass Midtrans
    if order.payment_method.lower() == "cod":
        # Buat URL WhatsApp untuk COD
        from service.notification_service import build_wa_receipt
        from urllib.parse import quote
        from core.config import settings
        
        wa_message = build_wa_receipt(transaksi_db.id, db, is_cod=True)
        wa_url = f"https://wa.me/{settings.ADMIN_WHATSAPP}?text={quote(wa_message)}"

        return {
            "id": transaksi_db.id,
            "no_telp": transaksi_db.no_telp,
            "nama_barang": transaksi_db.nama_barang,
            "jumlah_barang": transaksi_db.jumlah_barang,
            "total": transaksi_db.total,
            "detail_barang": transaksi_db.detail_barang,
            "nama_pengguna": transaksi_db.nama_pengguna,
            "alamat": transaksi_db.alamat,
            "payment_status": "pending_cod",
            "message": "Pesanan COD berhasil dibuat. Pembayaran dilakukan saat barang diterima.",
            "token": None,
            "redirect_url": None,
            "whatsapp_url": wa_url,
        }

    # Prepare data for Midtrans
    location_names = {
        "province_name": getattr(order, "province_name", "") or "",
        "city_name": getattr(order, "city_name", "") or "",
        "subdistrict_name": getattr(order, "subdistrict_name", "") or "",
        "village_name": getattr(order, "village_name", "") or "",
    }

    if not location_names["province_name"]:
        location_names = get_location_names(
            db, order.province, order.city, order.subdistrict, order.village
        )

    address_parts = [order.customer_address]
    if location_names["village_name"]:
        address_parts.append(location_names["village_name"])
    if location_names["subdistrict_name"]:
        address_parts.append(f"Kec. {location_names['subdistrict_name']}")
    if location_names["city_name"]:
        address_parts.append(location_names["city_name"])
    if location_names["province_name"]:
        address_parts.append(location_names["province_name"])
    complete_address = ", ".join(address_parts)

    formatted_phone = format_phone_number(order.customer_phone)
    customer = {
        "first_name": order.customer_name,
        "last_name": "",
        "phone": formatted_phone,
        "billing_address": {
            "first_name": order.customer_name,
            "last_name": "",
            "phone": formatted_phone,
            "address": complete_address,
            "city": order.city,
            "country_code": "IDN",
        },
        "shipping_address": {
            "first_name": order.customer_name,
            "last_name": "",
            "phone": formatted_phone,
            "address": complete_address,
            "city": order.city,
            "country_code": "IDN",
        },
    }

    try:
        snap_response = create_snap_transaction(
            order_id=order_id,
            gross_amount=order.subtotal,
            customer=customer,
            items=items_dict,
            final_total=order.total,
        )
    except Exception as e:
        logger.error("Midtrans error for order %s: %s", order_id, e)
        raise HTTPException(
            status_code=500,
            detail=f"Gagal membuat transaksi Midtrans: {e}. Pastikan MIDTRANS_SERVER_KEY terkonfigurasi dengan benar.",
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
        "payment_status": "pending_payment",
        "message": "Pesanan berhasil dibuat. Silakan lakukan pembayaran.",
        "token": snap_response.get("token") or snap_response.get("snap_token"),
        "redirect_url": snap_response.get("redirect_url"),
        "frontend_total": order.total,
        "midtrans_amount": order.total,
        "discount": order.discount,
        "shipping_cost": order.shipping_cost,
    }
