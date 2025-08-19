from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime


class StoreOrderDetail(BaseModel):
    order_date: datetime
    brand_name: str
    shipper_name: str
    shipper_phone: str
    shipper_destination_id: int
    shipper_address: str
    shipper_email: str
    receiver_name: str
    receiver_phone: str
    receiver_destination_id: int
    receiver_address: str
    shipping: str
    shipping_type: str
    payment_method: str
    shipping_cost: int
    shipping_cashback: int
    service_fee: int
    additional_cost: int
    grand_total: int
    cod_value: int
    insurance_value: int
    order_details: list[Dict[str, str]] = Field(default_factory=list)

class OrderDetails(BaseModel):
    order_id: int
    product_name: str
    product_variant_name: str
    product_price: int
    product_width: int
    product_height: int
    product_weight: int
    product_length: int
    qty: int
    subtotal: int