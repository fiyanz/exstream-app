# Transaction System Fix - JSON Serialization Issue

## Problem
Error: `Object of type OrderItem is not JSON serializable` saat menyimpan order data.

## Root Cause
Pydantic models (`OrderItem`) tidak bisa langsung di-serialize ke JSON. Perlu dikonversi ke dictionary terlebih dahulu.

## Solution

### 1. Fix in `store-order` Route
```python
# Convert Pydantic models to dictionaries for JSON serialization
items_dict = [item.dict() for item in order.items]

# Prepare order details with serializable data
order_details = {
    "items": items_dict,  # Use converted dict instead of Pydantic models
    "shipping_method": order.shipping_method,
    "shipping_cost": order.shipping_cost,
    "payment_method": order.payment_method,
    "subtotal": order.subtotal,
    "discount": order.discount,
    "total": order.total,
    "customer_info": {
        "name": order.customer_name,
        "phone": order.customer_phone,
        "address": order.customer_address,
        "province": order.province,
        "city": order.city,
        "subdistrict": order.subdistrict,
        "village": order.village
    }
}
```

### 2. Fix in `get-order` Route
```python
# Parse detail_barang JSON and extract customer info
order_details = json.loads(transaksi_db.detail_barang) if transaksi_db.detail_barang else {}
customer_info = order_details.get("customer_info", {})

return {
    "customer_name": transaksi_db.nama_pengguna,
    "customer_phone": transaksi_db.no_telp,
    "customer_address": transaksi_db.alamat,
    "province": customer_info.get("province", ""),
    "city": customer_info.get("city", ""),
    "subdistrict": customer_info.get("subdistrict", ""),
    "village": customer_info.get("village", ""),
    "items": json.loads(transaksi_db.nama_barang) if transaksi_db.nama_barang else [],
    "shipping_method": order_details.get("shipping_method", ""),
    "shipping_cost": order_details.get("shipping_cost", 0),
    "payment_method": order_details.get("payment_method", ""),
    "subtotal": order_details.get("subtotal", 0),
    "discount": order_details.get("discount", 0),
    "total": transaksi_db.total
}
```

### 3. Fix in Frontend Service
```javascript
// Convert items back to the format expected by the API
const formattedOrderData = {
  ...orderData,
  items: orderData.items.map(item => ({
    name: item.name,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
    price: item.price,
    image: item.image
  }))
};
```

## Data Flow

### Step 1: Store Order
```
Frontend → Backend (store-order)
{
  "items": [Pydantic OrderItem objects]  // ❌ Not serializable
}

Backend Processing:
items_dict = [item.dict() for item in order.items]  // ✅ Convert to dict
json.dumps(items_dict)  // ✅ Now serializable
```

### Step 2: Get Order
```
Backend → Frontend (get-order)
{
  "items": [JSON objects]  // ✅ Already serializable
}
```

### Step 3: Create Transaction
```
Frontend → Backend (enhanced)
{
  "items": [Formatted objects]  // ✅ Proper format for API
}
```

## Testing

### Test Flow
1. **Add items to cart**
2. **Fill shipping form**
3. **Click "Beli Pesanan"**
4. **Check console logs**:
   ```
   Order stored: { order_id, status, frontend_total, subtotal, discount, shipping_cost }
   Retrieved order data: { customer_name, items, ... }
   Formatted order data for transaction: { items: [{ name, color, size, ... }] }
   Transaction created: { frontend_total, midtrans_amount, discount, shipping_cost }
   ```

### Expected Results
- ✅ No JSON serialization errors
- ✅ Order data stored successfully
- ✅ Order data retrieved correctly
- ✅ Transaction created with proper amounts
- ✅ Payment proceeds normally

## Key Changes

### Backend Changes
1. **`store-order`**: Convert Pydantic models to dict before JSON serialization
2. **`get-order`**: Return properly formatted data for frontend consumption
3. **Error handling**: Better error messages for debugging

### Frontend Changes
1. **`createTransactionFromStoredOrder`**: Format items data before sending to API
2. **Logging**: Enhanced logging for debugging data flow
3. **Data validation**: Ensure data format consistency

## Benefits
- ✅ Eliminates JSON serialization errors
- ✅ Maintains data consistency across steps
- ✅ Better error handling and debugging
- ✅ Clean data flow from frontend to backend
- ✅ Proper amount breakdown display
