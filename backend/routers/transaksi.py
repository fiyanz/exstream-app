from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.transaksi import Barang
from models.data_wilayah import Province, Regency, District, Village
from db.database import get_db
from service.payment_gateway import create_snap_transaction
from schemas.transaksi_schemas import TransaksiCreate, TransaksiOut, TransaksiCreateEnhanced, PaymentCallback
import json
from datetime import datetime
import uuid
from core.config import settings

transaksi = APIRouter()

def format_phone_number(phone: str) -> str:
    """
    Format phone number to include +62 prefix for Midtrans
    """
    if not phone:
        return phone
    
    # Remove any existing +62 prefix
    if phone.startswith('+62'):
        return phone
    
    # Remove leading 0 if present
    if phone.startswith('0'):
        phone = phone[1:]
    
    # Add +62 prefix
    return f"+62{phone}"

def get_location_names(db: Session, province_id: str, city_id: str, subdistrict_id: str, village_id: str):
    """
    Get location names from IDs
    """
    try:
        province = db.query(Province).filter(Province.id == province_id).first()
        city = db.query(Regency).filter(Regency.id == city_id).first()
        subdistrict = db.query(District).filter(District.id == subdistrict_id).first()
        village = db.query(Village).filter(Village.id == village_id).first()
        
        return {
            "province_name": province.name if province else f"Provinsi {province_id}",
            "city_name": city.name if city else f"Kota {city_id}",
            "subdistrict_name": subdistrict.name if subdistrict else f"Kecamatan {subdistrict_id}",
            "village_name": village.name if village else f"Desa {village_id}"
        }
    except Exception as e:
        print(f"Error getting location names: {e}")
        return {
            "province_name": f"Provinsi {province_id}",
            "city_name": f"Kota {city_id}",
            "subdistrict_name": f"Kecamatan {subdistrict_id}",
            "village_name": f"Desa {village_id}"
        }

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

@transaksi.post("/store-order")
def store_order_data(order: TransaksiCreateEnhanced, db: Session = Depends(get_db)):
    """
    Menyimpan data order sementara sebelum pembayaran
    """
    try:
        # Generate unique order ID
        order_id = str(uuid.uuid4())
        
        # Convert Pydantic models to dictionaries for JSON serialization
        items_dict = [item.dict() for item in order.items]
        
        # Format phone number for consistency
        formatted_phone = format_phone_number(order.customer_phone)
        
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
                "phone": formatted_phone,
                "address": order.customer_address,
                "province": order.province,
                "city": order.city,
                "subdistrict": order.subdistrict,
                "village": order.village
            }
        }
        
        # Simpan transaksi ke database dengan status pending
        transaksi_db = Barang(
            id=order_id,
            no_telp=formatted_phone,
            nama_barang=json.dumps(items_dict),
            jumlah_barang=len(order.items),
            total=order.total,
            detail_barang=json.dumps(order_details),
            nama_pengguna=order.customer_name,
            alamat=order.customer_address
        )
        db.add(transaksi_db)
        db.commit()
        db.refresh(transaksi_db)
        
        return {
            "order_id": order_id,
            "status": "stored",
            "message": "Order data stored successfully",
            "frontend_total": order.total,
            "subtotal": order.subtotal,
            "discount": order.discount,
            "shipping_cost": order.shipping_cost
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan order: {str(e)}")

@transaksi.get("/order/{order_id}")
def get_order_data(order_id: str, db: Session = Depends(get_db)):
    """
    Mengambil data order berdasarkan order ID
    """
    try:
        transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
        if not transaksi_db:
            raise HTTPException(status_code=404, detail="Order tidak ditemukan")
        
        # Parse detail_barang JSON
        order_details = json.loads(transaksi_db.detail_barang) if transaksi_db.detail_barang else {}
        customer_info = order_details.get("customer_info", {})
        
        return {
            "customer_name": transaksi_db.nama_pengguna,
            "customer_phone": transaksi_db.no_telp,
            "customer_address": transaksi_db.alamat,
            "province": customer_info.get("province", ""),
            "city": customer_info.get("city", ""),
            "subdistrict": customer_info.get("subdistrict", ""),
            "village": customer_info.get("village", ""),
            "items": json.loads(transaksi_db.nama_barang) if transaksi_db.nama_barang else [],
            "shipping_method": order_details.get("shipping_method", ""),
            "shipping_cost": order_details.get("shipping_cost", 0),
            "payment_method": order_details.get("payment_method", ""),
            "subtotal": order_details.get("subtotal", 0),
            "discount": order_details.get("discount", 0),
            "total": transaksi_db.total
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data order: {str(e)}")

@transaksi.post("/enhanced", response_model=TransaksiOut)
def buat_transaksi_enhanced(order: TransaksiCreateEnhanced, db: Session = Depends(get_db)):
    """
    Membuat transaksi dengan dukungan COD dan non-COD (Midtrans)
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

@transaksi.get("/{order_id}/status")
def get_order_status(order_id: str, db: Session = Depends(get_db)):
    """
    Get order status by order ID
    """
    transaksi_db = db.query(Barang).filter(Barang.id == order_id).first()
    if not transaksi_db:
        raise HTTPException(status_code=404, detail="Order tidak ditemukan")
    
    return {
        "order_id": transaksi_db.id,
        "status": "pending",  # You can add status field to your model
        "total": transaksi_db.total,
        "customer_name": transaksi_db.nama_pengguna,
        "created_at": transaksi_db.created_at if hasattr(transaksi_db, 'created_at') else None
    }



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