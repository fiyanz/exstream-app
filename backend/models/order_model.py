import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from db.database import Base

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Customer Info
    customer_name: Mapped[str] = mapped_column(String(255), index=True)
    customer_phone: Mapped[str] = mapped_column(String(20), index=True)
    customer_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Shipping Address (Normalized)
    shipping_address: Mapped[str] = mapped_column(String(500))  # Full address text
    province_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    city_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    subdistrict_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    village_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Snapshot of location names for receipt consistency
    province_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    subdistrict_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    village_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Order Details
    total_amount: Mapped[int] = mapped_column(Integer, default=0)
    shipping_cost: Mapped[int] = mapped_column(Integer, default=0)
    discount_amount: Mapped[int] = mapped_column(Integer, default=0)
    final_total: Mapped[int] = mapped_column(Integer, default=0)
    
    # Payment & Status
    payment_method: Mapped[str] = mapped_column(String(50), default="Transfer")  # "Transfer", "COD"
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")  # "pending", "paid", "failed", "expired"
    order_status: Mapped[str] = mapped_column(String(50), default="created")  # "created", "processed", "shipped", "completed", "cancelled"
    
    # External References
    midtrans_order_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    midtrans_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    midtrans_redirect_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    komerce_order_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    airway_bill: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id"), index=True)
    
    product_name: Mapped[str] = mapped_column(String(255))
    variant_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # e.g. "Merah - XL"
    color: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    size: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    price: Mapped[int] = mapped_column(Integer, default=0)
    subtotal: Mapped[int] = mapped_column(Integer, default=0)
    
    weight_grams: Mapped[int] = mapped_column(Integer, default=0)
    
    order: Mapped["Order"] = relationship("Order", back_populates="items")
