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
                # Get location names from database
                location_names = get_location_names(db, order.province, order.city, order.subdistrict, order.village)
                
                # Build complete address with actual location names
                complete_address = f"{order.customer_address}, {location_names['village_name']}, {location_names['subdistrict_name']}, {location_names['city_name']}, {location_names['province_name']}"
                
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
        if callback_data.transaction_status == "capture":
            if callback_data.fraud_status == "challenge":
                # TODO: Set status to "challenge"
                pass
            elif callback_data.fraud_status == "accept":
                # TODO: Set status to "success"
                pass
        elif callback_data.transaction_status == "settlement":
            # TODO: Set status to "success"
            pass
        elif callback_data.transaction_status == "cancel" or callback_data.transaction_status == "deny" or callback_data.transaction_status == "expire":
            # TODO: Set status to "failed"
            pass
        elif callback_data.transaction_status == "pending":
            # TODO: Set status to "pending"
            pass
        
        # Commit changes
        db.commit()
        
        return {"status": "success", "message": "Callback processed successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses callback: {str(e)}")