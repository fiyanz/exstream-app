"""
router untuk mengelola destinasi endpoint dari api raja ongkir v1
"""

from fastapi import APIRouter, HTTPException
from core.config import settings
from schemas.domestic import DomesticCostRequest
import requests
from utils.get_id_distric import extract_city_id_from_village

domesticCostRequest = APIRouter()

@domesticCostRequest.post("/domestic-cost", summary="Hitung ongkir domestik via Komerce RajaOngkir")
async def calculate_domestic_cost(request: DomesticCostRequest):
    """
    Hitung ongkos kirim domestik menggunakan Komerce RajaOngkir API.
    """

    url = f"{settings.RAJA_ONGKIR_BASE_URL}/calculate/district/domestic-cost"
    headers = {
        "key": settings.SHIPPING_COST_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }


    origin = settings.MY_ORIGIN_DESTINATION_ID
    if not origin:
        raise HTTPException(status_code=500, detail="MY_ORIGIN_CODE belum di-set di .env")


    # Extract city ID from the village/subdistrict ID
    destination_city_id = extract_city_id_from_village(request.destination)
    # print(f"DEBUG: Converting destination ID {request.destination} to city ID {destination_city_id}")

    # payload sesuai dokumentasi
    payload = {
        "origin": settings.MY_ORIGIN_DESTINATION_ID,
        "destination": destination_city_id,
        "weight": request.weight,
        "courier": request.courier,
        "price": request.price
    }

    try:
        response = requests.post(url, headers=headers, data=payload)
        print("DEBUG STATUS:", response.status_code)
        print("DEBUG BODY:", response.text)
        response.raise_for_status()
        
        # Parse the response
        result = response.json()
        
        # If we have a valid response but empty data, provide a more helpful error
        if 'data' in result and (result['data'] is None or len(result['data']) == 0):
            return {
                "meta": {
                    "status": "error",
                    "message": "Tidak ada data pengiriman tersedia untuk tujuan ini. Silahkan coba destinasi lain."
                },
                "data": []
            }
            
        return result
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Komerce RajaOngkir: {e}")
        
        # Try to parse error response if available
        if 'response' in locals() and hasattr(response, 'text'):
            try:
                error_data = response.json()
                if error_data.get('meta', {}).get('status') == 'error':
                    # Just pass through the API error
                    return error_data
            except:
                pass
                
        # Fallback error as HTTP exception
        raise HTTPException(
            status_code=503,
            detail=f"Gagal terhubung ke layanan pengiriman: {e}"
        )
