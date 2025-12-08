from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from db.database import get_db
from models.admin_model import Admin
from service.auth_service import verify_token
from schemas.admin_schemas import TokenData

# Bearer token security scheme
security = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Admin:
    """
    Dependency to get the current authenticated admin from JWT token
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        db: Database session
    
    Returns:
        Admin object if token is valid
    
    Raises:
        HTTPException: If token is invalid or admin not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    
    # Verify and decode token
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    admin_id: str = payload.get("admin_id")
    
    if username is None or admin_id is None:
        raise credentials_exception
    
    # Get admin from database
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    
    if admin is None:
        raise credentials_exception
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    return admin


def get_optional_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[Admin]:
    """
    Optional dependency to get admin if token is present
    
    Returns None if no token is provided instead of raising exception
    """
    if credentials is None:
        return None
    
    try:
        return get_current_admin(credentials, db)
    except HTTPException:
        return None
