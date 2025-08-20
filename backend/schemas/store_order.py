from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime


class OrderDetailItem(BaseModel):
    product_name: str
    product_variant_name: str
    product_price: int
    product_width: int
    product_height: int
    product_weight: int
    product_length: int
    qty: int
    subtotal: int


class StoreOrderRequest(BaseModel):
    order_date: str = Field(..., description="Format: YYYY-MM-DD HH:MM:SS")
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
    shipping_cashback: int = 0
    service_fee: Optional[int] = Field(default=None, description="Service fee (typically 2.8% of grand total or COD value). Will be auto-calculated if not provided.")
    additional_cost: int = 0
    grand_total: int
    cod_value: int
    insurance_value: int = 0
    order_details: List[OrderDetailItem]
    
    @validator('service_fee', always=True)
    def validate_service_fee(cls, v, values):
        """Auto-calculate service fee if not provided"""
        if v is None or v <= 0:
            grand_total = values.get('grand_total', 0)
            cod_value = values.get('cod_value', 0)
            base_amount = max(grand_total, cod_value)
            calculated_fee = int(base_amount * 0.028)  # 2.8%
            return calculated_fee
        return v


class StoreOrderResponse(BaseModel):
    meta: dict
    data: Optional[dict] = None
    message: Optional[str] = None


class StoreOrderDetail(BaseModel):
    id: Optional[int] = None
    order_date: str
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
    order_details: List[OrderDetailItem] = Field(default_factory=list)

    class Config:
        from_attributes = True
