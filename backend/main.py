from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers.wilayah import wilayah
from routers.lokasi import lokasi
from routers.pengiriman import pengiriman

app = FastAPI(
    title="extreme app",
    description="An app for extreme apps",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(wilayah, prefix=f"{settings.API_PREFIX}/wilayah", tags=["Wilayah"])
app.include_router(
    wilayah, 
    prefix=f"{settings.API_PREFIX}/wilayah",
    tags=["Wilayah Indonesia"]
)

app.include_router(
    lokasi,
    prefix="/api/v1/lokasi",
    tags=["Pencarian Lokasi"]
)

app.include_router(
    pengiriman,
    prefix="/api/v1/pengiriman",
    tags=["Pengiriman"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
