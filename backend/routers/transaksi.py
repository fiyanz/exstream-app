from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.transaksi import Barang
from db.database import get_db
from service.payment_gateway import create_snap_transaction
from schemas.transaksi_schemas import TransaksiCreate, TransaksiOut

transaksi = APIRouter()

@transaksi.post("/", response_model=TransaksiOut)
def buat_transaksi(order: TransaksiCreate, db: Session = Depends(get_db)):
    # Simpan transaksi ke database
    transaksi_db = Barang(
        no_telp=order.no_telp,
        nama_barang=order.nama_barang,
        jumlah_barang=order.jumlah_barang,
        total=order.total,
        detail_barang=order.detail_barang,
        nama_pengguna=order.nama_pengguna,
        alamat=order.alamat
    )
    db.add(transaksi_db)
    db.commit()
    db.refresh(transaksi_db)

    # Data customer untuk Midtrans
    customer = {
        "first_name": order.nama_pengguna if order.nama_pengguna else "Customer", 
        "phone": order.no_telp,
        "billing_address": {
            "address": order.alamat if order.alamat else "-"
        }
    }

    # Buat transaksi Snap
    snap_response = create_snap_transaction(
        order_id=transaksi_db.id,
        gross_amount=transaksi_db.total,
        customer=customer
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
        "redirect_url": snap_response["redirect_url"]
    }