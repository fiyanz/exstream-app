from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from core.config import settings
from routers.wilayah_route import wilayah
from routers.transaksi_route import transaksi
from routers.store_order_route import store_order
from routers.domestic_route import domesticCostRequest

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
    domesticCostRequest,
    prefix="/api/v1/domestic",
    tags=["Domestic Shipping API"]
)

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
