from fastapi import APIRouter, HTTPException, Depends
from core.config import settings
from schemas.domestic_schemas import DomesticCostRequest
import requests
import math
from sqlalchemy.orm import Session
from db.database import get_db
from models import wilayah_model as models

domesticCostRequest = APIRouter()

@domesticCostRequest.post("/domestic-cost", summary="Hitung ongkir domestik via Komerce Tariff API")
async def calculate_domestic_cost(request: DomesticCostRequest, db: Session = Depends(get_db)):
    """
    Hitung ongkos kirim domestik menggunakan Komerce Tariff API yang baru.
    
    Parameters:
    - destination: ID tujuan komerce (receiver_destination_id) atau ID Desa lokal.
    - weight: Berat paket dalam gram (nanti dikonversi)
    """
    url = f"{settings.KOMERCE_BASE_URL}/calculate"
    
    # Konversi berat ke kilogram (Komerce Tariff API)
    weight_kg = max(1, math.ceil(request.weight / 1000))
    
    # Menerjemahkan ID lokal menjadi ID Komerce
    komerce_dest_id = request.destination
    dest_str = str(request.destination)
    village = db.query(models.Village).filter(models.Village.id == dest_str).first()
    
    if village:
        # Jika ID dikenali sebagai desa di DB lokal, cari ID Komerce-nya
        search_url = f"{settings.KOMERCE_BASE_URL}/destination/search"
        search_headers = {"x-api-key": settings.SHIPPING_COST_API_KEY}
        try:
            search_res = requests.get(search_url, headers=search_headers, params={"keyword": village.name})
            if search_res.status_code == 200:
                data = search_res.json().get("data", [])
                # Coba cocokkan dengan nama kecamatan dan nama desa
                exact_match = next((item for item in data if item.get("district_name", "").upper() == village.district.name.upper() and item.get("subdistrict_name", "").upper() == village.name.upper()), None)
                if exact_match:
                    komerce_dest_id = exact_match["id"]
                elif data:
                    komerce_dest_id = data[0]["id"]
        except Exception as e:
            print(f"Warning: Failed to translate village ID {dest_str} to Komerce ID: {e}")
    
    params = {
        "shipper_destination_id": settings.MY_ORIGIN_DESTINATION_ID,
        "receiver_destination_id": komerce_dest_id,
        "weight": weight_kg, 
        "item_value": 300000,
        "cod": "yes",
    }

    headers = {
        "x-api-key": settings.SHIPPING_COST_API_KEY,
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        result = response.json()
        
        if result.get("meta", {}).get("status") != "success":
            return result
            
        komerce_data = result.get("data", {})
        
        # Ekstrak kurir reguler dan cargo
        regular_couriers = komerce_data.get("calculate_reguler", [])
        cargo_couriers = komerce_data.get("calculate_cargo", [])
        
        all_couriers = regular_couriers + cargo_couriers
        
        # Mapping format baru Komerce ke format flat yang diekspektasi oleh frontend
        formatted_data = []
        regular_keywords = ["reguler", "regular", "reg", "ez", "standard", "ekonomi", "economy"]
        
        for item in all_couriers:
            code = item.get("shipping_name", "").lower()
            name = item.get("shipping_name", "")
            service = item.get("service_name", "")
            cost = item.get("shipping_cost", 0)
            raw_etd = item.get("etd", "-")
            
            # 1. Filter only regular services (Moved from frontend)
            name_lower = service.lower()
            if not any(kw in name_lower for kw in regular_keywords):
                continue
                
            # 2. Format ETD (Moved from frontend)
            etd = "1-3 hari" if not raw_etd or raw_etd == "-" else raw_etd
            if "day" in etd:
                etd = etd.replace("day", "hari")
            elif etd.replace("-", "").isdigit():
                etd = f"{etd} hari"
                
            # 3. Format currency
            cost_formatted = f"{cost:,}".replace(",", ".")
            
            # 4. Final label for UI
            label = f"{name} - {service} - Rp {cost_formatted} ({etd})"
            
            formatted_data.append({
                "id": f"{code}-{service}",
                "name": f"{name} - {service}",
                "code": code,
                "service": service,
                "cost": cost,
                "etd": etd,
                "label": label
            })
            
        return {
            "meta": result.get("meta"),
            "data": formatted_data
        }

    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Komerce Tariff API: {e}")
        
        if 'response' in locals() and hasattr(response, 'text'):
            print("Response Content:", response.text)
            try:
                error_data = response.json()
                return error_data
            except:
                pass
                
        raise HTTPException(
            status_code=503,
            detail=f"Gagal terhubung ke layanan pengiriman: {e}"
        )
