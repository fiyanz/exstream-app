from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_serializer

class Settings(BaseSettings):
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    ALLOWED_ORIGINS: str = ""
    DATABASE_URL: str = ""
    RAJA_ONGKIR_API: str = ""
    KOMERCE_BASE_URL: str = ""
    MY_ORIGIN_DESTINATION_ID: str = ""


    @field_serializer("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, value: str) -> List[str]:
        return value.split(",") if value else []
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()