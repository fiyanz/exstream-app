from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import json
from datetime import datetime

from db.database import get_db
from models.transaksi_model import Barang
from models.admin_model import Admin
from utils.auth_middleware import get_current_admin
from pydantic import BaseModel

admin_api_router = APIRouter()

class OrderStatusUpdate(BaseModel):
    status: str
    resi: Optional[str] = None

@admin_api_router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    all_orders = db.query(Barang).all()
    
    total_orders = len(all_orders)
    pending_orders = sum(1 for o in all_orders if o.status in ("pending", "pending_payment", "pending_cod"))
    completed_orders = sum(1 for o in all_orders if o.status in ("selesai", "PAID", "lunas", "dikirim"))
    
    # Calculate revenue (only from completed/paid/cod orders that are valid)
    valid_statuses = ("PAID", "lunas", "dikirim", "selesai", "pending_cod", "diproses")
    total_revenue = sum(o.total for o in all_orders if o.status in valid_statuses)

    # Get 5 recent orders
    recent_db = db.query(Barang).order_by(Barang.id.desc()).limit(5).all()
    recent_orders = []
    for o in recent_db:
        try:
            details = json.loads(o.detail_barang) if o.detail_barang else {}
        except:
            details = {}
        
        recent_orders.append({
            "id": o.id,
            "nama_pengguna": o.nama_pengguna,
            "total": o.total,
            "status": o.status,
            "payment_method": details.get("payment_method", "UNKNOWN")
        })

    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "completed_orders": completed_orders,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders
    }

@admin_api_router.get("/orders")
def get_all_orders(
    skip: int = 0, 
    limit: int = 50, 
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_admin: Admin = Depends(get_current_admin)
):
    query = db.query(Barang)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Barang.id.like(search_pattern)) | 
            (Barang.nama_pengguna.like(search_pattern)) | 
            (Barang.no_telp.like(search_pattern))
        )
        
    if status_filter and status_filter != "all":
        query = query.filter(Barang.status == status_filter)
        
    total = query.count()
    orders_db = query.order_by(Barang.id.desc()).offset(skip).limit(limit).all()
    
    orders = []
    for o in orders_db:
        try:
            details = json.loads(o.detail_barang) if o.detail_barang else {}
        except:
            details = {}
            
        orders.append({
            "id": o.id,
            "no_telp": o.no_telp,
            "nama_pengguna": o.nama_pengguna,
            "total": o.total,
            "status": o.status,
            "alamat": o.alamat,
            "details": details
        })
        
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "orders": orders
    }

@admin_api_router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: str, 
    update_data: OrderStatusUpdate,
    db: Session = Depends(get_db), 
    current_admin: Admin = Depends(get_current_admin)
):
    order = db.query(Barang).filter(Barang.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = update_data.status
    
    if update_data.resi:
        try:
            details = json.loads(order.detail_barang) if order.detail_barang else {}
            details["resi_pengiriman"] = update_data.resi
            order.detail_barang = json.dumps(details)
        except:
            pass
            
    db.commit()
    
    return {"message": "Status updated successfully", "status": order.status}
