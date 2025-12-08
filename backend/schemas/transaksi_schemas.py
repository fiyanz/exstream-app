from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TransaksiBase(BaseModel):
    no_telp: str
    nama_barang: str
    jumlah_barang: int
    total: int
    detail_barang: Optional[str] = Field(default=None, description="Detail barang dalam format JSON string")
    nama_pengguna: Optional[str] = Field(default=None, description="Nama lengkap pengguna")
    alamat: Optional[str] = Field(default=None, description="Alamat lengkap pengguna")

class TransaksiCreate(TransaksiBase):
    pass

class TransaksiOut(TransaksiBase):
    id: str
    snap_token: Optional[str] = None
    redirect_url: Optional[str] = None
    payment_status: Optional[str] = None
    message: Optional[str] = None

    class Config:
        from_attributes = True  # Mengganti orm_mode karena sudah deprecated di Pydantic V2

# Enhanced schemas for new transaction system
class OrderItem(BaseModel):
    name: str
    variant: Optional[str] = None
    color: str
    size: str
    quantity: int
    price: int
    product_weight: int = 0
    image: Optional[str] = None

class TransaksiCreateEnhanced(BaseModel):
    # Customer information
    customer_name: str
    customer_phone: str
    customer_address: str
    province: str
    city: str
    subdistrict: str
    village: str
    
    # Location names (optional, for better address display)
    province_name: Optional[str] = None
    city_name: Optional[str] = None
    subdistrict_name: Optional[str] = None
    village_name: Optional[str] = None
    
    # Order details
    items: List[OrderItem]
    shipping_method: str
    shipping_cost: int
    payment_method: str  # "cod" or "transfer"
    
    # Pricing
    subtotal: int
    discount: int
    total: int

class PaymentCallback(BaseModel):
    order_id: str
    transaction_status: str
    payment_type: str
    fraud_status: str
    gross_amount: str