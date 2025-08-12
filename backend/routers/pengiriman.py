import requests
from fastapi import APIRouter, HTTPException, Query, Depends
from core.config import settings
from schemas.ongkir import HitungOngkirRequest, RajaOngkirRequest, RajaOngkirResponse
from service.raja_ongkir import get_provinces, get_cities, get_cost

# Buat instance router
pengiriman = APIRouter()

@pengiriman.post("/hitung", summary="Menghitung ongkos kirim ke tujuan menggunakan Komerce API")
async def calculate_shipping_cost(request_data: HitungOngkirRequest):
    """
    Endpoint untuk menghitung ongkos kirim dari berbagai ekspedisi menggunakan Komerce API.
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

@pengiriman.get("/provinsi", summary="Mendapatkan daftar provinsi")
async def get_all_provinces():
    """
    Mendapatkan daftar provinsi di Indonesia dari Raja Ongkir API.
    """
    try:
        response = get_provinces()
        
        if response.get("rajaongkir", {}).get("status", {}).get("code") == 200:
            return {
                "success": True,
                "message": "Daftar provinsi berhasil didapat",
                "results": response["rajaongkir"]["results"]
            }
        else:
            error_message = response.get("rajaongkir", {}).get("status", {}).get("description", "Gagal mendapatkan data provinsi")
            raise HTTPException(status_code=400, detail=error_message)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Gagal terhubung ke Raja Ongkir API: {str(e)}")

@pengiriman.get("/kota", summary="Mendapatkan daftar kota")
async def get_all_cities(province_id: int = None):
    """
    Mendapatkan daftar kota/kabupaten di Indonesia dari Raja Ongkir API.
    
    Optional query parameter:
    - province_id: ID provinsi jika ingin memfilter kota berdasarkan provinsi
    """
    try:
        response = get_cities(province_id)
        
        if response.get("rajaongkir", {}).get("status", {}).get("code") == 200:
            return {
                "success": True,
                "message": "Daftar kota berhasil didapat",
                "results": response["rajaongkir"]["results"]
            }
        else:
            error_message = response.get("rajaongkir", {}).get("status", {}).get("description", "Gagal mendapatkan data kota")
            raise HTTPException(status_code=400, detail=error_message)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Gagal terhubung ke Raja Ongkir API: {str(e)}")

@pengiriman.post("/cek-ongkir", response_model=RajaOngkirResponse, summary="Cek ongkir dengan Raja Ongkir")
async def check_shipping_cost(request_data: RajaOngkirRequest):
    """
    Menghitung ongkos kirim menggunakan Raja Ongkir API.
    
    Parameters:
    - destination_id: ID kota tujuan
    - weight: Berat barang dalam gram
    - courier: Kode kurir (jne, pos, tiki)
    """
    try:
        response = get_cost(
            destination_id=request_data.destination_id,
            weight=request_data.weight,
            courier=request_data.courier.lower()
        )
        
        if response.get("rajaongkir", {}).get("status", {}).get("code") == 200:
            results = []
            for result in response["rajaongkir"]["results"]:
                courier_result = {
                    "code": result["code"],
                    "name": result["name"],
                    "costs": []
                }
                
                for cost in result["costs"]:
                    service_data = {
                        "service": cost["service"],
                        "description": cost["description"],
                        "cost": cost["cost"][0]["value"],
                        "etd": cost["cost"][0]["etd"]
                    }
                    courier_result["costs"].append(service_data)
                
                results.append(courier_result)
            
            return {
                "success": True,
                "message": "Ongkos kirim berhasil dihitung",
                "results": results
            }
        else:
            error_message = response.get("rajaongkir", {}).get("status", {}).get("description", "Gagal menghitung ongkos kirim")
            return {
                "success": False,
                "message": error_message,
                "results": None
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Gagal terhubung ke Raja Ongkir API: {str(e)}",
            "results": None
        }