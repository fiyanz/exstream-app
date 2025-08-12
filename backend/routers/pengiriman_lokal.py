from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import requests

from service.raja_ongkir import get_cost
from core.config import settings
from db.database import get_db
from models.data_wilayah import Province, Regency, District, Village
from schemas.ongkir import HitungOngkirRequest, RajaOngkirResponse, CourierService, CourierResult, LocationDetail

# Router
pengiriman_lokal = APIRouter()

@pengiriman_lokal.post("/cek-ongkir", response_model=RajaOngkirResponse, summary="Cek Ongkos Kirim")
async def cek_ongkir(
    request: HitungOngkirRequest,
    db: Session = Depends(get_db)
):
    """
    Menghitung ongkos kirim menggunakan Komerce API.
    
    - receiver_destination_id: ID kota tujuan 
    - weight: Berat barang dalam gram
    - item_value: Nilai barang dalam Rupiah
    - cod: Apakah menggunakan COD (default: false)
    """
    try:
        # Ambil data origin terlebih dahulu
        origin_id = settings.MY_ORIGIN_DESTINATION_ID
        origin_regency = db.query(Regency).filter(Regency.id == origin_id).first()
        
        # Pastikan origin_detail selalu diinisialisasi dengan nilai default
        # ID 3305 adalah untuk Kebumen, Jawa Tengah
        origin_detail = LocationDetail(
            city="KEBUMEN", 
            province="JAWA TENGAH"
        )
        
        if origin_regency:
            origin_detail = LocationDetail(
                city=origin_regency.name,
                province=origin_regency.province.name
            )
        
        # Validasi kota tujuan - sesuai dengan receiver_destination_id
        destination_id = str(request.receiver_destination_id)
        
        # Cek apakah ini ID kota, kecamatan, atau desa berdasarkan panjang ID
        location_detail = LocationDetail()
        
        if len(destination_id) == 10:  # ID Desa
            village = db.query(Village).filter(Village.id == destination_id).first()
            if not village:
                return RajaOngkirResponse(
                    success=False,
                    message=f"Desa dengan ID {destination_id} tidak ditemukan",
                    origin=origin_detail,
                    weight=request.weight
                )
            district = village.district
            regency = district.regency
            province = regency.province
            
            location_detail.village = village.name
            location_detail.district = district.name
            location_detail.city = regency.name
            location_detail.province = province.name
            
        elif len(destination_id) == 6:  # ID Kecamatan
            district = db.query(District).filter(District.id == destination_id).first()
            if not district:
                return RajaOngkirResponse(
                    success=False,
                    message=f"Kecamatan dengan ID {destination_id} tidak ditemukan",
                    origin=origin_detail,
                    weight=request.weight
                )
            regency = district.regency
            province = regency.province
            
            location_detail.district = district.name
            location_detail.city = regency.name
            location_detail.province = province.name
            
        elif len(destination_id) == 4:  # ID Kota
            regency = db.query(Regency).filter(Regency.id == destination_id).first()
            if not regency:
                return RajaOngkirResponse(
                    success=False,
                    message=f"Kota dengan ID {destination_id} tidak ditemukan",
                    origin=origin_detail,
                    weight=request.weight
                )
            province = regency.province
            
            location_detail.city = regency.name
            location_detail.province = province.name
        else:
            return RajaOngkirResponse(
                success=False,
                message=f"Format ID lokasi tidak valid: {destination_id}",
                origin=origin_detail,
                weight=request.weight
            )
            
        # Origin details are already initialized at the beginning of the function
        
        # Ekstrak ID kota dari ID lokasi (kota, kecamatan, atau desa)
        city_id = destination_id
        if len(destination_id) == 6:  # Jika ID kecamatan, ambil 4 digit pertama untuk kota
            city_id = destination_id[:4]
        elif len(destination_id) == 10:  # Jika ID desa, ambil 4 digit pertama untuk kota
            city_id = destination_id[:4]
            
        print(f"Using city ID: {city_id} extracted from {destination_id}")
        
        # Panggil Komerce API dengan ID kota
        response = get_cost(
            destination_id=city_id,  # Gunakan ID kota yang sudah diekstrak
            weight=request.weight,
            item_value=request.item_value,
            cod=request.cod
        )
        
        # Debug: Cek tipe data dan struktur respon
        print(f"Response type: {type(response)}")
        print(f"Response full: {response}")
        
        # Cek apakah response adalah dictionary
        if not isinstance(response, dict):
            return RajaOngkirResponse(
                success=False,
                message=f"API response tidak valid: {response}",
                origin=origin_detail,
                destination=location_detail,
                weight=request.weight
            )

        # Format response dari Komerce API
        if isinstance(response, dict) and response.get("data"):
            results = []
            couriers_grouped = {}
            
            # Log the response for debugging
            print(f"Response data structure: {response['data'].keys() if isinstance(response['data'], dict) else type(response['data'])}")
            
            # Komerce API response format has nested categories
            data = response["data"]
            all_shipping_options = []
            
            # Process calculate_reguler, calculate_cargo, calculate_instant
            if isinstance(data, dict):
                for category in ["calculate_reguler", "calculate_cargo", "calculate_instant"]:
                    if category in data and isinstance(data[category], list):
                        for item in data[category]:
                            if isinstance(item, dict):
                                # Adjust the cost - Komerce returns values like 27000000 for 27,000
                                original_cost = item.get("shipping_cost", 0)
                                # If cost > 10000, divide by 1000 to get a more reasonable value (in thousands)
                                # Keep the pricing in reasonable range (e.g. 72,000 instead of 72)
                                adjusted_cost = original_cost / 10 if original_cost > 10000 else original_cost
                                
                                courier_item = {
                                    "courier_code": item.get("shipping_name", "UNKNOWN").upper(),
                                    "courier_name": item.get("shipping_name", "Unknown"),
                                    "service_code": item.get("service_name", "Regular"),
                                    "service_name": item.get("service_name", "Layanan Reguler"),
                                    "cost": int(adjusted_cost),
                                    "etd": item.get("etd", "1-3")
                                }
                                all_shipping_options.append(courier_item)
            
            # Group by courier first
            for courier_data in all_shipping_options:
                # Pastikan courier_data adalah dictionary
                if not isinstance(courier_data, dict):
                    print(f"Skipping non-dictionary courier data: {courier_data}")
                    continue
                    
                courier_code = courier_data["courier_code"].lower()
                courier_name = courier_data["courier_name"]
                
                if courier_code not in couriers_grouped:
                    couriers_grouped[courier_code] = {
                        "code": courier_code,
                        "name": courier_name,
                        "costs": []
                    }
                
                # Add service to this courier with safe access
                etd_value = courier_data.get("etd", "1-3")
                
                # Format ETD correctly (avoid duplicate "hari")
                if "day" in etd_value.lower():
                    formatted_etd = etd_value.replace("day", "").strip()
                else:
                    formatted_etd = etd_value
                
                if not formatted_etd:
                    formatted_etd = "1-3"
                
                service_data = {
                    "service": courier_data.get("service_code", "Regular"),
                    "description": courier_data.get("service_name", "Layanan Reguler"),
                    "cost": int(courier_data.get("cost", 0)),  # Convert to integer, default 0
                    "etd": formatted_etd + " hari"
                }
                couriers_grouped[courier_code]["costs"].append(service_data)
            
            # Convert grouped data to list
            for courier_code, courier_data in couriers_grouped.items():
                results.append(courier_data)
            
            return RajaOngkirResponse(
                success=True,
                message="Ongkos kirim berhasil dihitung",
                origin=origin_detail,
                destination=location_detail,
                weight=request.weight,
                results=results
            )
        else:
            error_message = response.get("message", "Gagal menghitung ongkos kirim")
            return RajaOngkirResponse(
                success=False,
                message=error_message,
                origin=origin_detail,
                destination=location_detail,
                weight=request.weight
            )
    except Exception as e:
        return RajaOngkirResponse(
            success=False,
            message=f"Terjadi kesalahan: {str(e)}",
            origin=origin_detail,
            destination=location_detail,
            weight=request.weight
        )
