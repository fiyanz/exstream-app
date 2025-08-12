import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.database import engine

# Jalankan SQL untuk menambah kolom yang diperlukan
with engine.connect() as connection:
    # Cek apakah kolom sudah ada
    result = connection.execute("SHOW COLUMNS FROM transaksi LIKE 'nama_pengguna'")
    rows = result.fetchall()
    
    # Jika kolom belum ada, tambahkan
    if len(rows) == 0:
        print("Menambah kolom nama_pengguna dan alamat...")
        connection.execute("ALTER TABLE transaksi ADD COLUMN nama_pengguna VARCHAR(100) NULL")
        connection.execute("ALTER TABLE transaksi ADD COLUMN alamat VARCHAR(500) NULL")
        print("Kolom berhasil ditambahkan!")
    else:
        print("Kolom nama_pengguna sudah ada. Tidak ada perubahan.")

print("Database update selesai!")
