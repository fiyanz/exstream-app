import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers.auth_route import auth_router
from routers.order_route import order_router
from routers.transaksi_route import transaksi
from routers.store_order_route import store_order
from routers.domestic_route import domesticCostRequest
from routers.wilayah_route import wilayah
from routers.admin_route import admin_api_router
from db.database import Base, engine

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)
logger.info("Database tables verified/created.")

app = FastAPI(
    title="Exstream API",
    description="E-commerce API for Jas Hujan Extrime",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth_router,
    prefix=f"{settings.API_PREFIX}/auth",
    tags=["Admin Authentication"]
)

app.include_router(
    order_router,
    prefix=f"{settings.API_PREFIX}/orders",
    tags=["Unified Orders"]
)

app.include_router(
    admin_api_router,
    prefix=f"{settings.API_PREFIX}/admin",
    tags=["Admin Panel API"]
)

app.include_router(
    wilayah,
    prefix=f"{settings.API_PREFIX}/wilayah",
    tags=["Wilayah Indonesia"]
)

app.include_router(
    domesticCostRequest,
    prefix=f"{settings.API_PREFIX}/domestic",
    tags=["Domestic Shipping API"]
)

app.include_router(
    transaksi,
    prefix=f"{settings.API_PREFIX}/transaksi",
    tags=["Transaksi"]
)

app.include_router(
    store_order,
    prefix=f"{settings.API_PREFIX}/store_order",
    tags=["Store Order"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
