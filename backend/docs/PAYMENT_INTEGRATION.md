# Midtrans Payment Integration Guide

## Overview
This application integrates with Midtrans payment gateway to handle both COD (Cash on Delivery) and non-COD payments.

## Implementation Details

### Backend Response Format
The backend returns the following format for non-COD payments:
```json
{
  "token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/66e4fa55-fdac-4ef9-91b5-733b97d1b862"
}
```

### Frontend Implementation

#### 1. Payment Methods
- **COD (Cash on Delivery)**: Direct processing, no payment gateway needed
- **Non-COD (Transfer Bank, E-Wallet, Virtual Account)**: Uses Midtrans Snap

#### 2. Payment Flow
1. User selects payment method
2. Clicks "Beli Pesanan" button
3. Frontend sends order data to backend
4. Backend creates transaction and returns:
   - For COD: Success message
   - For Non-COD: `token` and `redirect_url`
5. Frontend handles payment:
   - **Popup Mode**: Uses `window.snap.pay(token)` (may be blocked by CSP)
   - **Redirect Mode**: Falls back to `window.location.href = redirect_url`

#### 3. CSP (Content Security Policy) Handling
The implementation includes automatic fallback from popup to redirect mode if CSP blocks:
- Inline scripts (`script-src-elem`)
- JavaScript eval (`script-src` missing `'unsafe-eval'`)

#### 4. Available Functions

##### `handleMidtransPayment(snapToken, redirectUrl)`
Main payment handler that tries popup first, then falls back to redirect.

##### `embedMidtransSnap(snapToken, containerId)`
Alternative method to embed Snap in a container (embedded mode).

### Configuration

#### 1. Client Key
Update the client key in `frontend/index.html`:
```html
<script type="text/javascript" 
  src="https://app.sandbox.midtrans.com/snap/snap.js" 
  data-client-key="YOUR_ACTUAL_CLIENT_KEY">
</script>
```

#### 2. Environment URLs
- **Sandbox**: `https://app.sandbox.midtrans.com/snap/snap.js`
- **Production**: `https://app.midtrans.com/snap/snap.js`

### Testing

#### Test Card Details (Sandbox)
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp Month: Any month (e.g., `02`)
- Exp Year: Any future year (e.g., `2025`)
- OTP/3DS: `112233`

### Error Handling
- Network errors: User-friendly messages
- CSP blocking: Automatic fallback to redirect
- Missing data: Validation and error messages
- Payment failures: Proper error callbacks

### Security Notes
- Client key is safe to expose in frontend
- Server key should only be used in backend
- All sensitive operations happen on backend
- CSP warnings are expected and handled gracefully

## Troubleshooting

### CSP Errors
If you see CSP errors in console:
1. These are expected and handled automatically
2. The app will fallback to redirect mode
3. Payment functionality will still work

### Payment Not Working
1. Check if client key is correct
2. Verify backend is running and accessible
3. Check browser console for errors
4. Ensure you're using sandbox credentials for testing

### Redirect Issues
1. Verify `redirect_url` is returned from backend
2. Check if URL is accessible
3. Ensure proper CORS configuration
