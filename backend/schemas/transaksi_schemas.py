from pydantic import BaseModel, Field
from typing import Optional

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

    class Config:
        from_attributes = True  # Mengganti orm_mode karena sudah deprecated di Pydantic V2