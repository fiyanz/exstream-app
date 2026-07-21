# 🚀 Panduan Migrasi Server & Database (Production)

Dokumen ini merangkum langkah-langkah memigrasikan aplikasi Exstream dari lingkungan *Development* (Lokal) menuju ke Server *Production* (VPS), serta cara memindahkan *database* bawaan (SQLite) ke pengelola *database* yang lebih tangguh (PostgreSQL).

---

## 🏗️ 1. Persiapan Server (VPS)

Disarankan menggunakan sistem operasi **Ubuntu 22.04 / 24.04 LTS**.

### Instalasi Perangkat Lunak Wajib
Masuk ke VPS Anda via SSH dan jalankan perintah berikut:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nodejs npm nginx postgresql postgresql-contrib certbot python3-certbot-nginx
```

---

## 🗄️ 2. Migrasi Database (Dari SQLite ke PostgreSQL)

Secara bawaan, aplikasi ini menggunakan SQLite untuk kecepatan *development*. Untuk *production*, Anda wajib menggunakan PostgreSQL agar bisa melayani ribuan pembeli secara bersamaan tanpa terkunci (*database lock*).

### A. Konfigurasi PostgreSQL
1. Masuk ke terminal PostgreSQL:
   ```bash
   sudo -u postgres psql
   ```
2. Buat *database* dan *user* baru:
   ```sql
   CREATE DATABASE exstream_db;
   CREATE USER exstream_user WITH PASSWORD 'password_rahasia_anda';
   ALTER ROLE exstream_user SET client_encoding TO 'utf8';
   ALTER ROLE exstream_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE exstream_user SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE exstream_db TO exstream_user;
   \q
   ```

### B. Modifikasi di Aplikasi Backend
Buka file `backend/.env` di server Anda dan ubah URL *database* dari yang semula SQLite menjadi URL PostgreSQL:
```env
# Sebelumnya (Komentar atau hapus baris ini)
# DATABASE_URL=sqlite:///./sql_app.db

# Gunakan ini untuk Production
DATABASE_URL=postgresql://exstream_user:password_rahasia_anda@localhost/exstream_db
```

### C. Migrasi Data Lama (Opsional)
Jika Anda memiliki data dari SQLite (`backend/sql_app.db`) yang ingin dibawa ke PostgreSQL, gunakan utilitas pengekspor seperti `pgloader`:
```bash
sudo apt install pgloader
pgloader sqlite:///path/to/backend/sql_app.db postgresql://exstream_user:password_rahasia_anda@localhost/exstream_db
```

---

## ⚙️ 3. Menjalankan Backend (FastAPI) dengan Systemd

Di server *production*, API tidak boleh dijalankan dengan sekadar `uv run python main.py` karena akan mati saat Anda menutup terminal. Gunakan `systemd` atau `pm2`.

**Membuat Layanan Systemd untuk Backend:**
```bash
sudo nano /etc/systemd/system/exstream-backend.service
```
Isi dengan:
```ini
[Unit]
Description=Gunicorn instance to serve Exstream FastAPI
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/var/www/exstream-app/backend
Environment="PATH=/var/www/exstream-app/backend/.venv/bin"
# Gunakan Uvicorn worker untuk performa maksimal
ExecStart=/var/www/exstream-app/backend/.venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000

[Install]
WantedBy=multi-user.target
```
Lalu nyalakan layanannya:
```bash
sudo systemctl start exstream-backend
sudo systemctl enable exstream-backend
```

---

## 🌐 4. Membangun Frontend (Vite)

Di lingkungan *production*, Anda **tidak boleh** menggunakan `npm run dev`. Anda harus melakukan *build* agar kode React diubah menjadi HTML/CSS statis yang sangat ringan.

```bash
cd /var/www/exstream-app/frontend
npm install
npm run build
```
Hasil kompilasi akan berada di folder `/var/www/exstream-app/frontend/dist`. Folder inilah yang akan dibaca oleh Nginx.

---

## 🛡️ 5. Konfigurasi Nginx & HTTPS (SSL)

Kita menggunakan Nginx sebagai *Reverse Proxy* untuk menghubungkan domain ke Frontend statis dan Backend API secara bersamaan.

### A. Buat Konfigurasi Server Block
```bash
sudo nano /etc/nginx/sites-available/exstream
```
Isi dengan konfigurasi berikut:
```nginx
server {
    server_name nama-domain-anda.com;

    # Blok untuk melayani UI Frontend (React Static Files)
    location / {
        root /var/www/exstream-app/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html; # Penting untuk React Router
    }

    # Blok untuk meneruskan request ke Backend FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### B. Aktifkan dan Uji Konfigurasi
```bash
sudo ln -s /etc/nginx/sites-available/exstream /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### C. Pasang SSL/HTTPS (Gratis dengan Certbot)
Sistem pembayaran dan API moderat sangat mewajibkan protokol HTTPS.
```bash
sudo certbot --nginx -d nama-domain-anda.com
```

---
🎉 **Selamat!** Aplikasi Exstream Anda kini sudah berjalan penuh dengan performa maksimal dan tersambung ke *database* PostgreSQL yang stabil.
