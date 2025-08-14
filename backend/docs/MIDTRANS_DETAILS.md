# Midtrans Details Integration

## Problem
Detail alamat, barang, dan informasi customer tidak masuk ke Midtrans, hanya menampilkan placeholder (`-`).

## Solution Implemented

### 1. Enhanced Customer Details
```python
customer = {
    "first_name": order.customer_name,
    "last_name": "",
    "email": f"{order.customer_phone}@example.com",  # Auto-generated email
    "phone": order.customer_phone,
    "billing_address": {
        "first_name": order.customer_name,
        "last_name": "",
        "phone": order.customer_phone,
        "address": order.customer_address,
        "city": order.city,
        "postal_code": "00000",
        "country_code": "IDN"
    },
    "shipping_address": {
        "first_name": order.customer_name,
        "last_name": "",
        "phone": order.customer_phone,
        "address": order.customer_address,
        "city": order.city,
        "postal_code": "00000",
        "country_code": "IDN"
    }
}
```

### 2. Item Details Integration
```python
# Add item details to Midtrans
if items and len(items) > 0:
    param["item_details"] = []
    for item in items:
        item_detail = {
            "id": f"PROD-{item.get('name', 'Jas Hujan Extrime').replace(' ', '-').upper()}",
            "price": item.get('price', 0),
            "quantity": item.get('quantity', 1),
            "name": item.get('name', 'Jas Hujan Extrime')
        }
        param["item_details"].append(item_detail)
```

### 3. Updated Function Signature
```python
def create_snap_transaction(order_id: str, gross_amount: int, customer: dict, items: list = None):
```

## Expected Results

### Before (Placeholder Data):
- **Name:** `-`
- **Mobile number:** `-`
- **E-mail:** `-`
- **Address:** `-`
- **Product details:** All fields show `-`

### After (Real Data):
- **Name:** `[Customer Name]`
- **Mobile number:** `[Phone Number]`
- **E-mail:** `[Phone]@example.com`
- **Address:** `[Complete Address]`
- **Product details:** 
  - **PRODUCT ID:** `PROD-JAS-HUJAN-EXTREME`
  - **PRODUCT NAME:** `Jas Hujan Extrime`
  - **QUANTITY:** `[Quantity]`
  - **PRICE:** `[Price]`
  - **SUBTOTAL:** `[Subtotal]`

## Testing

### 1. Test with Real Order
1. Add product to cart
2. Fill complete shipping form
3. Select non-COD payment
4. Complete transaction
5. Check Midtrans page for complete details

### 2. Test Endpoint
```bash
curl http://localhost:8000/api/v1/transaksi/test-midtrans
```

## Data Flow

1. **Frontend** → Sends complete order data
2. **Backend Router** → Processes and formats data
3. **Payment Gateway** → Sends formatted data to Midtrans
4. **Midtrans** → Displays complete transaction details

## Notes

- **Email**: Auto-generated from phone number if not provided
- **Product ID**: Auto-generated from product name
- **Country Code**: Set to "IDN" for Indonesia
- **Postal Code**: Default to "00000" if not provided
- **Last Name**: Empty string (Midtrans requirement)
