# 🌧️ Jas Hujan Extrime - E-Commerce App

Selamat datang di repositori resmi **Jas Hujan Extrime**! Aplikasi ini merupakan platform *single-page e-commerce* super cepat yang dirancang untuk memaksimalkan *conversion rate*. Dibangun menggunakan teknologi terdepan dengan desain *Material* yang bersih, mulus, dan responsif.

![Extrime Banner](./frontend/src/assets/Extrime/Header/Banner_3.webp) <!-- Ganti dengan banner asli Anda jika berbeda -->

---

## ✨ Fitur Utama

- **🚀 Performa Tinggi:** Antarmuka React (Vite) yang super cepat tanpa *loading* antar halaman.
- **📱 Desain Responsif & Premium:** Menggunakan *Tailwind CSS v4* dengan estetika layaknya produk Google Stitch.
- **🛒 Unified Checkout System:** Formulir pemesanan, pemilihan ukuran & warna, serta pemilihan kurir tergabung dalam satu layar.
- **📍 Dynamic Shipping Rates:** Kalkulasi ongkos kirim otomatis berdasarkan Kecamatan/Kode Pos pelanggan via layanan pihak ketiga.
- **💳 Multi-Metode Pembayaran:** 
  - Integrasi **Midtrans** untuk transfer bank/e-wallet instan.
  - Opsi **COD (Cash On Delivery)** untuk pembayaran di tempat.
- **🤖 WhatsApp Automation:** Bot akan membuat struk digital rapi yang mengarahkan pembeli langsung ke chat WA Admin.
- **📊 Material Admin Panel:** Panel kelola (*dashboard*) tersembunyi yang dilindungi dengan keamanan JWT untuk memantau pendapatan dan mengubah status/resi pesanan.

---

## 🛠️ Tech Stack (Teknologi)

| Bagian | Teknologi / Framework | Deskripsi |
| --- | --- | --- |
| **Frontend** | React.js, Vite, TailwindCSS v4 | Menyajikan UI yang ringan, interaktif, dan modern. |
| **Backend** | Python, FastAPI, SQLAlchemy | Otak sistem yang sangat cepat dalam memproses kalkulasi dan *database*. |
| **Database** | SQLite (Dev) / PostgreSQL (Prod) | Sistem manajemen data transaksi. |
| **Security** | Passlib, Bcrypt, JWT Auth | Enkripsi *password* dan sesi rahasia Admin. |
| **Gateway** | Midtrans (Payment) | Gerbang transfer transaksi secara otomatis. |

---

## 🚀 Cara Menjalankan Aplikasi di Komputer Anda (Lokal)

Aplikasi ini menggunakan struktur *Decoupled*, artinya *Frontend* dan *Backend* dipisah ke dalam dua folder berbeda.

### 1️⃣ Prasyarat
- **Node.js** (Versi 18+ disarankan)
- **Python** (Versi 3.10+ disarankan)
- **uv** (Python Package Manager super cepat)

### 2️⃣ Konfigurasi Backend (FastAPI)
Buka terminal dan arahkan ke direktori `backend/`:
```bash
cd backend

# Buat env (Opsional jika Anda tidak punya file .env bawaan)
# Salin konfigurasi dari .env.example jika ada, atau buat baru.

# Jalankan server
uv run python main.py
```
> 💡 *Server akan berjalan di `http://127.0.0.1:8000`. Dokumentasi API bisa dilihat di `/docs`.*

**Membuat Akun Admin Pertama:**
Jika database belum diisi, buat akun admin bawaan agar Anda bisa login ke panel:
```bash
uv run python create_admin.py
```

### 3️⃣ Konfigurasi Frontend (React)
Buka tab terminal baru dan arahkan ke direktori `frontend/`:
```bash
cd frontend

# Install semua dependensi
npm install

# Jalankan Vite server
npm run dev
```
> 💡 *Aplikasi kini bisa diakses melalui browser di `http://localhost:5174` (atau sesuai konfigurasi lokal Anda).*

---

## 📖 Dokumentasi Lengkap

Untuk melihat dokumentasi yang jauh lebih mendalam (seperti Arsitektur Sistem, Penjelasan API, Konfigurasi *Environment*, dan Pemecahan Masalah), silakan baca selengkapnya di dalam direktori `docs`:

👉 **[Buku Panduan Utama Exstream App (EXSTREAM_APP_DOCUMENTATION.md)](./docs/EXSTREAM_APP_DOCUMENTATION.md)**

---

<div align="center">
  Dibuat dengan ❤️ untuk Extrime Store.
</div>
