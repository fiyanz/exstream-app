# Database Fix for Multiple Items

## Problem
Error ketika membeli lebih dari 2 item:
```
(pymysql.err.DataError) (1406, "Data too long for column 'nama_barang' at row 1")
```

## Root Cause
Kolom database terlalu pendek untuk menyimpan JSON string yang panjang:
- `nama_barang`: VARCHAR(255) → Terlalu pendek untuk JSON array
- `detail_barang`: VARCHAR(1000) → Terlalu pendek untuk detail lengkap

## Solution Implemented

### 1. Updated Database Schema
```sql
-- Before
nama_barang VARCHAR(255) NOT NULL
detail_barang VARCHAR(1000) NULL

-- After  
nama_barang VARCHAR(2000) NOT NULL  -- Increased for JSON data
detail_barang VARCHAR(5000) NULL    -- Increased for detailed JSON
```

### 2. Schema Update Script
Created `update_database_schema.py` to safely update existing database:
```bash
cd backend
source .venv/bin/activate
python update_database_schema.py
```

### 3. Results
```
✅ Updated nama_barang to VARCHAR(2000)
✅ Updated detail_barang to VARCHAR(5000)
✅ Database schema updated successfully!
```

## Data Structure

### Single Item JSON (Short)
```json
[{"name": "Jas Hujan Extrime", "color": "Pink Muda", "size": "XL", "quantity": 1, "price": 299000}]
```
**Length**: ~150 characters

### Multiple Items JSON (Long)
```json
[
  {"name": "Jas Hujan Extrime", "color": "Pink Muda", "size": "XL", "quantity": 1, "price": 299000},
  {"name": "Jas Hujan Extrime", "color": "Beige / Khaki", "size": "XXL", "quantity": 1, "price": 299000}
]
```
**Length**: ~300+ characters

### Complete Order Details (Very Long)
```json
{
  "items": [...],
  "shipping_method": "...",
  "shipping_cost": 20000,
  "payment_method": "transfer",
  "subtotal": 598000,
  "discount": 299000,
  "total": 319000,
  "customer_info": {...}
}
```
**Length**: 1000+ characters

## Testing

### Before Fix
- ❌ Error when adding 2+ items
- ❌ Database constraint violation
- ❌ Transaction fails

### After Fix
- ✅ Can add multiple items
- ✅ JSON data stored successfully
- ✅ Transaction completes normally

## Verification

### Check Current Schema
```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'your_database' AND TABLE_NAME = 'transaksi';
```

### Expected Output
```
nama_barang: varchar(2000)
detail_barang: varchar(5000)
```

## Notes

- **Backward Compatible**: Existing data remains intact
- **Future Proof**: Can handle larger orders
- **Safe Update**: Script includes error handling and rollback
- **No Data Loss**: Only increases column sizes, doesn't modify data
