FROM python:3.10-slim

# Mencegah Python membuat file .pyc (bytecode) dan menahan log output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Menginstal uv untuk manajemen dependensi yang super cepat
RUN pip install uv

# Menyalin file konfigurasi dependensi terlebih dahulu (memanfaatkan cache Docker)
COPY pyproject.toml uv.lock ./

# Menginstal semua dependensi menggunakan uv
RUN uv sync --frozen

# Menyalin seluruh kode sumber backend
COPY . .

# Ekspos port yang digunakan oleh FastAPI
EXPOSE 8000

# Perintah utama untuk menyalakan server backend
CMD ["uv", "run", "python", "main.py"]
