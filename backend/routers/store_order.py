"""
curl --location 'https://api-sandbox.collaborator.komerce.id/order/api/v1/orders/store' \
--header 'x-api-key: yourapikey' \
--data-raw '{
    "order_date": "2025-08-07 11:00:00",                        
    "brand_name": "Komship",                                    
    "shipper_name": "Toko Official Komship",                    
    "shipper_phone": "6281234567689",                           
    "shipper_destination_id": 31597,                            
    "shipper_address": "order address detail",                  
    "shipper_email": "test@gmail.com",                          
    "receiver_name": "Buyer A",                                 
    "receiver_phone": "6281209876543",                          
    "receiver_destination_id": 39947,                           
    "receiver_address": "order destination address detail",     
    "shipping": "NINJA",                                          
    "shipping_type": "Standar",                                      
    "payment_method": "COD",                                    
    "shipping_cost": 18600,                                     
    "shipping_cashback": 0,
    "service_fee": 1921,
    "additional_cost": 0,
    "grand_total": 68600,
    "cod_value": 68600,
    "insurance_value": 0,
    "order_details": [
        {
            "product_name": "Komship package",
            "product_variant_name": "Komship variant product",
            "product_price": 50000,
            "product_width": 1,
            "product_height": 2,
            "product_weight": 2000,
            "product_length": 20,
            "qty": 1,
            "subtotal": 50000
        }
    ]
}'
"""

from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from core.config import settings
from db.database import get_db
from models.store_order import StoreOrder, StoreOrderDetail
from schemas.store_order import StoreOrderDetail, OrderDetails
from datetime import datetime

from core.config import settings


store_order = APIRouter()

@store_order.post("/", response_model=StoreOrderDetail)
def create_store_order(order: StoreOrderDetail, db: Session = Depends(get_db)):
    db_order = StoreOrder(**order.dict())
    
    



    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order
