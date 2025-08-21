import requests
from fastapi import APIRouter, HTTPException, Query, Depends
from core.config import settings
from schemas.ongkir import HitungOngkirRequest
from service.raja_ongkir import get_provinces, get_cities

# Buat instance router
cost_ongkir = APIRouter()

@cost_ongkir.post("/hitung", summary="Menghitung ongkos kirim ke tujuan menggunakan Komerce API")
async def calculate_shipping_cost(request_data: HitungOngkirRequest):
    """
    Endpoint untuk menghitung ongkos kirim dari berbagai ekspedisi menggunakan Komerce API.
    """
    url = f"{settings.KOMERCE_BASE_URL}/calculate"
    headers = {'x-api-key': settings.RAJA_ONGKIR_API}
    
    # Use the parameters exactly as specified in the curl example
    params = {
        'shipper_destination_id': int(settings.MY_ORIGIN_DESTINATION_ID),
        'receiver_destination_id': int(request_data.receiver_destination_id),
        'weight': float(request_data.weight),
        'item_value': int(request_data.item_value),
        'cod': "yes" if request_data.cod else "no" # Konversi boolean ke string "yes"/"no"
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        result = response.json()
        print(f"API Response: {result}")
        print(f"API Response status: {response.status_code}")

        if result.get("data"):
            return result
        else:
            error_message = result.get("message", "Gagal menghitung ongkir.")
            raise HTTPException(status_code=400, detail=error_message)

    except requests.exceptions.RequestException as e:
        print(f"Error calling Komerce API: {str(e)}")
        return {"meta": {"status": "error", "message": str(e)}}

