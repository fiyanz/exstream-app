import logging
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.order_model import Order, OrderItem
from schemas.transaksi_schemas import TransaksiCreateEnhanced
from service.payment_gateway_service import create_snap_transaction
from service.store_order_service import create_komerce_order

logger = logging.getLogger(__name__)


class OrderService:
    @staticmethod
    def create_order(db: Session, order_data: TransaksiCreateEnhanced) -> dict[str, Any]:
        new_order = Order(
            customer_name=order_data.customer_name,
            customer_phone=order_data.customer_phone,
            shipping_address=order_data.customer_address,
            province_id=order_data.province,
            city_id=order_data.city,
            subdistrict_id=order_data.subdistrict,
            village_id=order_data.village,
            province_name=getattr(order_data, "province_name", "") or "",
            city_name=getattr(order_data, "city_name", "") or "",
            subdistrict_name=getattr(order_data, "subdistrict_name", "") or "",
            village_name=getattr(order_data, "village_name", "") or "",
            total_amount=order_data.total,
            shipping_cost=order_data.shipping_cost,
            discount_amount=order_data.discount,
            final_total=order_data.total,
            payment_method=order_data.payment_method,
            order_status="created",
            payment_status="pending_cod" if order_data.payment_method.lower() == "cod" else "pending",
        )
        db.add(new_order)
        db.flush()

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
                weight_grams=item.product_weight,
            )
            db.add(order_item)
            items.append(order_item)

        db.commit()
        db.refresh(new_order)

        response = {
            "order_id": new_order.id,
            "status": "success",
            "payment_method": new_order.payment_method,
        }

        if new_order.payment_method.lower() == "cod":
            try:
                komerce_payload = {
                    "order_date": new_order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "brand_name": "Jas Hujan Extrime",
                    "shipper_name": "Toko Official",
                    "receiver_name": new_order.customer_name,
                    "receiver_phone": new_order.customer_phone,
                    "receiver_destination_id": int(new_order.subdistrict_id)
                    if new_order.subdistrict_id and new_order.subdistrict_id.isdigit()
                    else 0,
                    "receiver_address": (
                        f"{new_order.shipping_address}, {new_order.village_name}, "
                        f"{new_order.subdistrict_name}, {new_order.city_name}, {new_order.province_name}"
                    ),
                    "payment_method": "COD",
                    "grand_total": new_order.final_total,
                    "shipping": order_data.shipping_method,
                    "shipping_type": "REG",
                    "shipping_cost": new_order.shipping_cost,
                    "insurance_value": 0,
                    "order_details": [
                        {
                            "product_name": i.product_name,
                            "product_variant_name": i.variant_name or "-",
                            "product_price": i.price,
                            "qty": i.quantity,
                            "subtotal": i.subtotal,
                            "product_weight": i.weight_grams,
                        }
                        for i in items
                    ],
                }
                komerce_response = create_komerce_order(komerce_payload)
                if komerce_response.get("data"):
                    new_order.komerce_order_id = str(komerce_response["data"].get("order_id", ""))
                    db.commit()
                response["message"] = "Order COD Created Successfully"
                response["komerce_data"] = komerce_response.get("data")
            except Exception as e:
                logger.error("Komerce sync error for order %s: %s", new_order.id, e)
                response["message"] = "Order Created (Komerce Sync Pending)"
                response["warning"] = str(e)
        else:
            try:
                snap_token = OrderService._create_midtrans_transaction(new_order)
                new_order.midtrans_token = snap_token
                db.commit()
                response["snap_token"] = snap_token
                response["message"] = "Order Created, Waiting for Payment"
            except Exception as e:
                logger.error("Midtrans error for order %s: %s", new_order.id, e)
                raise HTTPException(status_code=500, detail=f"Payment Gateway Error: {e}")

        return response

    @staticmethod
    def _create_midtrans_transaction(order: Order) -> str:
        customer = {
            "first_name": order.customer_name,
            "phone": order.customer_phone,
            "billing_address": {"address": order.shipping_address},
        }
        transaction = create_snap_transaction(
            order_id=order.id,
            gross_amount=order.final_total,
            customer=customer,
        )
        return transaction["token"]
