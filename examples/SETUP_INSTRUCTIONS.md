# Midtrans Snap Production Integration - Setup Instructions

## 🚨 PENTING: Konfigurasi Production Keys

### 1. Dapatkan Production Keys dari Midtrans Dashboard
- Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
- Pilih environment **Production** (bukan Sandbox)
- Ambil:
  - **Server Key**: `Mid-server-xxxxxxxxxxxxxxxx`
  - **Client Key**: `Mid-client-xxxxxxxxxxxxxxxx`

### 2. Update Konfigurasi

#### Untuk Node.js Version:
1. Edit `examples/midtrans-nodejs/server.js`:
   ```javascript
   serverKey: 'Mid-server-YOUR_PRODUCTION_SERVER_KEY', // Ganti ini
   clientKey: 'Mid-client-YOUR_PRODUCTION_CLIENT_KEY'  // Ganti ini
   ```

2. Edit `examples/midtrans-nodejs/index.html`:
   ```html
   <script src="https://app.midtrans.com/snap/snap.js" 
           data-client-key="Mid-client-YOUR_PRODUCTION_CLIENT_KEY"></script>
   ```

#### Untuk PHP Version:
1. Edit `examples/midtrans-php/create_transaction.php`:
   ```php
   $serverKey = 'Mid-server-YOUR_PRODUCTION_SERVER_KEY'; // Ganti ini
   ```

2. Edit `examples/midtrans-php/index.html`:
   ```html
   <script src="https://app.midtrans.com/snap/snap.js" 
           data-client-key="Mid-client-YOUR_PRODUCTION_CLIENT_KEY"></script>
   ```

## 🚀 Cara Menjalankan

### Node.js Version:
```bash
cd examples/midtrans-nodejs
npm install
npm start
```
Buka: http://localhost:3001 untuk backend, dan buka `index.html` di browser

### PHP Version:
1. Pastikan PHP dan web server (Apache/Nginx) sudah running
2. Copy folder `examples/midtrans-php` ke document root
3. Buka: http://localhost/midtrans-php/index.html

## 🔍 Troubleshooting

### Error "Transaksi tidak ditemukan":
1. **Pastikan menggunakan Production Keys** (bukan Sandbox)
2. **Order ID harus unik** - kode sudah generate otomatis dengan timestamp
3. **Periksa format Server Key** - harus dimulai dengan `Mid-server-`
4. **Periksa format Client Key** - harus dimulai dengan `Mid-client-`

### Debug Information:
- Semua kode sudah dilengkapi dengan extensive logging
- Buka Developer Console (F12) untuk melihat debug info
- Backend akan menampilkan detail request/response

### Validasi Keys:
- Server Key: `Mid-server-xxxxxxxxxxxxxxxx`
- Client Key: `Mid-client-xxxxxxxxxxxxxxxx`
- isProduction: `true`
- Snap URL: `https://app.midtrans.com/snap/snap.js`

## ⚡ Fitur Kode:

### ✅ Order ID Selalu Unik
```javascript
// Node.js
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORDER-${timestamp}-${random}`;
}
```

```php
// PHP
function generateOrderId() {
    $timestamp = round(microtime(true) * 1000);
    $random = rand(100, 999);
    return "ORDER-{$timestamp}-{$random}";
}
```

### ✅ Production Configuration
- `isProduction: true`
- Production Snap URL
- Production Server/Client Keys

### ✅ Comprehensive Debug Logging
- Request/Response logging
- Token generation tracking
- Error handling dengan detail
- Frontend console logging

### ✅ Simple & Lightweight
- Minimal dependencies
- Straightforward implementation
- Easy to customize

## 🎯 Next Steps:
1. Update semua keys dengan Production keys Anda
2. Test dengan amount kecil terlebih dahulu
3. Monitor logs untuk memastikan tidak ada error
4. Implement di aplikasi utama Anda

## 📞 Support:
Jika masih ada masalah, periksa:
1. Console logs (F12)
2. Network tab untuk melihat API calls
3. Midtrans Dashboard untuk transaction logs
