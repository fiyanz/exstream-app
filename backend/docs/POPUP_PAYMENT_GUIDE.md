# Popup Payment Implementation Guide

## Overview

Aplikasi ini menggunakan Midtrans Snap.js untuk menampilkan popup pembayaran. Implementasi ini memiliki multiple fallback methods untuk memastikan pembayaran selalu bisa ditampilkan.

## Implementation Methods

### 1. Snap Popup (Primary Method)
```javascript
window.snap.pay(snapToken, {
  onSuccess: function(result) { /* handle success */ },
  onPending: function(result) { /* handle pending */ },
  onError: function(result) { /* handle error */ },
  onClose: function() { /* handle close */ }
});
```

### 2. Embedded Mode (Fallback 1)
```javascript
window.snap.embed(snapToken, {
  embedId: 'snap-container',
  // ... callbacks
});
```

### 3. New Window Popup (Fallback 2)
```javascript
window.open(redirectUrl, 'midtrans_payment', 
  'width=800,height=600,scrollbars=yes,resizable=yes');
```

### 4. Redirect Mode (Final Fallback)
```javascript
window.location.href = redirectUrl;
```

## Configuration

### Frontend (index.html)
```html
<!-- Midtrans Snap.js -->
<script type="text/javascript" 
  src="https://app.sandbox.midtrans.com/snap/snap.js" 
  data-client-key="Mid-client-g0CJBvIvd87Wc4W0">
</script>

<!-- Container for embedded mode -->
<div id="snap-container" style="display: none;">
  <div id="snap-embed-content"></div>
</div>
```

### Backend (.env)
```env
MIDTRANS_SERVER_KEY=Mid-server-FfroB4BlRS7nR4ML8TbQbecD
MIDTRANS_CLIENT_KEY=Mid-client-g0CJBvIvd87Wc4W0
MIDTRANS_IS_PRODUCTION=false
```

## Troubleshooting

### Popup Tidak Muncul

1. **Check Browser Console**
   - Buka Developer Tools (F12)
   - Lihat tab Console untuk error messages

2. **Check Snap.js Loading**
   ```javascript
   console.log('Snap available:', !!window.snap);
   console.log('Snap.pay available:', typeof window.snap?.pay);
   ```

3. **Check Client Key**
   - Pastikan client key di `index.html` sama dengan yang di backend
   - Pastikan menggunakan sandbox keys untuk testing

4. **Check CSP (Content Security Policy)**
   - Jika ada CSP error, popup akan fallback ke redirect
   - Ini normal dan tidak mengganggu fungsionalitas

### Popup Blocked by Browser

1. **Allow Popups**
   - Browser mungkin memblokir popup
   - Klik icon popup blocker di address bar
   - Pilih "Allow popups for this site"

2. **Use Embedded Mode**
   - Jika popup tetap diblokir, aplikasi akan otomatis menggunakan embedded mode
   - Embedded mode menampilkan pembayaran dalam modal overlay

### Payment Flow

1. **User clicks "Beli Pesanan"**
2. **Backend creates transaction**
3. **Frontend receives token & redirect_url**
4. **Frontend tries popup methods in order:**
   - Snap popup
   - Embedded mode
   - New window popup
   - Redirect (final fallback)

## Testing

### Sandbox Test Credentials

**Credit Card:**
- Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp: `02/25`
- OTP: `112233`

**Bank Transfer:**
- BCA: `1111111111111111`
- BNI: `1111111111111111`
- BRI: `1111111111111111`

### Expected Behavior

1. **COD Payment**: Direct success message
2. **Non-COD Payment**: Popup payment interface
3. **Success**: Success message + optional redirect
4. **Pending**: Pending message
5. **Error**: Error message
6. **Close**: No message (user cancelled)

## Debug Mode

Untuk debugging, tambahkan di console:
```javascript
// Check if Snap.js loaded
console.log('Snap.js loaded:', !!window.snap);

// Check available methods
console.log('Snap.pay available:', typeof window.snap?.pay);
console.log('Snap.embed available:', typeof window.snap?.embed);

// Test popup manually
window.snap.pay('test-token', {
  onSuccess: console.log,
  onError: console.log,
  onClose: console.log
});
```
