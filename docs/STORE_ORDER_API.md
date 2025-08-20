# Store Order API Usage Examples

## API Endpoints

### 1. Create Store Order
**POST** `/api/v1/store_order`

Creates a new store order by sending data to Komerce API and saving to local database.

**Note**: The `service_fee` field is optional and will be auto-calculated at 2.8% of the grand total or COD value if not provided.

#### Request Body Example:
```json
{
    "order_date": "2025-08-19 11:00:00",
    "brand_name": "Extreme Store",
    "shipper_name": "Toko Official Extreme",
    "shipper_phone": "6281234567689",
    "shipper_destination_id": 3305,
    "shipper_address": "Jl. Raya Kebumen No. 123, Kebumen, Jawa Tengah",
    "shipper_email": "store@extreme.com",
    "receiver_name": "John Doe",
    "receiver_phone": "6281209876543",
    "receiver_destination_id": 39947,
    "receiver_address": "Jl. Sudirman No. 456, Jakarta Pusat",
    "shipping": "NINJA",
    "shipping_type": "Standar",
    "payment_method": "COD",
    "shipping_cost": 18600,
    "shipping_cashback": 0,
    "additional_cost": 0,
    "grand_total": 68600,
    "cod_value": 68600,
    "insurance_value": 0,
    "order_details": [
        {
            "product_name": "Gaming Mouse",
            "product_variant_name": "RGB Wireless",
            "product_price": 50000,
            "product_width": 10,
            "product_height": 5,
            "product_weight": 150,
            "product_length": 12,
            "qty": 1,
            "subtotal": 50000
        }
    ]
}
```

**Note**: In the above example, `service_fee` is omitted and will be auto-calculated as: `68600 * 0.028 = 1920`
```

#### Response Example:
```json
{
    "meta": {
        "status": "success",
        "message": "Order created successfully"
    },
    "data": {
        "order_id": "ORD-123456789",
        "tracking_number": "TRK-987654321"
    },
    "message": "Order created successfully"
}
```

### 2. Get Store Order
**GET** `/api/v1/store_order/{order_id}`

Retrieves a store order from the local database.

#### Response Example:
```json
{
    "id": 1,
    "order_date": "2025-08-19 11:00:00",
    "brand_name": "Extreme Store",
    "shipper_name": "Toko Official Extreme",
    "shipper_phone": "6281234567689",
    "shipper_destination_id": 3305,
    "shipper_address": "Jl. Raya Kebumen No. 123, Kebumen, Jawa Tengah",
    "shipper_email": "store@extreme.com",
    "receiver_name": "John Doe",
    "receiver_phone": "6281209876543",
    "receiver_destination_id": 39947,
    "receiver_address": "Jl. Sudirman No. 456, Jakarta Pusat",
    "shipping": "NINJA",
    "shipping_type": "Standar",
    "payment_method": "COD",
    "shipping_cost": 18600,
    "shipping_cashback": 0,
    "service_fee": 1921,
    "additional_cost": 0,
    "grand_total": 68600,
    "cod_value": 68600,
    "insurance_value": 0,
    "order_details": [
        {
            "product_name": "Gaming Mouse",
            "product_variant_name": "RGB Wireless",
            "product_price": 50000,
            "product_width": 10,
            "product_height": 5,
            "product_weight": 150,
            "product_length": 12,
            "qty": 1,
            "subtotal": 50000
        }
    ]
}
```

## cURL Examples

### Create Store Order
```bash
curl --location 'http://localhost:8000/api/v1/store_order' \
--header 'Content-Type: application/json' \
--data '{
    "order_date": "2025-08-19 11:00:00",
    "brand_name": "Extreme Store",
    "shipper_name": "Toko Official Extreme",
    "shipper_phone": "6281234567689",
    "shipper_destination_id": 3305,
    "shipper_address": "Jl. Raya Kebumen No. 123, Kebumen, Jawa Tengah",
    "shipper_email": "store@extreme.com",
    "receiver_name": "John Doe",
    "receiver_phone": "6281209876543",
    "receiver_destination_id": 39947,
    "receiver_address": "Jl. Sudirman No. 456, Jakarta Pusat",
    "shipping": "NINJA",
    "shipping_type": "Standar",
    "payment_method": "COD",
    "shipping_cost": 18600,
    "shipping_cashback": 0,
    "additional_cost": 0,
    "grand_total": 68600,
    "cod_value": 68600,
    "insurance_value": 0,
    "order_details": [
        {
            "product_name": "Gaming Mouse",
            "product_variant_name": "RGB Wireless",
            "product_price": 50000,
            "product_width": 10,
            "product_height": 5,
            "product_weight": 150,
            "product_length": 12,
            "qty": 1,
            "subtotal": 50000
        }
    ]
}'
```

### Get Store Order
```bash
curl --location 'http://localhost:8000/api/v1/store_order/1'
```

## Error Handling

The API includes comprehensive error handling:

1. **Validation Errors (400)**: Invalid request data
2. **Not Found (404)**: Order not found
3. **Komerce API Errors (400)**: Issues with Komerce API call
4. **Server Errors (500)**: Internal server errors

## Notes

- The API uses the Komerce sandbox environment by default
- API key is configured in the `.env` file as `RAJA_ONGKIR_API`
- Orders are saved to local database even if there are database issues after successful Komerce API call
- All datetime fields should be in format: "YYYY-MM-DD HH:MM:SS"
- Phone numbers should include country code (62 for Indonesia)
- **Service Fee Auto-calculation**: If `service_fee` is not provided or is 0, it will be automatically calculated as 2.8% of the higher value between `grand_total` and `cod_value`
- Service fee validation ensures the provided value is within reasonable range (±10% of expected value)
