# 💳 Sistem Transaksi & Alur Pemesanan (Unified Checkout)

> **Catatan Pembaruan (Juli 2026):** 
> Sistem "2-step transaction" lama (`/api/v1/transaksi/store-order` dan `/api/v1/transaksi/enhanced`) **telah usang (deprecated)**. Seluruh alur transaksi kini dipusatkan ke **Satu Titik API Terpadu (Unified Endpoint)** untuk menjamin konsistensi harga, meminimalisir *bug*, dan mendukung metode COD secara instan tanpa perlu memutar rute.

---

## 🎯 Paradigma Baru: Unified Order System

Semua proses (Penyimpanan ke Database, Kalkulasi Diskon, Perhitungan Ongkos Kirim, dan Integrasi Gateway Pembayaran) diproses secara atomik dalam 1 *request*.

### 🔗 Endpoint Utama
```http
POST /api/v1/orders/unified
```

### 📥 Skema Input (Dari Frontend)
Frontend sekarang langsung mengirim satu objek JSON utuh saat tombol pemesanan ditekan:
```json
{
  "customer_name": "Budi Santoso",
  "customer_phone": "08123456789",
  "customer_address": "Jl. Merdeka No. 1",
  "items": [
    {
      "name": "Jas Hujan Extrime",
      "price": 299000,
      "quantity": 1,
      "color": "Hitam",
      "size": "XL"
    }
  ],
  "subtotal": 299000,
  "discount": 0,
  "shipping_method": "JNE REG",
  "shipping_cost": 15000,
  "total": 314000,
  "payment_method": "midtrans" // atau "cod"
}
```

---

## 🔄 Alur Pemrosesan (Backend)

Saat `POST /api/v1/orders/unified` diterima, Backend melakukan langkah-langkah berikut:

1. **Validasi Harga (Security):** Backend mencocokkan `subtotal`, `discount`, dan `shipping_cost` untuk memastikan `total` yang dikirim frontend benar (mencegah eksploitasi peretasan harga).
2. **Penyimpanan Database:** Menyimpan data ke tabel `transaksi` dengan format JSON lengkap (termasuk varian produk, biaya kirim, dan potongan harga) di dalam kolom `detail_barang`.
3. **Pencabangan Metode Pembayaran (Payment Branching):**
   
   - 🏦 **Jika `payment_method` == "midtrans":**
     - Backend menghubungi API Midtrans (menggunakan fungsi `create_payment` di `payment_gateway_service.py`).
     - Menyematkan `shipping_cost` dan `discount` secara natif ke keranjang Midtrans (menggunakan objek ID *dummy* agar terbaca di antarmuka Midtrans).
     - Mengubah status pesanan menjadi `pending_payment`.
     - Mengembalikan **Snap Token** dan URL pembayaran ke frontend.

   - 🚚 **Jika `payment_method` == "cod":**
     - Mengubah status pesanan menjadi `pending_cod`.
     - Backend secara otomatis memanggil `notification_service.py` untuk menghasilkan struk tagihan format WhatsApp.
     - Mengembalikan `whatsapp_url` khusus agar frontend bisa langsung mengarahkan pengguna ke chat konfirmasi Admin.

---

## 📤 Skema Output (Respons Backend)

### 1. Respons untuk Midtrans (Transfer)
```json
{
  "order_id": "87f518fa-...",
  "status": "pending_payment",
  "payment_method": "midtrans",
  "payment_token": "92a54366-...",
  "payment_url": "https://app.sandbox.midtrans.com/snap/v3/redirection/...",
  "whatsapp_url": null,
  "total": 314000
}
```

### 2. Respons untuk COD
```json
{
  "order_id": "87f518fa-...",
  "status": "pending_cod",
  "payment_method": "cod",
  "payment_token": null,
  "payment_url": null,
  "whatsapp_url": "https://api.whatsapp.com/send?phone=6282338886434&text=...[struk_belanja]...",
  "total": 314000
}
```

## ✅ Kesimpulan Manfaat Sistem Baru
- Frontend **sangat bersih**, hanya berfokus melempar JSON dan merespon pop-up.
- Backend adalah "Sumber Kebenaran Tunggal" (*Single Source of Truth*), meminimalisir salah hitung ongkos kirim.
- Format pesan WA diproses aman di *backend* agar variabel tidak mudah disabotase/dimodifikasi oleh skrip dari *browser* pihak ketiga.
