"""
router untuk mengelola destinasi endpoint dari api raja ongkir v1
"""

from fastapi import APIRouter, HTTPException
from core.config import settings
from schemas.domestic import DomesticCostRequest
import requests

domesticCostRequest = APIRouter()

@domesticCostRequest.post("/domestic-cost", summary="Hitung ongkir domestik via Komerce RajaOngkir")
async def calculate_domestic_cost(request: DomesticCostRequest):
    """
    Hitung ongkos kirim domestik menggunakan Komerce RajaOngkir API.
    """

    url = f"{settings.RAJA_ONGKIR_DOMESTIC_URL}/calculate/district/domestic-cost"
    headers = {
        "key": settings.SHIPPING_COST_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }


    origin = settings.MY_ORIGIN_DESTINATION_ID
    if not origin:
        raise HTTPException(status_code=500, detail="MY_ORIGIN_CODE belum di-set di .env")


    # payload sesuai dokumentasi
    payload = {
        "origin": settings.MY_ORIGIN_DESTINATION_ID,
        "destination": request.destination,
        "weight": request.weight,
        "courier": request.courier,
        "price": request.price
    }

    try:
        response = requests.post(url, headers=headers, data=payload)
        print("DEBUG STATUS:", response.status_code)
        print("DEBUG BODY:", response.text)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Gagal terhubung ke API Komerce RajaOngkir: {e} | Response: {response.text if 'response' in locals() else ''}"
        )
