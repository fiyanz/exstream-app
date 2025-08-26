# Store Order API Integration Guide

## Overview
This document explains how to use the Store Order API integration in the Extreme Store application.

## API Endpoint
```
POST /api/v1/store_order/store_order
```

## Basic Usage

### Import the module
```javascript
import { createStoreOrder, formatOrderData } from '../Data/storeOrder';
```

### Format order data
```javascript
// Convert your checkout form data to the required format
const formattedOrderData = formatOrderData({
  fullName: "Customer Name",
  telephone: "081234567890",
  address: "Customer Address",
  city: "City",
  province: "Province",
  shippingMethod: "jne - reg",
  paymentMethod: "COD",  // or "Transfer"
  shippingCost: 15000,
  destination_id: 1234,  // Location ID from Raja Ongkir
  items: [
    {
      name: "Product Name",
      variant: "Color - Size",
      price: 100000,
      quantity: 2,
      weight: 250  // in grams
    }
  ],
  totalAmount: 215000  // Total including shipping
});
```

### Send the order to API
```javascript
try {
  const response = await createStoreOrder(formattedOrderData);
  
  if (response.meta.status === 'success') {
    // Order was created successfully
    const orderId = response.data.order_id;
    const orderNo = response.data.order_no;
    
    // Handle success (e.g., redirect to confirmation page)
    console.log(`Order created with ID: ${orderId}, No: ${orderNo}`);
  } else {
    // Handle API error
    console.error('Order creation failed:', response.meta.message);
  }
} catch (error) {
  // Handle network or unexpected errors
  console.error('Error creating order:', error.message);
}
```

## Important Notes

### Courier and Service Type Format
- Courier codes must be lowercase (e.g., `jne`, `sicepat`, `jnt`)
- Service types must also be lowercase (e.g., `reg`, `eco`, `yes`)

### Phone Number Format
- Remove the leading zero from phone numbers (e.g., `81234567890` instead of `081234567890`)

### Payment Methods
- Valid payment methods are `COD` and `BANK TRANSFER`

### Service Fee
- Service fee is automatically calculated as 2.8% of the total amount
- For COD orders, it's 2.8% of the COD value

### Insurance Value
- Insurance is only applicable for orders with product total over IDR 300,000
- Insurance value is calculated automatically by the backend

## Common Error Handling

### Expedition Not Found
If you get "expedition not found" error, check:
- Courier code is lowercase and recognized (jne, jnt, sicepat, etc.)
- Service type is valid for the selected courier

### Service Fee Error
If you get service fee validation errors:
- Ensure service_fee is calculated as 2.8% of grand_total or cod_value
- For COD orders, base the calculation on cod_value
- For non-COD orders, base the calculation on grand_total

## Testing
You can use the `testStoreOrder.js` module to test the API integration:

```javascript
import { testStoreOrder } from '../Data/testStoreOrder';

// Run the test
testStoreOrder()
  .then(result => {
    if (result && result.meta.status === 'success') {
      console.log('Test passed!');
    } else {
      console.log('Test failed!');
    }
  });
```
