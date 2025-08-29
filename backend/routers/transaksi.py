
# --- Import Section ---
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.transaksi import Barang
from models.data_wilayah import Province, Regency, District, Village
from db.database import get_db
from service.payment_gateway import create_snap_transaction
from schemas.transaksi_schemas import TransaksiCreate, TransaksiOut, TransaksiCreateEnhanced, PaymentCallback
from datetime import datetime
from core.config import settings
from utils.get_name_location import get_location_names
from utils.format_phone_number import format_phone_number
from fastapi.responses import RedirectResponse
from typing import Optional

transaksi = APIRouter()


# Endpoint: Cek status pembayaran transaksi by order_id
@transaksi.get("/{order_id}/status")
def get_order_status(order_id: str, db: Session = Depends(get_db)):
    transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
    if not transaksi_db:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    # Status default jika belum ada kolom status di tabel: pending
    status = getattr(transaksi_db, "status", None)
    if not status:
        # fallback: jika sudah settlement di Midtrans, callback akan update status ke 'success' atau 'lunas'
        status = "pending"
    # Normalisasi status agar frontend mudah pakai
    if status in ["success", "settlement", "paid", "lunas"]:
        payment_status = "lunas"
    elif status in ["pending", "pending_payment", "pending_cod"]:
        payment_status = "pending"
    else:
        payment_status = "failed"
    return {
        "order_id": order_id,
        "payment_status": payment_status,
        "status": status,
        "customer_name": getattr(transaksi_db, "nama_pengguna", None),
        "customer_phone": getattr(transaksi_db, "no_telp", None),
        "total": getattr(transaksi_db, "total", None),
    }


# --- Endpoint Section ---



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

@transaksi.post("/enhanced", response_model=TransaksiOut)
def buat_transaksi_enhanced(order: TransaksiCreateEnhanced, db: Session = Depends(get_db)):
    """
    Membuat transaksi dengan dukungan non-COD (Midtrans)
    
    Note: This endpoint should ONLY be used for non-COD orders that require payment gateway integration.
    For COD orders, use the /store_order endpoint directly.
    """
    try:
        # Generate unique order ID
        order_id = str(uuid.uuid4())
        
        # Prepare order details
        order_details = {
            "items": order.items,
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
                "village": order.village
            }
        }
        
        # Convert Pydantic models to dictionaries for JSON serialization
        items_dict = [item.dict() for item in order.items]
        
        # Prepare order details with serializable data
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
                "village": order.village
            }
        }
        
        # Simpan transaksi ke database
        transaksi_db = Barang(
            id=order_id,
            no_telp=order.customer_phone,
            nama_barang=json.dumps(items_dict),  # Convert items to JSON string
            jumlah_barang=len(order.items),
            total=order.total,
            detail_barang=json.dumps(order_details),  # Store complete order details
            nama_pengguna=order.customer_name,
            alamat=order.customer_address
        )
        db.add(transaksi_db)
        db.commit()
        db.refresh(transaksi_db)

        # Handle payment based on method
        if order.payment_method.lower() == "cod":
            # COD - Direct processing, no payment gateway needed
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
                "redirect_url": None
            }
        else:
            # Non-COD - Use Midtrans
            try:
                # Prepare customer data for Midtrans with complete details
                # Use location names from frontend if available, otherwise get from database
                if hasattr(order, 'province_name') and order.province_name:
                    # Use location names sent from frontend
                    location_names = {
                        'province_name': order.province_name,
                        'city_name': getattr(order, 'city_name', ''),
                        'subdistrict_name': getattr(order, 'subdistrict_name', ''),
                        'village_name': getattr(order, 'village_name', '')
                    }
                else:
                    # Fallback to database lookup
                    location_names = get_location_names(db, order.province, order.city, order.subdistrict, order.village)
                
                # Build complete address with actual location names
                address_parts = [order.customer_address]
                if location_names['village_name']:
                    address_parts.append(location_names['village_name'])
                if location_names['subdistrict_name']:
                    address_parts.append(f"Kec. {location_names['subdistrict_name']}")
                if location_names['city_name']:
                    address_parts.append(location_names['city_name'])
                if location_names['province_name']:
                    address_parts.append(location_names['province_name'])
                complete_address = ", ".join(address_parts)
                
                # Format phone number for Midtrans
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
                        "country_code": "IDN"
                    },
                    "shipping_address": {
                        "first_name": order.customer_name,
                        "last_name": "",
                        "phone": formatted_phone,
                        "address": complete_address,
                        "city": order.city,
                        "country_code": "IDN"
                    }
                }
                
                print(f"Customer data for Midtrans: {customer}")

                # Create Midtrans transaction with final total only
                print(f"Calling create_snap_transaction with order_id: {order_id}, total: {order.total}")
                print(f"Subtotal: {order.subtotal}, Discount: {order.discount}, Shipping: {order.shipping_cost}")
                
                snap_response = create_snap_transaction(
                    order_id=order_id,
                    gross_amount=order.subtotal,  # Original subtotal for reference
                    customer=customer,
                    items=items_dict,  # Pass original items (not used in simplified version)
                    final_total=order.total  # Use final total (after discount + shipping) for Midtrans
                )
                print(f"Snap response received: {snap_response}")
            except Exception as midtrans_error:
                # If Midtrans fails, return error with helpful message
                raise HTTPException(
                    status_code=500, 
                    detail=f"Gagal membuat transaksi Midtrans: {str(midtrans_error)}. Pastikan MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY sudah dikonfigurasi di file .env"
                )

            response_data = {
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
                "midtrans_amount": order.total,  # Now matches frontend total
                "discount": order.discount,
                "shipping_cost": order.shipping_cost
            }
            print(f"Returning response: {response_data}")
            return response_data
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal membuat transaksi: {str(e)}")



