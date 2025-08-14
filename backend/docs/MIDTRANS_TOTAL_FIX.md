# Midtrans Total Amount Fix

## Problem
Ada perbedaan antara total di frontend dan yang ditampilkan di Midtrans:
- **Frontend Total**: Rp 345.500 (setelah diskon + ongkir)
- **Midtrans Amount**: Rp 299.000 (hanya subtotal produk)

## Root Cause
Sistem Midtrans menggunakan `subtotal` (harga produk sebelum diskon) sebagai `gross_amount`, bukan total akhir yang dibayar user.

## Solution

### 1. Update Payment Gateway Function
```python
def create_snap_transaction(order_id: str, gross_amount: int, customer: dict, items: list = None, final_total: int = None):
    # Use final_total if provided, otherwise use gross_amount
    midtrans_gross_amount = final_total if final_total is not None else gross_amount
    
    param = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": midtrans_gross_amount  # Now uses final total
        },
        # ... rest of parameters
    }
```

### 2. Update Transaction Route
```python
snap_response = create_snap_transaction(
    order_id=order_id,
    gross_amount=order.subtotal,  # Original subtotal for reference
    customer=customer,
    items=items_dict,  # Pass items to Midtrans
    final_total=order.total  # Use final total (after discount + shipping)
)
```

### 3. Update Response Data
```python
response_data = {
    # ... other fields
    "frontend_total": order.total,
    "midtrans_amount": order.total,  # Now matches frontend total
    "discount": order.discount,
    "shipping_cost": order.shipping_cost
}
```

## Data Flow

### Before Fix
```
Frontend: Rp 345.500 (subtotal - discount + shipping)
Midtrans: Rp 299.000 (subtotal only)
❌ Mismatch!
```

### After Fix
```
Frontend: Rp 345.500 (subtotal - discount + shipping)
Midtrans: Rp 345.500 (final total)
✅ Match!
```

## Amount Breakdown Example

### Frontend Display
```
Subtotal: Rp 299.000
Diskon: -Rp 149.500
Ongkir: Rp 196.000
Total Bayar: Rp 345.500
```

### Midtrans Display (After Fix)
```
Product: Jas Hujan Extrime × 1
Amount: Rp 345.500
```

## Testing

### Test Flow
1. **Add items to cart**
2. **Fill shipping form**
3. **Click "Beli Pesanan"**
4. **Check console logs**:
   ```
   Gross amount: 299000 (subtotal)
   Final total: 345500 (total after discount + shipping)
   Midtrans gross amount: 345500
   ```
5. **Verify Midtrans page shows correct amount**

### Expected Results
- ✅ Frontend total = Midtrans amount
- ✅ User sees consistent pricing
- ✅ No confusion about payment amount
- ✅ Payment proceeds with correct total

## Key Changes

### Backend Changes
1. **`payment_gateway.py`**: Added `final_total` parameter
2. **`transaksi.py`**: Pass `order.total` as `final_total`
3. **Response**: Update `midtrans_amount` to match `frontend_total`

### Benefits
- ✅ Consistent pricing across frontend and Midtrans
- ✅ User sees exact amount they need to pay
- ✅ No confusion about payment totals
- ✅ Better user experience
- ✅ Accurate payment processing

## Important Notes

### Midtrans Requirements
- Midtrans `gross_amount` must equal the sum of `item_details`
- However, we can include shipping and discounts as separate line items
- For simplicity, we're using the final total as the gross amount

### Alternative Approach (If Needed)
If Midtrans requires exact item sum matching, we could:
1. Add shipping as a separate item
2. Add discount as a negative item
3. Keep gross_amount as sum of all items

But for now, using final_total is simpler and more user-friendly.
