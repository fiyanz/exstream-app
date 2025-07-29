from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_serializer

class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    ALLOWED_ORIGINS: str = ""
    DATABASE_URL: str = ""


    @field_serializer("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, value: str) -> List[str]:
        return value.split(",") if value else []
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()