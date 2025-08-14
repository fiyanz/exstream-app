# Phone Number Formatting for Midtrans Integration

## Problem
Midtrans memerlukan format nomor telepon dengan prefix "+62" untuk transaksi di Indonesia. Tanpa format yang benar, transaksi mungkin gagal atau tidak terverifikasi dengan baik.

## Solution
Menambahkan fungsi `format_phone_number()` yang secara otomatis memformat nomor telepon ke format yang dibutuhkan Midtrans.

## Implementation

### 1. Helper Function
```python
def format_phone_number(phone: str) -> str:
    """
    Format phone number to include +62 prefix for Midtrans
    """
    if not phone:
        return phone
    
    # Remove any existing +62 prefix
    if phone.startswith('+62'):
        return phone
    
    # Remove leading 0 if present
    if phone.startswith('0'):
        phone = phone[1:]
    
    # Add +62 prefix
    return f"+62{phone}"
```

### 2. Usage Examples

#### Input → Output
- `"81234567890"` → `"+6281234567890"`
- `"081234567890"` → `"+6281234567890"`
- `"+6281234567890"` → `"+6281234567890"` (no change)
- `"1234567890"` → `"+621234567890"`

### 3. Integration Points

#### A. Store Order Data
```python
# Format phone number for consistency
formatted_phone = format_phone_number(order.customer_phone)

# Use in customer_info
"customer_info": {
    "phone": formatted_phone,
    # ... other fields
}

# Use in database
transaksi_db = Barang(
    no_telp=formatted_phone,
    # ... other fields
)
```

#### B. Midtrans Customer Data
```python
# Format phone number for Midtrans
formatted_phone = format_phone_number(order.customer_phone)

customer = {
    "phone": formatted_phone,
    "billing_address": {
        "phone": formatted_phone,
        # ... other fields
    },
    "shipping_address": {
        "phone": formatted_phone,
        # ... other fields
    }
}
```

## Benefits

### 1. Midtrans Compatibility
- ✅ Nomor telepon selalu dalam format yang benar
- ✅ Transaksi lebih mudah diverifikasi
- ✅ Mengurangi kemungkinan error payment

### 2. Data Consistency
- ✅ Format nomor telepon konsisten di database
- ✅ Format sama untuk semua endpoint
- ✅ Mudah untuk maintenance

### 3. User Experience
- ✅ User bisa input nomor dengan atau tanpa 0
- ✅ Otomatis dikonversi ke format yang benar
- ✅ Tidak perlu mengubah input user

## Testing

### Test Cases
```python
# Test the formatting function
assert format_phone_number("81234567890") == "+6281234567890"
assert format_phone_number("081234567890") == "+6281234567890"
assert format_phone_number("+6281234567890") == "+6281234567890"
assert format_phone_number("1234567890") == "+621234567890"
assert format_phone_number("") == ""
assert format_phone_number(None) == None
```

### Manual Testing
1. **Input nomor tanpa 0**: `81234567890`
   - Expected: `+6281234567890`
   - Check database: `no_telp` field
   - Check Midtrans: customer phone field

2. **Input nomor dengan 0**: `081234567890`
   - Expected: `+6281234567890`
   - Check database: `no_telp` field
   - Check Midtrans: customer phone field

3. **Input sudah dengan +62**: `+6281234567890`
   - Expected: `+6281234567890` (no change)
   - Check database: `no_telp` field
   - Check Midtrans: customer phone field

## Database Impact

### Before
```sql
-- Example data
INSERT INTO transaksi (no_telp) VALUES ('081234567890');
INSERT INTO transaksi (no_telp) VALUES ('81234567890');
INSERT INTO transaksi (no_telp) VALUES ('+6281234567890');
```

### After
```sql
-- All formatted consistently
INSERT INTO transaksi (no_telp) VALUES ('+6281234567890');
INSERT INTO transaksi (no_telp) VALUES ('+6281234567890');
INSERT INTO transaksi (no_telp) VALUES ('+6281234567890');
```

## Midtrans Requirements

### Phone Number Format
- **Country Code**: `+62` (Indonesia)
- **Format**: `+62XXXXXXXXXX`
- **Length**: 10-13 digits (excluding +62)
- **Example**: `+6281234567890`

### Validation
- ✅ Must start with `+62`
- ✅ Must be valid Indonesian mobile number
- ✅ Used for SMS notifications
- ✅ Used for payment verification

## Error Handling

### Invalid Phone Numbers
```python
def format_phone_number(phone: str) -> str:
    if not phone:
        return phone
    
    # Basic validation
    if len(phone) < 9:  # Too short
        return phone  # Return as-is, let Midtrans handle validation
    
    # ... rest of formatting logic
```

### Edge Cases
- Empty string: return as-is
- None value: return as-is
- Invalid format: return as-is (let Midtrans validate)
- Very long numbers: truncate if needed

## Future Enhancements

### 1. Phone Number Validation
```python
import re

def is_valid_indonesian_phone(phone: str) -> bool:
    """
    Validate Indonesian phone number format
    """
    pattern = r'^\+62[0-9]{9,12}$'
    return bool(re.match(pattern, phone))
```

### 2. Phone Number Normalization
```python
def normalize_phone_number(phone: str) -> str:
    """
    Remove all non-digit characters except +
    """
    import re
    return re.sub(r'[^\d+]', '', phone)
```

### 3. Country Code Detection
```python
def detect_country_code(phone: str) -> str:
    """
    Detect country code from phone number
    """
    if phone.startswith('+62'):
        return '+62'
    elif phone.startswith('0'):
        return '+62'
    else:
        return '+62'  # Default to Indonesia
```

## Monitoring

### Log Examples
```python
# Log phone number formatting
print(f"Original phone: {order.customer_phone}")
print(f"Formatted phone: {formatted_phone}")

# Log Midtrans customer data
print(f"Customer data for Midtrans: {customer}")
```

### Database Queries
```sql
-- Check phone number formats
SELECT no_telp, 
       CASE 
           WHEN no_telp LIKE '+62%' THEN 'Correct Format'
           ELSE 'Needs Formatting'
       END as format_status
FROM transaksi 
WHERE no_telp IS NOT NULL;

-- Count by format
SELECT 
    CASE 
        WHEN no_telp LIKE '+62%' THEN 'Correct Format'
        WHEN no_telp LIKE '0%' THEN 'Leading Zero'
        WHEN no_telp LIKE '62%' THEN 'Missing Plus'
        ELSE 'Other Format'
    END as format_type,
    COUNT(*) as count
FROM transaksi 
WHERE no_telp IS NOT NULL
GROUP BY format_type;
```
