import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from schemas.store_order_schemas import StoreOrderRequest, StoreOrderResponse
from service.store_order_service import process_store_order

logger = logging.getLogger(__name__)

store_order = APIRouter()

@store_order.post("/store_order", response_model=StoreOrderResponse)
def create_store_order(order: StoreOrderRequest, db: Session = Depends(get_db)):
    """
    Create a new store order.
    Delegates validation, Komerce API request, and database operations
    to process_store_order service.
    """
    try:
        komerce_response = process_store_order(order, db)
        return komerce_response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_store_order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
