import uuid

from sqlalchemy import CHAR, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from db.database import Base


class Barang(Base):
    __tablename__ = "transaksi"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    no_telp: Mapped[str] = mapped_column(String(20), nullable=False)
    nama_barang: Mapped[str] = mapped_column(String(2000), nullable=False)
    jumlah_barang: Mapped[int] = mapped_column(Integer, nullable=False)
    total: Mapped[int] = mapped_column(Integer, nullable=False)
    detail_barang: Mapped[str | None] = mapped_column(String(5000), nullable=True)
    nama_pengguna: Mapped[str | None] = mapped_column(String(100), nullable=True)
    alamat: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