@transaksi.post("/callback")
def payment_callback(callback_data: PaymentCallback, db: Session = Depends(get_db)):
    """
    Handle Midtrans payment callback
    """
    try:
        # Find the transaction
        transaksi_db = db.query(Barang).filter(Barang.id == callback_data.order_id).first()
        if not transaksi_db:
            raise HTTPException(status_code=404, detail="Order tidak ditemukan")

        # Update transaction status based on callback
        status_map = {
            ("capture", "challenge"): "challenge",
            ("capture", "accept"): "success",
            ("settlement", None): "success",
            ("cancel", None): "failed",
            ("deny", None): "failed",
            ("expire", None): "failed",
            ("pending", None): "pending",
        }
        new_status = None
        if callback_data.transaction_status == "capture":
            if callback_data.fraud_status == "challenge":
                new_status = "challenge"
            elif callback_data.fraud_status == "accept":
                new_status = "success"
        elif callback_data.transaction_status == "settlement":
            new_status = "success"
        elif callback_data.transaction_status in ["cancel", "deny", "expire"]:
            new_status = "failed"
        elif callback_data.transaction_status == "pending":
            new_status = "pending"

        if new_status:
            # Always normalize success status to "lunas" for frontend
            if new_status == "success":
                new_status = "lunas"
            transaksi_db.status = new_status
            db.commit()

            # If payment is successful, prepare WhatsApp redirect data
            if new_status == "lunas":
                wa_redirect_url = f"/api/v1/transaksi/payment_success_wa?order_id={callback_data.order_id}"
                return {
                    "status": "success",
                    "message": "Pembayaran berhasil",
                    "redirect_url": wa_redirect_url
                }

        return {"status": "success", "message": f"Callback processed successfully, status: {new_status}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses callback: {str(e)}")



# Endpoint: Redirect ke WhatsApp dengan pesan custom
@transaksi.get("/wa_redirect")
def wa_redirect(text: str = "", phone: Optional[str] = None):
    """
    Public endpoint to redirect to WhatsApp with URL-encoded text.
    Use this as a Finish URL if you want Midtrans to hit a public URL that opens WhatsApp.
    Example: /api/v1/transaksi/wa_redirect?phone=62xxxxxxxxxx&text=...
    """
    admin = phone or settings.ADMIN_WHATSAPP
    if not admin:
        raise HTTPException(status_code=400, detail="No WhatsApp number configured")
    from urllib.parse import quote
    encoded = quote(text or "")
    url = f"https://wa.me/{admin}?text={encoded}"
    return RedirectResponse(url)




# Endpoint: Direct WhatsApp redirect after payment success
@transaksi.get("/payment_success_wa")
def payment_success_wa(
    order_id: str = "",
    status_code: str = "",
    transaction_status: str = "",
    admin_phone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        # Default admin number if not provided
        admin = admin_phone or settings.ADMIN_WHATSAPP or "6285702257423"

        # Handle missing order_id
        if not order_id:
            # Fallback to simple WhatsApp message
            wa_message = "LUNAS"
            from urllib.parse import quote
            encoded_message = quote(wa_message)
            wa_url = f"https://wa.me/{admin}?text={encoded_message}"
            return RedirectResponse(url=wa_url)
        
        # Try to get transaction data
        transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
        
        # If transaction found, use its data
        if transaksi_db:
            # Update status to lunas if payment successful
            if status_code == "200" or transaction_status == "settlement":
                transaksi_db.status = "lunas"
                db.commit()
            
            # Get order details
            customer_name = getattr(transaksi_db, "nama_pengguna", "Customer")
            customer_phone = getattr(transaksi_db, "no_telp", "-")
            customer_address = getattr(transaksi_db, "alamat", "-")
            total = getattr(transaksi_db, "total", 0)
            
            # Format WhatsApp message
            wa_message = f"*PESANAN LUNAS*\n\nNo.Order: #{order_id}\nNama: {customer_name}\nHP: {customer_phone}\nAlamat: {customer_address}\nTotal: Rp {total:,}\nStatus: ✅ LUNAS"
        else:
            # Fallback message if transaction not found
            wa_message = f"*LUNAS*\n\nNo.Order: #{order_id}"
        
        # Generate WhatsApp URL and redirect
        from urllib.parse import quote
        encoded_message = quote(wa_message)
        wa_url = f"https://wa.me/{admin}?text={encoded_message}"
        return RedirectResponse(url=wa_url, status_code=302)
        
    except Exception as e:
        # If anything fails, redirect to WhatsApp with simple message
        print(f"Error in payment_success_wa: {str(e)}")
        wa_url = f"https://wa.me/{admin}?text=LUNAS"
        return RedirectResponse(url=wa_url, status_code=302)