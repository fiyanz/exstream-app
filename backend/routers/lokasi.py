import os
import requests
from fastapi import APIRouter, HTTPException, Query
from core.config import settings


# Buat instance router
lokasi = APIRouter()


@lokasi.get("/cari", summary="Mencari destinasi berdasarkan kata kunci (nama wilayah)")
async def search_destination(keyword: str = Query(..., description="Kode pos atau nama wilayah")):
    """
    Endpoint untuk melakukan pencarian lokasi tujuan pengiriman.
    Ini akan meneruskan pencarian ke API Komerce.
    """
    # Validasi panjang karakter hanya untuk pencarian nama wilayah (bukan numerik)
    if not keyword.isdigit() and len(keyword) < 3:
        raise HTTPException(status_code=400, detail="Pencarian nama wilayah minimal 3 karakter.")

    if not settings.RAJA_ONGKIR_API or not settings.KOMERCE_BASE_URL:
        raise HTTPException(status_code=500, detail="Konfigurasi API Komerce tidak ditemukan.")

    headers = {
        'x-api-key': settings.RAJA_ONGKIR_API
    }

    param = {
        'keyword': keyword
    }

    try:
        # Panggil endpoint pencarian dari Komerce
        response = requests.get(f"{settings.KOMERCE_BASE_URL}/destination/search", headers=headers, params=param)
        response.raise_for_status() 
        
        data = response.json()
        
        # Periksa apakah respons sukses dan ada datanya
        if data.get("data"):
            return data["data"]
        else:
            # Kirim pesan error dari Komerce jika ada
            error_message = data.get("message", "Lokasi tidak ditemukan.")
            raise HTTPException(status_code=404, detail=error_message)

    except requests.exceptions.HTTPError as e:
        try:
            error_data = e.response.json()
            error_message = error_data.get("message", "Gagal terhubung ke API Komerce.")
            raise HTTPException(status_code=e.response.status_code, detail=error_message)
        except ValueError: # JSONDecodeError
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Gagal terhubung ke layanan eksternal: {e}")

