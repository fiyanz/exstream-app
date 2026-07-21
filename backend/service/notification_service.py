import json
from datetime import datetime
from sqlalchemy.orm import Session
from urllib.parse import quote
from fastapi.responses import RedirectResponse

from models.transaksi_model import Barang

def build_wa_receipt(order_id: str, db: Session, is_cod: bool = False) -> str:
    transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
    if not transaksi_db:
        return f"Halo Admin,\nSaya ingin konfirmasi pesanan saya dengan Order ID: {order_id}"

    customer_name = getattr(transaksi_db, "nama_pengguna", "Customer")
    customer_phone = getattr(transaksi_db, "no_telp", "-")
    customer_address = getattr(transaksi_db, "alamat", "-")
    total = getattr(transaksi_db, "total", 0)

    detail_str = getattr(transaksi_db, "detail_barang", "{}") or "{}"
    try:
        order_details = json.loads(detail_str)
    except (json.JSONDecodeError, TypeError):
        order_details = {}

    items = order_details.get("items", [])
    shipping_method = order_details.get("shipping_method", "Kurir")
    shipping_cost = order_details.get("shipping_cost", 0)
    subtotal = order_details.get("subtotal", 0)
    discount = order_details.get("discount", 0)

    now = datetime.utcnow()
    jkt = datetime.fromtimestamp(now.timestamp() + 7 * 3600)
    waktu_pesan = jkt.strftime("%d/%m/%Y %H:%M")

    # Header
    text = f"Halo Admin,\nSaya ingin konfirmasi pesanan saya di Jas Hujan Extrime Store.\n\n"
    text += f"*DETAIL PESANAN*\n"
    text += f"Order ID: {order_id}\n"
    text += f"Waktu: {waktu_pesan}\n\n"

    # Customer Data
    text += f"*DATA PELANGGAN*\n"
    text += f"Nama: {customer_name}\n"
    text += f"No. HP: {customer_phone}\n"
    text += f"Alamat: {customer_address}\n\n"

    # Items
    text += f"*RINGKASAN BELANJA*\n"
    for i in items:
        name = i.get("name", "Produk")
        color = i.get("color", "")
        size = i.get("size", "")
        variant_str = f" ({color} - {size})" if color and size else ""
        qty = i.get("quantity", 1)
        price = i.get("price", 0)
        sub_price = price * qty
        text += f"- {qty}x {name}{variant_str}\n"
        text += f"  Rp {sub_price:,}\n"

    text += "\n"
    text += f"Subtotal: Rp {subtotal:,}\n"
    if discount > 0:
        text += f"Diskon: -Rp {discount:,}\n"
    text += f"Ongkos Kirim: Rp {shipping_cost:,}\n"
    text += f"*Total Bayar: Rp {total:,}*\n\n"

    # Payment info
    method_str = "COD (Bayar di Tempat)" if is_cod else "Transfer Bank"
    text += f"*PENGIRIMAN & PEMBAYARAN*\n"
    text += f"Kurir: {shipping_method}\n"
    text += f"Metode: {method_str}\n"
    
    if is_cod:
        text += "Status: Menunggu Konfirmasi Pengiriman\n\n"
        text += "Mohon pesanan COD saya segera diproses dan dikirim ya. Terima kasih!"
    else:
        text += "Status: Pembayaran Telah Dilakukan\n\n"
        text += "Mohon pesanan saya segera diproses dan dikirim ya. Terima kasih!"

    return text.replace(",", ".")


def build_wa_error(order_id: str, db: Session) -> str:
    transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
    if transaksi_db:
        customer_name = getattr(transaksi_db, "nama_pengguna", "Customer")
        customer_phone = getattr(transaksi_db, "no_telp", "-")
        total = getattr(transaksi_db, "total", 0)
        return (
            "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n"
            "┃  🛒 JAS HUJAN EXTREME STORE         ┃\n"
            "┃        ❌ PEMBAYARAN GAGAL          ┃\n"
            "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n"
            f"Order ID: {order_id}\n\n"
            "📋 INFORMASI PELANGGAN\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"👤 Nama: {customer_name}\n"
            f"📱 No. HP: {customer_phone}\n"
            f"💵 Total: Rp {total:,}\n\n"
            "❌ STATUS: PEMBAYARAN GAGAL\n"
            "💡 Pembayaran tidak dapat diproses\n"
            "🔄 Silakan coba lagi atau pilih metode pembayaran lain\n"
            "📞 Atau hubungi admin untuk bantuan\n\n"
            "Terima kasih atas pengertiannya! 🙏"
        )
    return (
        f"❌ PEMBAYARAN GAGAL\n\nNo.Order: #{order_id}\nStatus: ❌ GAGAL\n\n"
        "Silakan coba lagi atau hubungi admin untuk bantuan.\n"
        "Terima kasih atas pengertiannya! 🙏"
    )


def redirect_to_wa(message: str, admin_phone: str) -> RedirectResponse:
    encoded = quote(message)
    return RedirectResponse(url=f"https://wa.me/{admin_phone}?text={encoded}", status_code=302)
