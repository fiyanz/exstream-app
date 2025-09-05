from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import Session, relationship
from db.database import Base
import uuid


class StoreOrder(Base):
    __tablename__ = "store_orders"

    id = Column(Integer, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    order_date = Column(String(50), index=True)
    brand_name = Column(String(255), index=True)
    shipper_name = Column(String(255), index=True)
    shipper_phone = Column(String(20), index=True)
    shipper_destination_id = Column(Integer, index=True)
    shipper_address = Column(String(500), index=True)
    shipper_email = Column(String(255), index=True)
    receiver_name = Column(String(255), index=True)
    receiver_phone = Column(String(20), index=True)
    receiver_destination_id = Column(Integer, index=True)
    receiver_address = Column(String(500), index=True)
    shipping = Column(String(100), index=True)
    shipping_type = Column(String(100), index=True)
    payment_method = Column(String(50), index=True)
    shipping_cost = Column(Integer, index=True)
    shipping_cashback = Column(Integer, index=True)
    service_fee = Column(Integer, index=True)
    additional_cost = Column(Integer, index=True)
    grand_total = Column(Integer, index=True)
    cod_value = Column(Integer, index=True)
    insurance_value = Column(Integer, index=True)
    order_details = relationship("OrderDetails", back_populates="order")



class OrderDetails(Base):
    __tablename__ = "order_details"

    id = Column(Integer, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(Integer, ForeignKey("store_orders.id"), index=True)
    product_name = Column(String(255), index=True)
    product_variant_name = Column(String(255), index=True)
    product_price = Column(Integer, index=True)
    product_width = Column(Integer, index=True)
    product_height = Column(Integer, index=True)
    product_weight = Column(Integer, index=True)
    product_length = Column(Integer, index=True)
    qty = Column(Integer, index=True)
    subtotal = Column(Integer, index=True)

    order = relationship("StoreOrder", back_populates="order_details")
