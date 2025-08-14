# Midtrans Address Display Fix

## Problem
Alamat yang diinput user tidak masuk ke Midtrans dengan format yang lengkap dan readable.

## Solution
Tambahkan fungsi untuk mengambil nama lokasi dari database dan format alamat yang lengkap untuk Midtrans.

### 1. Location Names Helper Function
```python
def get_location_names(db: Session, province_id: str, city_id: str, subdistrict_id: str, village_id: str):
    """
    Get location names from IDs
    """
    try:
        province = db.query(Provinsi).filter(Provinsi.id == province_id).first()
        city = db.query(Kota).filter(Kota.id == city_id).first()
        subdistrict = db.query(Kecamatan).filter(Kecamatan.id == subdistrict_id).first()
        village = db.query(Desa).filter(Desa.id == village_id).first()
        
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
```

### 2. Enhanced Customer Data
```python
# Get location names from database
location_names = get_location_names(db, order.province, order.city, order.subdistrict, order.village)

# Build complete address with actual location names
complete_address = f"{order.customer_address}, {location_names['village_name']}, {location_names['subdistrict_name']}, {location_names['city_name']}, {location_names['province_name']}"

customer = {
    "first_name": order.customer_name,
    "last_name": "",
    "email": f"{order.customer_phone}@example.com",
    "phone": order.customer_phone,
    "billing_address": {
        "first_name": order.customer_name,
        "last_name": "",
        "phone": order.customer_phone,
        "address": complete_address,  # Use complete address
        "city": location_names['city_name'],  # Use actual city name
        "postal_code": "00000",
        "country_code": "IDN"
    },
    "shipping_address": {
        "first_name": order.customer_name,
        "last_name": "",
        "phone": order.customer_phone,
        "address": complete_address,  # Use complete address
        "city": location_names['city_name'],  # Use actual city name
        "postal_code": "00000",
        "country_code": "IDN"
    }
}
```

## Data Flow

### Input Data
```
Customer Address: "Jl. Contoh No. 123"
Province ID: "32"
City ID: "3201"
Subdistrict ID: "320101"
Village ID: "32010101"
```

### Database Lookup
```
Province ID "32" → "JAWA BARAT"
City ID "3201" → "BOGOR"
Subdistrict ID "320101" → "BOGOR SELATAN"
Village ID "32010101" → "BATU TULIS"
```

### Complete Address for Midtrans
```
"Jl. Contoh No. 123, BATU TULIS, BOGOR SELATAN, BOGOR, JAWA BARAT"
```

### Midtrans Display
```
Customer details:
Name: jamal
Mobile number: 8834242424
E-mail: 8834242424@example.com
Address: Jl. Contoh No. 123, BATU TULIS, BOGOR SELATAN, BOGOR, JAWA BARAT
```

## Benefits

### 1. Complete Address Information
- ✅ Alamat lengkap dengan nama lokasi yang sebenarnya
- ✅ Format yang readable dan mudah dipahami
- ✅ Informasi lokasi yang akurat

### 2. Better User Experience
- ✅ User melihat alamat yang mereka input dengan benar
- ✅ Tidak ada kebingungan dengan ID lokasi
- ✅ Alamat yang jelas untuk pengiriman

### 3. Midtrans Integration
- ✅ Alamat lengkap di Midtrans dashboard
- ✅ Informasi customer yang akurat
- ✅ Memudahkan tracking dan pengiriman

## Testing

### Test Flow
1. **Add items to cart**
2. **Fill shipping form with complete address**
3. **Click "Beli Pesanan"**
4. **Check console logs**:
   ```
   Customer data for Midtrans: {
     "first_name": "jamal",
     "phone": "8834242424",
     "billing_address": {
       "address": "Jl. Contoh No. 123, BATU TULIS, BOGOR SELATAN, BOGOR, JAWA BARAT"
     }
   }
   ```
5. **Verify Midtrans shows complete address**

### Expected Results
- ✅ Alamat lengkap ditampilkan di Midtrans
- ✅ Nama lokasi yang sebenarnya (bukan ID)
- ✅ Format alamat yang mudah dibaca
- ✅ Informasi customer yang akurat

## Key Changes

### Backend Changes
1. **`transaksi.py`**: Added location names helper function
2. **Customer data**: Enhanced with complete address
3. **Database integration**: Fetch actual location names

### Database Requirements
- ✅ `Provinsi` table with `id` and `name` columns
- ✅ `Kota` table with `id` and `name` columns
- ✅ `Kecamatan` table with `id` and `name` columns
- ✅ `Desa` table with `id` and `name` columns

## Error Handling

### Fallback Strategy
- ✅ If location name not found, use ID as fallback
- ✅ Log errors for debugging
- ✅ Graceful degradation

### Example Fallback
```
Error getting location names: Database connection failed
Fallback address: "Jl. Contoh No. 123, Desa 32010101, Kecamatan 320101, Kota 3201, Provinsi 32"
```

## Important Notes

### Performance Considerations
- ✅ Database queries for location names
- ✅ Consider caching for frequently used locations
- ✅ Optimize queries for better performance

### Data Accuracy
- ✅ Ensure location data is up-to-date
- ✅ Validate location IDs before lookup
- ✅ Handle missing location data gracefully
