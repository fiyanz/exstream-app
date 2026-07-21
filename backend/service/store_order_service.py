import logging
import math
from typing import Any

import requests
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from core.config import settings
from models.store_order_model import StoreOrder, OrderDetails
from schemas.store_order_schemas import StoreOrderRequest

logger = logging.getLogger(__name__)

KOMERCE_API_KEY = settings.KOMERCE_API_KEY
KOMERCE_ORDER_BASE_URL = settings.KOMERCE_ORDER_BASE_URL


def calculate_service_fee(grand_total: int, cod_value: int, payment_method: str = "") -> int:
    base = cod_value if payment_method and payment_method.upper() == "COD" and cod_value > 0 else grand_total
    return max(1, round(base * 0.028))


def calculate_insurance_value(courier: str, total_product_price: int, grand_total: int) -> int:
    if total_product_price <= 300000:
        return 0

    courier = (courier or "").upper()
    match courier:
        case "JNE":
            value = int(total_product_price * 0.002) + 5000
        case "SICEPAT":
            value = int(grand_total * 0.003) if grand_total > 500000 else 0
        case "IDEXPRESS":
            value = int(total_product_price * 0.002)
        case "SAP":
            value = int(total_product_price * 0.003) + 2000
        case "NINJA":
            value = 2500 if total_product_price <= 1000000 else int(total_product_price * 0.0025)
        case "JNT" | "J&T":
            value = int(total_product_price * 0.002)
        case _:
            value = 0

    return math.ceil(value / 100) * 100


def _validate_order(order_data: dict[str, Any]) -> dict[str, Any]:
    order_data["service_fee"] = calculate_service_fee(
        order_data.get("grand_total", 0),
        order_data.get("cod_value", 0),
        order_data.get("payment_method", ""),
    )

    order_details = order_data.get("order_details", [])
    total_product = sum(item.get("subtotal", 0) for item in order_details)
    if total_product <= 300000 and "insurance_value" in order_data:
        del order_data["insurance_value"]
    elif "insurance_value" in order_data:
        order_data["insurance_value"] = calculate_insurance_value(
            order_data.get("shipping", ""),
            total_product,
            order_data.get("grand_total", 0),
        )

    return order_data


def create_komerce_order(order_data: dict[str, Any]) -> dict[str, Any]:
    url = f"{KOMERCE_ORDER_BASE_URL}/orders/store"
    headers = {
        "x-api-key": KOMERCE_API_KEY,
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(url, headers=headers, json=order_data, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error("Komerce API error: %s", e)
        error_detail = {}
        if hasattr(e, "response") and e.response is not None:
            try:
                error_detail = e.response.json()
            except ValueError:
                pass
        return {"meta": {"status": "error", "message": str(e), "details": error_detail}}


def process_store_order(order: StoreOrderRequest, db: Session) -> dict:
    order_data = order.dict()
    payment_method = order_data.get("payment_method", "Unknown")
    logger.info(f"Creating store order via Komerce API. Payment method: {payment_method}")

    # Validate and calculate fees/insurance
    order_data = _validate_order(order_data)

    # Call Komerce API
    komerce_response = create_komerce_order(order_data)

    if komerce_response.get("meta", {}).get("status") == "error":
        error_message = komerce_response.get("meta", {}).get("message", "Unknown error")
        error_code = komerce_response.get("meta", {}).get("code", "")
        
        if error_code == "INSURANCE_THRESHOLD_NOT_MET" or "insurance" in error_message.lower() or "300,000" in error_message:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Product total value is below IDR 300,000 - insurance cannot be applied",
                    "error_type": "insurance_validation",
                    "original_error": error_message
                }
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Komerce API error: {error_message}")

    # Save to Local DB
    try:
        db_order = StoreOrder(
            order_date=order.order_date,
            brand_name=order.brand_name,
            shipper_name=order.shipper_name,
            shipper_phone=order.shipper_phone,
            shipper_destination_id=order.shipper_destination_id,
            shipper_address=order.shipper_address,
            shipper_email=order.shipper_email,
            receiver_name=order.receiver_name,
            receiver_phone=order.receiver_phone,
            receiver_destination_id=order.receiver_destination_id,
            receiver_address=order.receiver_address,
            shipping=order.shipping,
            shipping_type=order.shipping_type,
            payment_method=order.payment_method,
            shipping_cost=order.shipping_cost,
            shipping_cashback=order.shipping_cashback,
            service_fee=order.service_fee,
            additional_cost=order.additional_cost,
            grand_total=order.grand_total,
            cod_value=order.cod_value,
            insurance_value=order.insurance_value,
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        for detail in order.order_details:
            db_detail = OrderDetails(
                store_order_id=db_order.id,
                product_name=detail.product_name,
                product_variant_name=detail.product_variant_name,
                product_price=detail.product_price,
                product_width=detail.product_width,
                product_height=detail.product_height,
                product_weight=detail.product_weight,
                product_length=detail.product_length,
                qty=detail.qty,
                subtotal=detail.subtotal,
            )
            db.add(db_detail)
        db.commit()
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save order to local DB: {e}")
        # Note: We don't raise an exception here because the API call already succeeded.

    return komerce_response
