from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_serializer

class Settings(BaseSettings):
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    DATABASE_URL: str = ""
    SHIPPING_COST_API_KEY: str = ""

    KOMERCE_API_KEY: str = ""
    KOMERCE_BASE_URL: str = ""
    RAJA_ONGKIR_BASE_URL: str = ""
    KOMERCE_ORDER_BASE_URL: str = ""
    MY_ORIGIN_DESTINATION_ID: str = ""
    RAJA_ONGKIR_DESTINATION_URL: str = ""
    MIDTRANS_SERVER_KEY: str = ""
    MIDTRANS_CLIENT_KEY: str = ""
    MIDTRANS_IS_PRODUCTION: bool = True
    ADMIN_WHATSAPP: str = ""

    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()