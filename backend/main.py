from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from core.config import settings
from routers.wilayah import wilayah
from routers.lokasi import lokasi
from routers.cost_ongkir import cost_ongkir
from routers.cost_ongkir_local import cost_ongkir_lokal
from routers.transaksi import transaksi
from routers.store_order import store_order
from routers.domestic import ongkir_router

from db.database import Base, engine

Base.metadata.create_all(bind=engine)
print("Semua tabel telah dibuat.")

app = FastAPI(
    title="extreme app",
    description="An app for extreme apps",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wilayah, prefix=f"{settings.API_PREFIX}/wilayah", tags=["Wilayah"])
app.include_router(
    wilayah,
    prefix=f"{settings.API_PREFIX}/wilayah",
    tags=["Wilayah Indonesia"]
)

app.include_router(
    lokasi,
    prefix="/api/v1/lokasi",
    tags=["Pencarian Lokasi Menggunakan API"]
)

app.include_router(
    cost_ongkir,
    prefix="/api/v1/cost_ongkir",
    tags=["Pengiriman API Raja Ongkir"]
)

app.include_router(
    cost_ongkir_lokal,
    prefix="/api/v1/cost_ongkir_lokal",
    tags=["Pengiriman dengan Data Lokal"]
)

# app.include_router(
#     ongkir_router,
#     prefix="/api/v1/hitung-domestik",
#     tags=["Hitung Domestik"]
# )

app.include_router(
    transaksi,
    prefix="/api/v1/transaksi",
    tags=["Transaksi"]
)

app.include_router(
    store_order,
    prefix="/api/v1/store_order",
    tags=["Store Order"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
