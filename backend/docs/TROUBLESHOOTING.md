# Troubleshooting Guide

## Error: "Object of type OrderItem is not JSON serializable"

**Penyebab**: Pydantic model tidak bisa langsung di-serialize ke JSON.

**Solusi**: ✅ **Sudah diperbaiki** - Menggunakan `item.dict()` untuk konversi.

## Error: "Failed to create transaction (500)"

**Penyebab**: Biasanya masalah dengan konfigurasi Midtrans atau database.

**Solusi**:
1. Pastikan file `.env` sudah dikonfigurasi dengan benar
2. Restart backend server setelah mengubah `.env`
3. Periksa log backend untuk error detail

## Error: "Gagal membuat transaksi Midtrans"

**Penyebab**: Midtrans keys belum dikonfigurasi atau salah.

**Solusi**:
1. Daftar di [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Dapatkan Server Key dan Client Key
3. Update file `.env`:
   ```env
   MIDTRANS_SERVER_KEY=SB-Mid-server-YourServerKeyHere
   MIDTRANS_CLIENT_KEY=SB-Mid-client-YourClientKeyHere
   MIDTRANS_IS_PRODUCTION=false
   ```

## Error: "Database connection failed"

**Penyebab**: Database tidak bisa diakses.

**Solusi**:
1. Pastikan database server berjalan
2. Periksa `DATABASE_URL` di `.env`
3. Untuk SQLite: pastikan file database ada dan writable

## Error: "CORS policy blocked"

**Penyebab**: Frontend tidak bisa akses backend.

**Solusi**:
1. Pastikan backend berjalan di port yang benar
2. Periksa CORS configuration di `main.py`
3. Pastikan frontend menggunakan URL yang benar

## Testing Checklist

- [ ] Backend server berjalan di `localhost:8000`
- [ ] Frontend server berjalan di `localhost:5173` (atau port lain)
- [ ] File `.env` sudah dikonfigurasi dengan Midtrans keys
- [ ] Database bisa diakses
- [ ] API endpoints bisa diakses (test di `/docs`)

## Common Issues

### 1. Midtrans Keys Not Set
```
Error: Gagal membuat transaksi Midtrans: [Errno 2] No such file or directory
```
**Fix**: Set environment variables di `.env`

### 2. Database Locked
```
Error: database is locked
```
**Fix**: Restart backend server

### 3. Port Already in Use
```
Error: Address already in use
```
**Fix**: Kill process yang menggunakan port atau ganti port

## Debug Mode

Untuk debugging, set di `.env`:
```env
DEBUG=true
```

Ini akan memberikan error messages yang lebih detail.
