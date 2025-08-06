from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship
from db.database import Base

class Province(Base):
    __tablename__ = "reg_provinces"
    
    id = Column(String(2), primary_key=True, index=True) 
    name = Column(String(255), index=True)
    
    regencies = relationship("Regency", back_populates="province")

class Regency(Base):
    __tablename__ = "reg_regencies"
    
    id = Column(String(4), primary_key=True, index=True) 
    province_id = Column(String(2), ForeignKey("reg_provinces.id")) 
    name = Column(String(255), index=True)

    province = relationship("Province", back_populates="regencies")
    districts = relationship("District", back_populates="regency")

class District(Base):
    __tablename__ = "reg_districts"
    
    id = Column(String(6), primary_key=True, index=True) 
    regency_id = Column(String(4), ForeignKey("reg_regencies.id")) 
    name = Column(String(255), index=True)

    regency = relationship("Regency", back_populates="districts")
    villages = relationship("Village", back_populates="district")

class Village(Base):
    __tablename__ = "reg_villages"
    
    id = Column(String(10), primary_key=True, index=True) 
    district_id = Column(String(6), ForeignKey("reg_districts.id")) 
    name = Column(String(255), index=True)

    district = relationship("District", back_populates="villages")