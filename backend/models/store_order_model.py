import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base


class StoreOrder(Base):
    __tablename__ = "store_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_date: Mapped[str] = mapped_column(String(50), index=True)
    brand_name: Mapped[str] = mapped_column(String(255), index=True)
    shipper_name: Mapped[str] = mapped_column(String(255), index=True)
    shipper_phone: Mapped[str] = mapped_column(String(20), index=True)
    shipper_destination_id: Mapped[int] = mapped_column(Integer, index=True)
    shipper_address: Mapped[str] = mapped_column(String(500), index=True)
    shipper_email: Mapped[str] = mapped_column(String(255), index=True)
    receiver_name: Mapped[str] = mapped_column(String(255), index=True)
    receiver_phone: Mapped[str] = mapped_column(String(20), index=True)
    receiver_destination_id: Mapped[int] = mapped_column(Integer, index=True)
    receiver_address: Mapped[str] = mapped_column(String(500), index=True)
    shipping: Mapped[str] = mapped_column(String(100), index=True)
    shipping_type: Mapped[str] = mapped_column(String(100), index=True)
    payment_method: Mapped[str] = mapped_column(String(50), index=True)
    shipping_cost: Mapped[int] = mapped_column(Integer, index=True)
    shipping_cashback: Mapped[int] = mapped_column(Integer, index=True, default=0)
    service_fee: Mapped[int] = mapped_column(Integer, index=True)
    additional_cost: Mapped[int] = mapped_column(Integer, index=True, default=0)
    grand_total: Mapped[int] = mapped_column(Integer, index=True)
    cod_value: Mapped[int] = mapped_column(Integer, index=True)
    insurance_value: Mapped[int] = mapped_column(Integer, index=True, default=0)

    order_details: Mapped[list["OrderDetails"]] = relationship(
        "OrderDetails", back_populates="order"
    )


class OrderDetails(Base):
    __tablename__ = "order_details"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("store_orders.id"), index=True)
    product_name: Mapped[str] = mapped_column(String(255), index=True)
    product_variant_name: Mapped[str] = mapped_column(String(255), index=True)
    product_price: Mapped[int] = mapped_column(Integer, index=True)
    product_width: Mapped[int] = mapped_column(Integer, index=True)
    product_height: Mapped[int] = mapped_column(Integer, index=True)
    product_weight: Mapped[int] = mapped_column(Integer, index=True)
    product_length: Mapped[int] = mapped_column(Integer, index=True)
    qty: Mapped[int] = mapped_column(Integer, index=True)
    subtotal: Mapped[int] = mapped_column(Integer, index=True)

    order: Mapped["StoreOrder"] = relationship("StoreOrder", back_populates="order_details")
