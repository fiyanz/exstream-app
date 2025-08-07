import uuid

from sqlalchemy import Column, ForeignKey, String, CHAR
from sqlalchemy.orm import relationship
from backend.db.database import Base

class Barang(Base):
    __tablename__ = "transaksi"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama_barang = Column(String(255), nullable=False)
