# Transaction System with Data Consistency

## Problem
Ada perbedaan antara total di frontend dan yang dibayar di Midtrans, menyebabkan kebingungan user.

## Solution
Membuat sistem 2-step transaction dengan data consistency:

### Step 1: Store Order Data
```
POST /api/v1/transaksi/store-order
```
- Menyimpan data order lengkap ke database
- Mengembalikan order_id untuk referensi
- Memastikan data tersimpan dengan benar

### Step 2: Create Transaction
```
POST /api/v1/transaksi/enhanced
```
- Menggunakan data dari database
- Membuat transaksi Midtrans dengan amount yang benar
- Mengembalikan informasi amount yang jelas

## New Routes

### 1. Store Order Data
```javascript
// Frontend
const storedOrder = await storeOrderData(orderData);
// Returns: { order_id, status, frontend_total, subtotal, discount, shipping_cost }
```

### 2. Get Order Data
```javascript
// Frontend
const orderData = await getOrderData(orderId);
// Returns: Complete order data from database
```

### 3. Create Transaction from Stored Order
```javascript
// Frontend
const transaction = await createTransactionFromStoredOrder(orderId);
// Returns: Transaction with payment details + amount breakdown
```

## Data Flow

### Frontend → Backend (Step 1)
```json
{
  "customer_name": "John Doe",
  "customer_phone": "81234567890",
  "items": [
    {
      "name": "Jas Hujan Extrime",
      "price": 299000,
      "quantity": 2
    }
  ],
  "subtotal": 598000,
  "discount": 299000,
  "shipping_cost": 20000,
  "total": 319000
}
```

### Backend Response (Step 1)
```json
{
  "order_id": "87f518fa-6ea3-43d5-8797-68cfd5d5072e",
  "status": "stored",
  "frontend_total": 319000,
  "subtotal": 598000,
  "discount": 299000,
  "shipping_cost": 20000
}
```

### Backend → Midtrans (Step 2)
```json
{
  "transaction_details": {
    "order_id": "87f518fa-6ea3-43d5-8797-68cfd5d5072e",
    "gross_amount": 598000  // subtotal only
  },
  "item_details": [
    {
      "price": 299000,
      "quantity": 2
    }
  ]
}
```

### Final Response (Step 2)
```json
{
  "id": "87f518fa-6ea3-43d5-8797-68cfd5d5072e",
  "payment_status": "pending_payment",
  "token": "midtrans-token",
  "redirect_url": "https://app.sandbox.midtrans.com/...",
  "frontend_total": 319000,
  "midtrans_amount": 598000,
  "discount": 299000,
  "shipping_cost": 20000
}
```

## Amount Breakdown Display

### Frontend Success Message
```
Subtotal: Rp 598,000
Diskon: -Rp 299,000
Ongkir: Rp 20,000
Total Bayar: Rp 319,000
```

### Midtrans Payment Page
```
Product: Jas Hujan Extrime × 2
Amount: Rp 598,000
```

## Benefits

### 1. Data Consistency
- ✅ Data tersimpan di database sebelum payment
- ✅ Konsistensi antara frontend dan backend
- ✅ Audit trail lengkap

### 2. Amount Transparency
- ✅ User melihat breakdown lengkap
- ✅ Jelas perbedaan subtotal vs total
- ✅ Tidak ada kebingungan amount

### 3. Error Handling
- ✅ Jika payment gagal, data tetap tersimpan
- ✅ Bisa retry payment tanpa input ulang
- ✅ Data tidak hilang

### 4. Debugging
- ✅ Log lengkap di setiap step
- ✅ Bisa track amount di setiap stage
- ✅ Mudah troubleshoot masalah

## Testing

### Test Flow
1. **Add items to cart**
2. **Fill shipping form**
3. **Click "Beli Pesanan"**
4. **Check console logs**:
   ```
   Order stored: { order_id, frontend_total, subtotal, discount, shipping_cost }
   Transaction created: { frontend_total, midtrans_amount, discount, shipping_cost }
   ```
5. **Verify amounts match**

### Expected Results
- ✅ Order data stored successfully
- ✅ Transaction created with correct amounts
- ✅ Frontend total ≠ Midtrans amount (correct)
- ✅ Breakdown displayed clearly
- ✅ Payment proceeds normally

## Database Schema

### Transaksi Table
```sql
CREATE TABLE transaksi (
  id CHAR(36) PRIMARY KEY,
  no_telp VARCHAR(20),
  nama_barang VARCHAR(2000),  -- JSON items
  jumlah_barang INT,
  total INT,                   -- Final total
  detail_barang VARCHAR(5000), -- Complete order details
  nama_pengguna VARCHAR(100),
  alamat VARCHAR(500)
);
```

### Data Storage
- **nama_barang**: JSON array of items
- **detail_barang**: Complete order details including amounts
- **total**: Final amount after discount + shipping
