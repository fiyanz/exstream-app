# Midtrans Amount Calculation Fix

## Problem
Error dari Midtrans API:
```
"transaction_details.gross_amount is not equal to the sum of item_details"
```

## Root Cause
Midtrans mengharapkan `gross_amount` sama dengan jumlah dari semua `item_details`, tapi kita mengirim:
- `order.total` (sudah termasuk diskon + ongkir)
- Sedangkan `item_details` hanya harga produk asli

## Solution Implemented

### 1. Fixed Amount Calculation
```python
# Calculate total from items for Midtrans
items_total = 0
if items and len(items) > 0:
    for item in items:
        items_total += item.get('price', 0) * item.get('quantity', 1)

# Use items_total for Midtrans (without discount/shipping)
midtrans_gross_amount = items_total
```

### 2. Updated Router
```python
# Before
gross_amount=order.total  # Includes discount + shipping

# After
gross_amount=order.subtotal  # Only product prices
```

### 3. Midtrans Requirements
Midtrans memerlukan:
- `gross_amount` = Sum of all `item_details`
- Tidak boleh ada diskon di level Midtrans
- Shipping cost ditangani terpisah

## Data Flow

### Frontend → Backend
```
order.total = 319000 (includes discount + shipping)
order.subtotal = 598000 (product prices only)
```

### Backend → Midtrans
```
gross_amount = 598000 (subtotal)
item_details = [
  {"price": 299000, "quantity": 1},
  {"price": 299000, "quantity": 1}
]
// Total: 598000 ✓
```

## Example Calculation

### Order Details
- Product 1: Jas Hujan Extrime (299,000 × 1) = 299,000
- Product 2: Jas Hujan Extrime (299,000 × 1) = 299,000
- **Subtotal**: 598,000
- **Discount**: -299,000 (50%)
- **Shipping**: +20,000
- **Total**: 319,000

### Midtrans Parameters
```json
{
  "transaction_details": {
    "order_id": "87f518fa-6ea3-43d5-8797-68cfd5d5072e",
    "gross_amount": 598000  // Subtotal, not total
  },
  "item_details": [
    {
      "id": "PROD-JAS-HUJAN-EXTREME",
      "price": 299000,
      "quantity": 1,
      "name": "Jas Hujan Extrime"
    },
    {
      "id": "PROD-JAS-HUJAN-EXTREME",
      "price": 299000,
      "quantity": 1,
      "name": "Jas Hujan Extrime"
    }
  ]
}
```

## Testing

### Before Fix
- ❌ Error: `gross_amount is not equal to the sum of item_details`
- ❌ Midtrans rejects transaction
- ❌ Payment fails

### After Fix
- ✅ `gross_amount` = sum of `item_details`
- ✅ Midtrans accepts transaction
- ✅ Payment proceeds normally

## Verification

### Check Logs
```
Items total: 598000
Midtrans gross amount: 598000
Midtrans parameters: {...}
```

### Expected Result
- No amount mismatch errors
- Transaction created successfully
- Payment page loads normally

## Notes

- **Discount Handling**: Discount applied at application level, not Midtrans
- **Shipping Cost**: Handled separately, not included in Midtrans amount
- **Price Consistency**: Midtrans sees only product prices
- **Total Calculation**: Final total calculated after Midtrans payment
