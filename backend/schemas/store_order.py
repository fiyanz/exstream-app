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
    service_fee: Optional[int] = Field(default=None, description="Service fee (2.8% of grand total, minimum 3000). Will be auto-calculated if not provided.")
    additional_cost: int = 0
    grand_total: int
    cod_value: int
    insurance_value: Optional[int] = Field(default=0, description="Insurance value based on courier policies. Will be auto-calculated if not provided.")
    order_details: List[OrderDetailItem]
    
    # Note: Removing schema-level validators since we're using the service_store.py
    # implementation for more complex logic. This way we don't have the logic duplicated.
    # The service will handle both service fee and insurance value calculations


class StoreOrderResponse(BaseModel):
    meta: dict
    data: Optional[dict] = None
    message: Optional[str] = None
    # Additional fields to make the response compatible with frontend expectations
    id: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    grand_total: Optional[int] = None
    order_date: Optional[str] = None
    token: Optional[str] = None
    redirect_url: Optional[str] = None
    
    class Config:
        # This allows extra fields to be included
        extra = "allow"


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


class StoreOrderListResponse(BaseModel):
    nama_pengguna: str
    no_telp: str
    alamat: str
    nama_barang: str
