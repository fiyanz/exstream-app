# Midtrans Keys Setup Guide

## 🔑 Error 401 "Access denied due to unauthorized transaction"

Masalah ini terjadi karena Midtrans server key tidak valid atau tidak sesuai dengan environment.

## 📋 Langkah Perbaikan:

### 1. **Dapatkan Midtrans Keys yang Benar**

#### Sandbox Keys (untuk development):
1. Login ke [Midtrans Dashboard Sandbox](https://dashboard.sandbox.midtrans.com/)
2. Pilih environment **Sandbox**
3. Go to **Settings** → **Access Keys**
4. Copy:
   - **Server Key** (format: `SB-Mid-server-xxxxxxxx`)
   - **Client Key** (format: `SB-Mid-client-xxxxxxxx`)

#### Production Keys (untuk live):
1. Login ke [Midtrans Dashboard Production](https://dashboard.midtrans.com/)
2. Pilih environment **Production**
3. Go to **Settings** → **Access Keys**
4. Copy:
   - **Server Key** (format: `Mid-server-xxxxxxxx`)
   - **Client Key** (format: `Mid-client-xxxxxxxx`)

### 2. **Update Backend .env File**

Buat/edit file `.env` di folder `backend/`:

```env
# Midtrans Configuration (SANDBOX untuk development)
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_ACTUAL_SANDBOX_SERVER_KEY
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_ACTUAL_SANDBOX_CLIENT_KEY
MIDTRANS_IS_PRODUCTION=false
```

### 3. **Update Frontend Client Key**

Edit `frontend/index.html`:

```html
<!-- Midtrans Snap.js Sandbox -->
<script type="text/javascript" src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key="SB-Mid-client-YOUR_ACTUAL_SANDBOX_CLIENT_KEY"></script>
```

### 4. **Restart Backend Server**

```bash
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## ⚠️ **Important Notes:**

1. **Server Key** hanya untuk backend, jangan expose ke frontend
2. **Client Key** untuk frontend Snap.js
3. Sandbox keys harus digunakan dengan sandbox URLs
4. Production keys harus digunakan dengan production URLs
5. Keys harus match dengan environment setting

## 🧪 **Test Connection:**

Setelah update keys, test dengan:
1. Buat transaksi baru
2. Check console log backend untuk konfirmasi keys
3. Pastikan tidak ada error 401

## 🔄 **Environment Switching:**

### Untuk Development (Sandbox):
- `MIDTRANS_IS_PRODUCTION=false`
- Server Key: `SB-Mid-server-xxx`
- Client Key: `SB-Mid-client-xxx`
- Snap URL: `https://app.sandbox.midtrans.com/snap/snap.js`

### Untuk Production:
- `MIDTRANS_IS_PRODUCTION=true`
- Server Key: `Mid-server-xxx`
- Client Key: `Mid-client-xxx`
- Snap URL: `https://app.midtrans.com/snap/snap.js`
