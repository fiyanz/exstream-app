from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

# Impor dependency get_db dan model/schema kita
from db.database import get_db
from models import data_wilayah as models
from schemas.wilayah import WilayahBase

# Buat instance router
wilayah = APIRouter()

@wilayah.get("/provinsi", response_model=List[WilayahBase], summary="Mendapatkan Semua Provinsi")
async def get_all_provinsi(db: Session = Depends(get_db)):
    """
    Mengambil daftar semua provinsi dari database lokal.
    """
    provinces = db.query(models.Province).order_by(models.Province.name).all()
    return provinces

@wilayah.get("/kota", response_model=List[WilayahBase], summary="Mendapatkan Kota/Kabupaten berdasarkan ID Provinsi")
async def get_kota_by_provinsi(provinsi_id: str = Query(..., description="ID Provinsi dari endpoint /provinsi"), db: Session = Depends(get_db)):
    """
    Mengambil daftar kota/kabupaten untuk provinsi tertentu dari database lokal.
    """
    cities = db.query(models.Regency).filter(models.Regency.province_id == provinsi_id).order_by(models.Regency.name).all()
    if not cities:
        raise HTTPException(status_code=404, detail="Data kota/kabupaten tidak ditemukan untuk provinsi ini.")
    return cities

@wilayah.get("/kecamatan", response_model=List[WilayahBase], summary="Mendapatkan Kecamatan berdasarkan ID Kota/Kabupaten")
async def get_kecamatan_by_kota(kota_id: str = Query(..., description="ID Kota/Kabupaten dari endpoint /kota"), db: Session = Depends(get_db)):
    """
    Mengambil daftar kecamatan untuk kota/kabupaten tertentu dari database lokal.
    """
    districts = db.query(models.District).filter(models.District.regency_id == kota_id).order_by(models.District.name).all()
    if not districts:
        raise HTTPException(status_code=404, detail="Data kecamatan tidak ditemukan untuk kota/kabupaten ini.")
    return districts

@wilayah.get("/desa", response_model=List[WilayahBase], summary="Mendapatkan Desa/Kelurahan berdasarkan ID Kecamatan")
async def get_desa_by_kecamatan(kecamatan_id: str = Query(..., description="ID Kecamatan dari endpoint /kecamatan"), db: Session = Depends(get_db)):
    """
    Mengambil daftar desa/kelurahan untuk kecamatan tertentu dari database lokal.
    """
    villages = db.query(models.Village).filter(models.Village.district_id == kecamatan_id).order_by(models.Village.name).all()
    if not villages:
        raise HTTPException(status_code=404, detail="Data desa/kelurahan tidak ditemukan untuk kecamatan ini.")
    return villages