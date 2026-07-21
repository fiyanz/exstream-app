# Insurance Value Validation

## Overview

This document explains how insurance values are handled in the Exstream App integration with Komerce API. Komerce enforces specific rules for insurance application, including a minimum product price threshold of IDR 300,000.

## Komerce API Requirements

According to the Komerce API documentation and error messages, only products with a total price (sum of all product subtotals) greater than IDR 300,000 can be insured. If you try to submit an order with insurance for products valued below this threshold, the API will reject the request.

## Implementation Details

### Backend Implementation

The insurance validation logic is implemented in two main functions in `backend/service/store_order.py`:

1. **`calculate_insurance_value()`**
   - Checks if total product price exceeds IDR 300,000
   - Returns 0 if below threshold
   - Otherwise calculates insurance based on courier-specific rules

2. **`validate_insurance_value()`**
   - Calculates total product price from order details
   - Enforces zero insurance for orders below IDR 300,000 threshold
   - Logs detailed information about insurance eligibility

### Error Handling

If the Komerce API returns an insurance-related error:

1. The backend identifies these errors by:
   - Looking for "insurance" or "300,000" in the error message
   - Setting a specific error code "INSURANCE_THRESHOLD_NOT_MET"

2. The frontend presents a user-friendly error message:
   - "Pesanan tidak dapat diasuransikan: Total produk harus lebih dari Rp 300.000. Silakan coba lagi tanpa asuransi."

## Courier-Specific Insurance Rules

When total product price exceeds IDR 300,000, insurance is calculated based on the courier:

- **JNE**: (0.2% × total_product_price) + Rp5.000
- **SICEPAT**: 0.3% × grand_total if grand_total > IDR 500,000
- **IDEXPRESS**: 0.2% × total_product_price
- **SAP**: (0.3% × total_product_price) + Rp2.000/AWB
- **NINJA**: 
  - 0.25% × total_product_price with minimum IDR 2,500 for orders <= IDR 1,000,000
  - 0.25% × total_product_price for orders > IDR 1,000,000
- **J&T/JNT**: 0.2% × total_product_price

All insurance values are rounded up to the nearest 100.

## Frontend Implementation

In the frontend (`frontend/src/Data/transactionService.js`), the `formatStoreOrderData()` function:

1. Always sets `insurance_value` to 0 in the initial request
2. The backend will calculate the appropriate insurance value based on eligibility
3. The frontend logs detailed information about insurance eligibility based on total product price
4. Error handling includes special cases for insurance-related errors

## Testing

When testing insurance functionality, ensure you test both scenarios:
1. Orders with total product price < IDR 300,000 (should have insurance value = 0)
2. Orders with total product price > IDR 300,000 (should have insurance calculated based on courier)

## Troubleshooting

If you encounter insurance-related errors:

1. Check the total product price (sum of all item subtotals)
2. Verify the insurance value is being set correctly (0 for orders below threshold)
3. Check logs for detailed debugging information
4. Ensure the courier code is properly mapped to the format expected by Komerce API
