import requests
from fastapi import APIRouter, HTTPException, Query, Depends
from core.config import settings
from schemas.ongkir import HitungOngkirRequest

# Buat instance router
pengiriman = APIRouter()

@pengiriman.post("/hitung", summary="Menghitung ongkos kirim ke tujuan")
async def calculate_shipping_cost(request_data: HitungOngkirRequest):
    """
    Endpoint untuk menghitung ongkos kirim dari berbagai ekspedisi.
    """
    headers = {'x-api-key': settings.RAJA_ONGKIR_API}
    
    params = {
        'shipper_destination_id': settings.MY_ORIGIN_DESTINATION_ID,
        'receiver_destination_id': request_data.receiver_destination_id,
        'weight': request_data.weight,
        'item_value': request_data.item_value,
        'cod': "yes" if request_data.cod else "no" # Konversi boolean ke string "yes"/"no"
    }

    try:
        response = requests.get(f"{settings.KOMERCE_BASE_URL}/calculate", headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get("data"):
            return data["data"]
        else:
            error_message = data.get("message", "Gagal menghitung ongkir.")
            raise HTTPException(status_code=400, detail=error_message)
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Gagal terhubung ke API eksternal: {e}")