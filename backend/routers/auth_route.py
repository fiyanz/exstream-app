from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from db.database import get_db
from models.admin_model import Admin
from schemas.admin_schemas import AdminLogin, TokenResponse, AdminResponse
from service.auth_service import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from utils.auth_middleware import get_current_admin

auth_router = APIRouter()


@auth_router.post("/login", response_model=TokenResponse)
def login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """
    Admin login endpoint
    
    Authenticates admin credentials and returns JWT access token
    """
    # Find admin by username
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(login_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if admin is active
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username, "admin_id": admin.id},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse.model_validate(admin)
    )


@auth_router.get("/me", response_model=AdminResponse)
def get_current_admin_profile(current_admin: Admin = Depends(get_current_admin)):
    """
    Get current authenticated admin profile
    
    Requires valid JWT token in Authorization header
    """
    return AdminResponse.model_validate(current_admin)


@auth_router.post("/refresh", response_model=TokenResponse)
def refresh_token(current_admin: Admin = Depends(get_current_admin)):
    """
    Refresh JWT access token
    
    Generates a new token for the currently authenticated admin
    """
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_admin.username, "admin_id": current_admin.id},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        admin=AdminResponse.model_validate(current_admin)
    )
