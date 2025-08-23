import requests
from fastapi import APIRouter, HTTPException, Query, Depends
from core.config import settings
from schemas.ongkir import HitungOngkirRequest
from service.raja_ongkir import get_provinces, get_cities
import logging

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


# Setup logging
logger = logging.getLogger(__name__)


@cost_ongkir.get("/search-location", summary="Mencari lokasi berdasarkan keyword")
async def search_location(keyword: str = Query(..., description="Keyword pencarian lokasi (nama kota/kecamatan atau kode pos)")):
    """
    Endpoint untuk mencari lokasi berdasarkan keyword menggunakan Komerce API.
    """
    url = f"{settings.KOMERCE_BASE_URL}/destination/search"
    headers = {'x-api-key': settings.RAJA_ONGKIR_API}
    params = {'keyword': keyword}

    try:
        logger.info(f"Searching locations with keyword: {keyword}")
        response = requests.get(url, headers=headers, params=params)
        
        # Log response details
        logger.info(f"API Response status: {response.status_code}")
        logger.debug(f"API Response content: {response.text[:500]}...")  # Log first 500 chars
        
        response.raise_for_status()
        result = response.json()
        
        if result.get("meta", {}).get("status") == "success" and "data" in result:
            # Format results to match what frontend expects
            return {
                "success": True,
                "message": "Pencarian lokasi berhasil",
                "results": result["data"]
            }
        else:
            error_message = result.get("meta", {}).get("message", "Gagal mencari lokasi.")
            logger.error(f"API returned error: {error_message}")
            return {
                "success": False,
                "message": error_message
            }
            
    except requests.exceptions.RequestException as e:
        logger.exception(f"Error calling Komerce API: {str(e)}")
        return {
            "success": False,
            "message": f"Gagal menghubungi Komerce API: {str(e)}"
        }