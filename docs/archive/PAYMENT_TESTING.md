# Payment Testing Guide

## Current Issue
- Token: `undefined`
- Redirect URL: `https://app.sandbox.midtrans.com/snap/v4/redirection/fa970011-76dd-43aa-bbc4-24302b87a9da`
- Payment Status: `pending_payment`

## Testing Steps

### 1. Test Backend Midtrans Connection
```bash
curl http://localhost:8000/api/v1/transaksi/test-midtrans
```

### 2. Test Payment Flow
1. **Add product to cart**
2. **Fill shipping form completely**
3. **Select "Transfer Bank, E-Wallet, Virtual Account"**
4. **Click "Beli Pesanan"**
5. **Check browser console for logs**

### 3. Expected Console Logs
```
Transaction result received: {...}
Token: [should not be undefined]
Redirect URL: https://app.sandbox.midtrans.com/snap/v4/redirection/...
Payment status: pending_payment
Enhanced Midtrans payment handler
Token: [token value]
Redirect URL: [url]
```

### 4. Payment Methods Tried (in order)
1. **Snap popup with token** (if token available)
2. **Embedded mode with token** (if token available)
3. **Snap embed with extracted token from URL**
4. **New window popup**
5. **Direct redirect**

## Debug Commands

### Check Snap.js Loading
```javascript
console.log('Snap available:', !!window.snap);
console.log('Snap.pay available:', typeof window.snap?.pay);
console.log('Snap.embed available:', typeof window.snap?.embed);
```

### Manual Test Popup
```javascript
// Test with redirect URL
window.open('https://app.sandbox.midtrans.com/snap/v4/redirection/fa970011-76dd-43aa-bbc4-24302b87a9da', '_blank');
```

## Current Fixes Applied

1. **Backend**: Added fallback for token field (`snap_token` or `token`)
2. **Frontend**: Added multiple fallback methods for payment
3. **Frontend**: Added direct redirect when token is missing
4. **Frontend**: Added token extraction from redirect URL

## Next Steps

1. **Test the current implementation**
2. **Check if popup appears**
3. **Verify payment flow works**
4. **If still not working, check backend logs for Midtrans response**

## Expected Behavior

- **With Token**: Snap popup should appear
- **Without Token**: New tab should open with Midtrans payment page
- **Fallback**: Direct redirect to payment page
