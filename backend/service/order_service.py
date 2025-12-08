from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.order_model import Order, OrderItem
from schemas.transaksi_schemas import TransaksiCreateEnhanced
from service.payment_gateway_service import create_snap_transaction
from service.store_order_service import create_store_order as create_komerce_order
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy import func, or_

logger = logging.getLogger(__name__)

class OrderService:
    @staticmethod
    def create_order(db: Session, order_data: TransaksiCreateEnhanced) -> Dict[str, Any]:
        """
        Creates a new unified order.
        Handles both COD (Komerce) and Transfer (Midtrans) flows internally.
        """
        
        # 1. Create Base Order Record
        new_order = Order(
            customer_name=order_data.customer_name,
            customer_phone=order_data.customer_phone,
            shipping_address=order_data.customer_address,
            
            province_id=order_data.province,
            city_id=order_data.city,
            subdistrict_id=order_data.subdistrict,
            village_id=order_data.village,
            
            province_name=getattr(order_data, 'province_name', ''),
            city_name=getattr(order_data, 'city_name', ''),
            subdistrict_name=getattr(order_data, 'subdistrict_name', ''),
            village_name=getattr(order_data, 'village_name', ''),
            
            total_amount=order_data.total,
            shipping_cost=order_data.shipping_cost,
            discount_amount=order_data.discount,
            final_total=order_data.total,  # Assumes frontend sends final calculated total
            
            payment_method=order_data.payment_method,
            order_status="created",
            payment_status="pending_cod" if order_data.payment_method.lower() == "cod" else "pending"
        )
        
        db.add(new_order)
        db.flush() # Get ID
        
        # 2. Add Order Items
        items = []
        for item in order_data.items:
            order_item = OrderItem(
                order_id=new_order.id,
                product_name=item.name,
                variant_name=item.variant,
                color=item.color,
                size=item.size,
                quantity=item.quantity,
                price=item.price,
                subtotal=item.price * item.quantity,
                weight_grams=item.product_weight
            )
            db.add(order_item)
            items.append(order_item)
            
        db.commit()
        db.refresh(new_order)
        
        response_data = {
            "order_id": new_order.id,
            "status": "success",
            "payment_method": new_order.payment_method,
        }

        # 3. Handle External Services (Midtrans / Komerce)
        if new_order.payment_method.lower() == "cod":
            # --- COD Flow (Komerce) ---
            try:
                # Prepare payload for Komerce
                # Note: Komerce API structure from store_order_service
                komerce_payload = {
                     "order_date": new_order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                     "brand_name": "Jas Hujan Extrime", # Default Brand Name
                     "shipper_name": "Toko Official", 
                     "receiver_name": new_order.customer_name,
                     "receiver_phone": new_order.customer_phone,
                     
                     # Ensure IDs are integers for Komerce
                     "receiver_destination_id": int(new_order.subdistrict_id) if new_order.subdistrict_id and new_order.subdistrict_id.isdigit() else 0,
                     
                     "receiver_address": f"{new_order.shipping_address}, {new_order.village_name}, {new_order.subdistrict_name}, {new_order.city_name}, {new_order.province_name}",
                     
                     "payment_method": "COD",
                     "grand_total": new_order.final_total,
                     "shipping": order_data.shipping_method, # e.g. "JNE"
                     "shipping_type": "REG", # Default or extract from shipping_method
                     "shipping_cost": new_order.shipping_cost,
                     "insurance_value": 0, # Simplify for now
                     "order_details": [
                         {
                             "product_name": item.product_name,
                             "product_variant_name": item.variant_name or "-",
                             "product_price": item.price,
                             "qty": item.quantity,
                             "subtotal": item.subtotal,
                             "product_weight": item.weight_grams
                         } for item in items
                     ]
                }
                
                # Call Komerce Service
                komerce_response = create_komerce_order(komerce_payload)
                
                # Update Order with Komerce Data (if available)
                if komerce_response.get("data"):
                     new_order.komerce_order_id = str(komerce_response["data"].get("order_id", ""))
                     db.commit()
                     
                response_data["message"] = "Order COD Created Successfully"
                response_data["komerce_data"] = komerce_response.get("data")
                
            except Exception as e:
                logger.error(f"Komerce Sync Error: {e}")
                # Don't fail the user order if sync fails, just log and allow manual retry later
                response_data["message"] = "Order Created (Komerce Sync Pending)"
                response_data["warning"] = str(e)
                
        else:
            # --- Transfer Flow (Midtrans) ---
            try:
                snap_token = OrderService._create_midtrans_transaction(new_order)
                new_order.midtrans_token = snap_token
                db.commit()
                response_data["snap_token"] = snap_token
                response_data["message"] = "Order Created, Waiting for Payment"
            except Exception as e:
                logger.error(f"Midtrans Error: {e}")
                # Fail gracefully if payment gateway fails
                raise HTTPException(status_code=500, detail="Payment Gateway Error: " + str(e))

        return response_data

    @staticmethod
    def _create_midtrans_transaction(order: Order) -> str:
        customer_details = {
            "first_name": order.customer_name,
            "phone": order.customer_phone,
            "billing_address": {"address": order.shipping_address}
        }
        
        transaction = create_snap_transaction(
            order_id=order.id,
            gross_amount=order.final_total,
            customer=customer_details
        )
        return transaction["token"]
