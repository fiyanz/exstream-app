from sqlalchemy.orm import Session
from models.wilayah_model import Province, Regency, District, Village

def get_location_names(db: Session, province_id: str, city_id: str, subdistrict_id: str, village_id: str):
    """
    Get location names from IDs
    """
    try:
        province = db.query(Province).filter(Province.id == province_id).first()
        city = db.query(Regency).filter(Regency.id == city_id).first()
        subdistrict = db.query(District).filter(District.id == subdistrict_id).first()
        village = db.query(Village).filter(Village.id == village_id).first()
        
        return {
            "province_name": province.name if province else f"Provinsi {province_id}",
            "city_name": city.name if city else f"Kota {city_id}",
            "subdistrict_name": subdistrict.name if subdistrict else f"Kecamatan {subdistrict_id}",
            "village_name": village.name if village else f"Desa {village_id}"
        }
    except Exception as e:
        print(f"Error getting location names: {e}")
        return {
            "province_name": f"Provinsi {province_id}",
            "city_name": f"Kota {city_id}",
            "subdistrict_name": f"Kecamatan {subdistrict_id}",
            "village_name": f"Desa {village_id}"
        }