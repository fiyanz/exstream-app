# 🚀 Exstream App - Project Documentation

Selamat datang di dokumentasi resmi **Exstream App**, sebuah platform *e-commerce single-page* yang dioptimalkan untuk performa tinggi, konversi cepat, dan pengalaman pengguna (*user experience*) kelas atas.

---

## 🛠️ Tech Stack

Aplikasi ini mengadopsi arsitektur **Decoupled (Client-Server)**:
- **Frontend:** React.js, Vite, Tailwind CSS v4, React Router DOM, Lucide React (Ikonografi).
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite (Development), Passlib + Bcrypt (Autentikasi).
- **Payment Gateway:** Midtrans (untuk transfer otomatis).
- **Courier API:** Biteship / Layanan Pengiriman Pihak Ketiga (Berdasarkan Kecamatan/Kode Pos).

---

## 📂 Struktur Proyek Utama

```text
exstream-app/
│
├── backend/                  # Otak Utama Sistem (FastAPI)
│   ├── core/                 # Variabel Lingkungan & Konfigurasi (.env)
│   ├── db/                   # Konfigurasi Koneksi Database SQLAlchemy
│   ├── models/               # Definisi Tabel Database (Admin, Transaksi)
│   ├── routers/              # Endpoint API (Admin, Order, Wilayah)
│   ├── schemas/              # Pydantic Models (Validasi Input/Output)
│   ├── service/              # Logika Bisnis (Notifikasi WA, Midtrans)
│   ├── main.py               # Entry Point Aplikasi Backend
│   └── create_admin.py       # Skrip utilitas pembuatan akun admin
│
├── frontend/                 # Wajah Aplikasi (React + Vite)
│   ├── src/
│   │   ├── components/       # Komponen UI Terpisah (Form, Loading, dll)
│   │   ├── features/         # Logika Spesifik Fitur (misal: Transaksi)
│   │   ├── pages/            # Halaman Penuh (LandingPage, AdminDashboard)
│   │   ├── services/         # Penghubung ke API Backend (fetch)
│   │   └── App.jsx           # Konfigurasi Routing
│   └── index.css             # Tailwind Directives & Konfigurasi Tema
│
└── docs/                     # Repositori Dokumentasi
```

---

## 💻 Panduan Menjalankan Aplikasi Lokal (Development)

Agar aplikasi dapat berjalan, Anda harus menjalankan *Backend* dan *Frontend* secara terpisah.

### 1. Menjalankan Backend (FastAPI)
Buka terminal dan arahkan ke direktori `backend/`:
```bash
cd backend

# Aktifkan virtual environment (opsional jika menggunakan 'uv run')
uv run python main.py
```
*Backend* akan berjalan di `http://127.0.0.1:8000`. 
Untuk melihat dokumentasi interaktif API (Swagger UI), kunjungi `http://127.0.0.1:8000/docs`.

### 2. Membangun Akun Admin Pertama
Jika *database* masih baru, buat akun admin dengan perintah:
```bash
uv run python create_admin.py
```
*(Default: username: `admin` | password: `admin123`)*

### 3. Menjalankan Frontend (Vite)
Buka tab terminal baru dan arahkan ke direktori `frontend/`:
```bash
cd frontend

# Install dependensi (hanya dilakukan sekali)
npm install

# Jalankan server development
npm run dev
```
*Frontend* akan berjalan di `http://localhost:5174` (atau sesuai konfigurasi Vite).

---

## ⚙️ Arsitektur Alur Transaksi (Checkout)

Aplikasi ini menggunakan sistem "Unified Order" (`order_route.py`) yang terpusat untuk menghindari kebingungan. 

1. **Pengisian Form:** Pelanggan mengisi formulir di `LandingPage` (termasuk memilih wilayah dari *waterfall dropdown* API).
2. **Pemilihan Pengiriman:** `domestic_route.py` bertugas mengkalkulasi harga ongkir secara *real-time* berdasarkan kode pos / ID Kecamatan.
3. **Pembayaran:**
   - **Jika Transfer Bank (Midtrans):** Backend meneruskan data ke Midtrans via `midtrans_service.py` untuk mendapatkan Token Snap, lalu pesanan disimpan dengan status `pending_payment`.
   - **Jika COD (Cash on Delivery):** Backend menyimpan pesanan dengan status `pending_cod`.
4. **Notifikasi WhatsApp:** Backend (`notification_service.py`) akan merakit struk pembelian rapi dan mengirimkan URL klik-ke-chat WA agar pembeli bisa melakukan konfirmasi langsung ke Admin.

---

## 🔒 Panel Admin (Material Design)

Panel Admin diakses melalui `/admin/login`.
Sistem autentikasi menggunakan **JWT (JSON Web Token)**.

Fitur Utama:
- **Statistik Dasbor:** Data metrik (Total Pesanan, Perlu Diproses, Pendapatan) yang diambil secara hidup (*live*) dari API `/api/v1/admin/dashboard-stats`.
- **Manajemen Pesanan:** Tabel transaksi modern dengan fitur Pencarian, *Filter* Status, dan Modal Rincian.
- **Update Pengiriman:** Admin dapat mengubah status menjadi `diproses` atau `dikirim`, lengkap dengan fitur pengisian Nomor Resi yang otomatis tersimpan di kolom *JSON* `detail_barang`.

---

## 🔧 Variabel Lingkungan (.env)

Pastikan file `backend/.env` Anda memiliki konfigurasi yang diperlukan, minimal:

```env
# URL Frontend & Backend
CORS_ORIGINS=http://localhost:5174,https://nama-domain-anda.com

# Konfigurasi Admin / WA
ADMIN_WHATSAPP=6282338886434
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Rahasia JWT
SECRET_KEY=kunci_rahasia_sangat_panjang_sekali
ALGORITHM=HS256
```

---
*Dokumentasi ini dibuat secara otomatis (Generated) pada Juli 2026 berdasarkan arsitektur Exstream App terkini.*
