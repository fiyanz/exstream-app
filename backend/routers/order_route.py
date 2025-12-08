from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from db.database import get_db
from models.order_model import Order
from service.order_service import OrderService
from schemas.transaksi_schemas import TransaksiCreateEnhanced
from core.config import settings
from utils.auth_middleware import get_current_admin

order_router = APIRouter()

@order_router.post("/", status_code=201)
def create_order(order: TransaksiCreateEnhanced, db: Session = Depends(get_db)):
    """
    Unified Endpoint for creating orders (COD or Transfer).
    Replaces /transaksi/enhanced and /store_order/store_order
    """
    try:
        result = OrderService.create_order(db, order)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@order_router.get("/{order_id}/status")
def get_order_status(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order Not Found")
        
    return {
        "order_id": order.id,
        "status": order.order_status,
        "payment_status": order.payment_status,
        "midtrans_status": order.midtrans_token,
        "komerce_status": order.komerce_order_id
    }
