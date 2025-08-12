from sqlalchemy import Column, String, Integer, ForeignKey
from db.database import Base

class KotaMapping(Base):
    __tablename__ = "kota_mapping"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    local_kota_id = Column(String(4), ForeignKey("reg_regencies.id"), nullable=False)
    rajaongkir_kota_id = Column(Integer, nullable=False)
    
    # Tambahkan kolom lain jika diperlukan
