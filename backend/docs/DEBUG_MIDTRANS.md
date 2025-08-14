# Debug Midtrans Issues

## Quick Test

1. **Test Midtrans Connection**:
   ```bash
   curl http://localhost:8000/api/v1/transaksi/test-midtrans
   ```

2. **Check Backend Logs**:
   - Restart backend server
   - Lihat output di terminal untuk error messages

## Common Issues

### 1. "Data pembayaran tidak lengkap"

**Penyebab**: `token` atau `redirect_url` tidak diterima dari backend

**Debug Steps**:
1. Check backend logs untuk error Midtrans
2. Test endpoint `/test-midtrans`
3. Periksa `.env` configuration

### 2. Midtrans Connection Failed

**Penyebab**: Server key salah atau network issue

**Debug Steps**:
1. Periksa `MIDTRANS_SERVER_KEY` di `.env`
2. Pastikan menggunakan sandbox keys untuk testing
3. Test koneksi internet

### 3. Popup Tidak Muncul

**Penyebab**: CSP blocking atau Snap.js tidak loaded

**Debug Steps**:
1. Check browser console untuk errors
2. Periksa apakah Snap.js loaded
3. Test dengan embedded mode

## Debug Commands

### Backend
```bash
# Restart backend dengan debug mode
cd backend
python main.py

# Check logs untuk Midtrans errors
```

### Frontend
```javascript
// Check Snap.js loaded
console.log('Snap available:', !!window.snap);
console.log('Snap.pay available:', typeof window.snap?.pay);

// Test popup manually
window.snap.pay('test-token', {
  onSuccess: console.log,
  onError: console.log,
  onClose: console.log
});
```

## Expected Flow

1. **User clicks "Beli Pesanan"**
2. **Frontend sends order data to backend**
3. **Backend creates Midtrans transaction**
4. **Backend returns token & redirect_url**
5. **Frontend receives response**
6. **Frontend calls handleMidtransPaymentEnhanced**
7. **Popup payment interface appears**

## Log Points

### Backend Logs
- `Creating Midtrans transaction for order: ...`
- `Midtrans response: ...`
- `Returning response: ...`

### Frontend Logs
- `Transaction created successfully: ...`
- `Token: ...`
- `Redirect URL: ...`
- `Enhanced Midtrans payment handler`

## Troubleshooting Checklist

- [ ] Backend server running
- [ ] `.env` file configured correctly
- [ ] Midtrans keys are valid
- [ ] Network connection stable
- [ ] Snap.js loaded in frontend
- [ ] No CSP errors in browser console
- [ ] Test endpoint `/test-midtrans` works
