from pydantic import BaseModel

class HitungOngkirRequest(BaseModel):
    # ID tujuan yang didapat dari hasil pencarian lokasi
    receiver_destination_id: int
    # Berat dalam gram
    weight: float
    # Nilai barang dalam Rupiah
    item_value: int
    # Apakah menggunakan COD atau tidak
    cod: bool = False