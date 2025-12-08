from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    admin_id: Optional[str] = None
