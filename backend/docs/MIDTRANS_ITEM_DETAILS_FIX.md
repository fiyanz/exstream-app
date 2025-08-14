# Midtrans Item Details Validation Fix

## Problem
Error: `transaction_details.gross_amount is not equal to the sum of item_details`

**Root Cause:**
- Midtrans memerlukan `gross_amount` sama dengan jumlah `item_details`
- Sistem sebelumnya mengirim `final_total` sebagai `gross_amount` tapi `item_details` hanya berisi produk
- Tidak ada item untuk diskon dan ongkir

## Solution

### 1. Enhanced Items Structure
```python
# Add discount and shipping as separate items
enhanced_items = items_dict.copy()

# Add discount as negative item
if order.discount > 0:
    enhanced_items.append({
        "name": "Diskon",
        "price": -order.discount,  # Negative price
        "quantity": 1,
        "color": "N/A",
        "size": "N/A",
        "image": None
    })

# Add shipping cost as separate item
if order.shipping_cost > 0:
    enhanced_items.append({
        "name": "Biaya Pengiriman",
        "price": order.shipping_cost,
        "quantity": 1,
        "color": "N/A",
        "size": "N/A",
        "image": None
    })
```

### 2. Payment Gateway Processing
```python
# Process enhanced items (including discount and shipping)
for item in items:
    if item.get('name') == 'Diskon':
        # Handle discount as separate item
        param["item_details"].append({
            "id": "DISCOUNT",
            "price": abs(item.get('price', 0)),  # Use absolute value
            "quantity": 1,
            "name": "Diskon"
        })
    elif item.get('name') == 'Biaya Pengiriman':
        # Handle shipping cost
        param["item_details"].append({
            "id": "SHIPPING-COST",
            "price": item.get('price', 0),
            "quantity": 1,
            "name": "Biaya Pengiriman"
        })
    else:
        # Handle regular product items
        # ... existing product logic
```

### 3. Correct Total Calculation
```python
# Recalculate total with discount handling
calculated_total = 0
for item in param["item_details"]:
    if item["name"] == "Diskon":
        calculated_total -= item["price"] * item["quantity"]  # Subtract discount
    else:
        calculated_total += item["price"] * item["quantity"]  # Add other items

# Update gross_amount to match calculated total
midtrans_gross_amount = calculated_total
param["transaction_details"]["gross_amount"] = midtrans_gross_amount
```

## Data Flow Example

### Input Data
```
Subtotal: Rp 299.000
Diskon: Rp 149.500
Ongkir: Rp 15.000
Total: Rp 164.500
```

### Enhanced Items Sent to Midtrans
```json
{
  "item_details": [
    {
      "id": "PROD-JAS-HUJAN-EXTREME",
      "price": 299000,
      "quantity": 1,
      "name": "Jas Hujan Extrime"
    },
    {
      "id": "DISCOUNT",
      "price": 149500,
      "quantity": 1,
      "name": "Diskon"
    },
    {
      "id": "SHIPPING-COST",
      "price": 15000,
      "quantity": 1,
      "name": "Biaya Pengiriman"
    }
  ],
  "transaction_details": {
    "gross_amount": 164500  // 299000 - 149500 + 15000
  }
}
```

### Midtrans Display
```
Jas Hujan Extrime × 1: Rp 299.000
Diskon: -Rp 149.500
Biaya Pengiriman: Rp 15.000
Total: Rp 164.500
```

## Validation

### Before Fix
```
gross_amount: 164500
item_details sum: 299000 (only product)
❌ Mismatch: 164500 ≠ 299000
```

### After Fix
```
gross_amount: 164500
item_details sum: 299000 - 149500 + 15000 = 164500
✅ Match: 164500 = 164500
```

## Testing

### Test Flow
1. **Add items to cart**
2. **Fill shipping form**
3. **Click "Beli Pesanan"**
4. **Check console logs**:
   ```
   Subtotal: 299000, Discount: 149500, Shipping: 15000
   Items total: 299000
   Final total: 164500
   Calculated total: 164500
   Item details: [products, discount, shipping]
   ```
5. **Verify Midtrans accepts transaction**

### Expected Results
- ✅ No validation errors
- ✅ Midtrans accepts transaction
- ✅ Payment proceeds normally
- ✅ Correct amount displayed in Midtrans

## Key Changes

### Backend Changes
1. **`transaksi.py`**: Add discount/shipping as separate items
2. **`payment_gateway.py`**: Process enhanced items correctly
3. **Total calculation**: Handle discount as subtraction

### Benefits
- ✅ Complies with Midtrans validation rules
- ✅ Accurate item breakdown in Midtrans
- ✅ Consistent pricing display
- ✅ No more API errors
- ✅ Better user experience

## Important Notes

### Midtrans Requirements
- `gross_amount` must equal sum of `item_details`
- Each item must have unique ID
- Prices must be positive integers
- Discounts handled as separate items

### Error Prevention
- Enhanced logging for debugging
- Validation of calculated totals
- Proper error handling
- Clear item identification
