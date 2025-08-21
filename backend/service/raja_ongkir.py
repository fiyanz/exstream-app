import requests
from core.config import settings

KOMERCE_API_KEY = settings.RAJA_ONGKIR_API
KOMERCE_BASE_URL = settings.KOMERCE_BASE_URL
RAJA_ONGKIR_BASE_URL = settings.RAJA_ONGKIR_BASE_URL
ORIGIN_CITY_ID = settings.MY_ORIGIN_DESTINATION_ID  # ID 3305: KEBUMEN, JAWA TENGAH (dari file .env)

def get_provinces():
    """Mendapatkan daftar provinsi di Indonesia"""
    url = f"{RAJA_ONGKIR_BASE_URL}/province"
    headers = {"key": KOMERCE_API_KEY}
    
    response = requests.get(url, headers=headers)
    return response.json()

def get_cities(province_id=None):
    """Mendapatkan daftar kota/kabupaten di Indonesia
    
    Args:
        province_id: ID provinsi (opsional, jika ingin filter berdasarkan provinsi)
    """
    url = f"{RAJA_ONGKIR_BASE_URL}/city"
    headers = {"key": KOMERCE_API_KEY}
    params = {}
    
    if province_id:
        params["province"] = province_id
        
    response = requests.get(url, headers=headers, params=params)
    return response.json()

def get_cost(destination_id, weight, item_value, cod):
    """Menghitung ongkos kirim menggunakan Komerce API
    
    Args:
        destination_id: ID kota/kabupaten tujuan
        weight: Berat barang dalam gram
        item_value: Nilai barang dalam Rupiah
        cod: Apakah menggunakan COD
        
    Returns:
        Dict berisi informasi ongkos kirim
    """
    url = f"{KOMERCE_BASE_URL}/calculate"
    headers = {
        "x-api-key": KOMERCE_API_KEY
    }
    params = {
        "shipper_destination_id": ORIGIN_CITY_ID,
        "receiver_destination_id": destination_id,
        "weight": weight,
        "item_value": item_value,
        "cod": "yes" if cod else "no"
    }
    
    print(f"Sending request to Komerce API: {url}")
    # print(f"Headers: {headers}")
    print(f"Parameters: {params}")
    
    try:
        response = requests.get(url, headers=headers, params=params)
        print(f"API Response status: {response.status_code}")
        
        result = response.json()
        print(f"API Response: {result}")
        
        # Check if the response indicates an error
        if "meta" in result and result["meta"].get("status") == "failed":
            print(f"Komerce API returned an error: {result['meta'].get('message')}")
        
        return result
    except requests.exceptions.RequestException as e:
        print(f"Error calling Komerce API: {str(e)}")
        return {"meta": {"status": "error", "message": str(e)}}
