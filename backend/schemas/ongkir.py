from pydantic import BaseModel
from typing import List, Optional

class HitungOngkirRequest(BaseModel):
    # ID tujuan yang didapat dari hasil pencarian lokasi
    receiver_destination_id: int
    # Berat dalam gram
    weight: float
    # Nilai barang dalam Rupiah
    item_value: int
    # Apakah menggunakan COD atau tidak
    cod: bool = False

# Schema untuk Raja Ongkir
class RajaOngkirRequest(BaseModel):
    destination_id: int  # ID kota tujuan
    weight: int  # Berat dalam gram
    courier: str
    item_value: int

class CourierService(BaseModel):
    service: str
    description: str
    cost: int
    etd: str  # Estimated time of delivery

class CourierResult(BaseModel):
    code: str
    name: str
    costs: List[CourierService]

class LocationDetail(BaseModel):
    province: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    postal_code: Optional[str] = None

class RajaOngkirResponse(BaseModel):
    success: bool
    message: str
    origin: Optional[LocationDetail] = None
    destination: Optional[LocationDetail] = None
    weight: Optional[int] = None
    results: Optional[List[CourierResult]] = None


