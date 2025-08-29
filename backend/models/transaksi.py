import uuid

from sqlalchemy import Column, ForeignKey, String, CHAR, Integer
from sqlalchemy.orm import relationship
from db.database import Base

class Barang(Base):
    __tablename__ = "transaksi"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    no_telp = Column(String(20), nullable=False)
    nama_barang = Column(String(2000), nullable=False)  # Increased for JSON data
    jumlah_barang = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    detail_barang = Column(String(5000), nullable=True)  # Increased for detailed JSON
    status = Column(String(50), nullable=False, default="pending")
    
    # Tambahan informasi pengguna
    nama_pengguna = Column(String(100), nullable=True)
    alamat = Column(String(500), nullable=True)
    status = Column(String(50), nullable=True, default="pending")  # Status pembayaran

