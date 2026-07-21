# 🐳 Panduan Penggunaan Docker Container (Sangat Mudah!)

Dengan hadirnya berkas `docker-compose.yml`, aplikasi **Jas Hujan Extrime** kini memiliki dukungan penuh untuk *containerization*. Artinya, Anda tidak perlu lagi repot menginstal Node.js, Python, atau PostgreSQL secara manual di komputer/server mana pun! 

Cukup satu klik, semuanya menyala otomatis.

---

## 🔧 1. Syarat Utama
Pastikan komputer / server VPS Anda sudah terpasang:
- **Docker**
- **Docker Compose**

*(Jika Anda menggunakan Windows/Mac, cukup instal "Docker Desktop").*

---

## 🚀 2. Cara Menyalakan Aplikasi Secara Keseluruhan

1. Buka terminal dan arahkan ke direktori paling depan proyek ini (lokasi yang sama dengan file `docker-compose.yml`).
2. Jalankan perintah ajaib ini:
   ```bash
   docker compose up -d --build
   ```

**Apa yang akan terjadi?**
- 🗄️ Docker akan mengunduh dan menyalakan Database PostgreSQL (*port* 5432).
- ⚙️ Docker akan menyalin `backend/`, menginstal `uv`, dan menjalankan peladen FastAPI (*port* 8000).
- 🌐 Docker akan mem-*build* file React (Vite) di `frontend/`, lalu meletakkannya di atas peladen Nginx yang super kencang (*port* 80).

**Hasilnya:**
Buka *browser* Anda dan kunjungi: 👉 **http://localhost** (Tidak perlu pakai port lagi, karena langsung dikendalikan oleh Nginx di port 80).

---

## 🛑 3. Cara Mematikan Aplikasi
Jika Anda ingin mematikan sistem (namun data transaksi tidak akan hilang karena sudah diikat oleh *Docker Volumes*):
```bash
docker compose down
```

---

## ⚠️ 4. Catatan Penting
- **Database Otomatis Pindah**: Karena Docker sekarang menggunakan `PostgreSQL` dari *image* resmi, Anda perlu membuat ulang akun Admin.
  - Masuk ke dalam *container* backend:
    ```bash
    docker exec -it exstream-backend bash
    ```
  - Lalu jalankan skrip pembuatan admin bawaan:
    ```bash
    uv run python create_admin.py
    ```
- **Port Bentrok**: Pastikan Anda tidak menjalankan aplikasi lain (misalnya XAMPP/Apache) yang menggunakan *port 80* secara bersamaan agar Nginx Docker tidak bertabrakan.
- **Environment**: Jika Anda mengganti *password* database di `docker-compose.yml`, pastikan menyamakannya di blok `DATABASE_URL` milik `backend`.
