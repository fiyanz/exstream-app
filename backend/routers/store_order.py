"""
Store Order Router for Komerce API Integration

This module handles store order operations including:
- Creating store orders via Komerce API
- Saving order data to local database
- Managing order details and items

Example cURL command for Komerce API:
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
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from core.config import settings
from db.database import get_db
from models.store_order import StoreOrder, OrderDetails
from schemas.store_order import StoreOrderRequest, StoreOrderResponse, StoreOrderDetail, OrderDetailItem
from service.store_order import create_store_order as create_komerce_order
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

store_order = APIRouter()

@store_order.post("/store_order", response_model=StoreOrderResponse)
def create_store_order(order: StoreOrderRequest, db: Session = Depends(get_db)):
    """
    Create a new store order
    
    This endpoint:
    1. Validates the order data
    2. Sends the order to Komerce API
    3. Saves the order to local database if API call is successful
    4. Returns the response from Komerce API
    """
    try:
        # Convert Pydantic model to dict for API call
        order_data = order.dict()
        
        # Call Komerce API to create the order
        logger.info(f"Creating store order via Komerce API")
        komerce_response = create_komerce_order(order_data)
        
        # Check if Komerce API call was successful
        if komerce_response.get("meta", {}).get("status") == "error":
            logger.error(f"Komerce API error: {komerce_response}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Komerce API error: {komerce_response.get('meta', {}).get('message', 'Unknown error')}"
            )
        
        # Save to local database if API call was successful
        try:
            # Create main order record
            db_order = StoreOrder(
                order_date=order.order_date,
                brand_name=order.brand_name,
                shipper_name=order.shipper_name,
                shipper_phone=order.shipper_phone,
                shipper_destination_id=order.shipper_destination_id,
                shipper_address=order.shipper_address,
                shipper_email=order.shipper_email,
                receiver_name=order.receiver_name,
                receiver_phone=order.receiver_phone,
                receiver_destination_id=order.receiver_destination_id,
                receiver_address=order.receiver_address,
                shipping=order.shipping,
                shipping_type=order.shipping_type,
                payment_method=order.payment_method,
                shipping_cost=order.shipping_cost,
                shipping_cashback=order.shipping_cashback,
                service_fee=order.service_fee,
                additional_cost=order.additional_cost,
                grand_total=order.grand_total,
                cod_value=order.cod_value,
                insurance_value=order.insurance_value
            )
            
            db.add(db_order)
            db.commit()
            db.refresh(db_order)
            
            # Create order detail records
            for detail_item in order.order_details:
                db_detail = OrderDetails(
                    order_id=db_order.id,
                    product_name=detail_item.product_name,
                    product_variant_name=detail_item.product_variant_name,
                    product_price=detail_item.product_price,
                    product_width=detail_item.product_width,
                    product_height=detail_item.product_height,
                    product_weight=detail_item.product_weight,
                    product_length=detail_item.product_length,
                    qty=detail_item.qty,
                    subtotal=detail_item.subtotal
                )
                db.add(db_detail)
            
            db.commit()
            logger.info(f"Order saved to database with ID: {db_order.id}")
            
        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            db.rollback()
            # Continue execution even if database save fails
            # The order was successfully created in Komerce
        
        return StoreOrderResponse(
            meta=komerce_response.get("meta", {}),
            data=komerce_response.get("data"),
            message="Order created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_store_order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@store_order.get("/store_order/{order_id}", response_model=StoreOrderDetail)
def get_store_order(order_id: int, db: Session = Depends(get_db)):
    """
    Get a store order by ID from local database
    """
    try:
        db_order = db.query(StoreOrder).filter(StoreOrder.id == order_id).first()
        if not db_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Get order details
        order_details = db.query(OrderDetails).filter(OrderDetails.order_id == order_id).all()
        
        # Convert to response format
        detail_items = [
            OrderDetailItem(
                product_name=detail.product_name,
                product_variant_name=detail.product_variant_name,
                product_price=detail.product_price,
                product_width=detail.product_width,
                product_height=detail.product_height,
                product_weight=detail.product_weight,
                product_length=detail.product_length,
                qty=detail.qty,
                subtotal=detail.subtotal
            )
            for detail in order_details
        ]
        
        return StoreOrderDetail(
            id=db_order.id,
            order_date=db_order.order_date,
            brand_name=db_order.brand_name,
            shipper_name=db_order.shipper_name,
            shipper_phone=db_order.shipper_phone,
            shipper_destination_id=db_order.shipper_destination_id,
            shipper_address=db_order.shipper_address,
            shipper_email=db_order.shipper_email,
            receiver_name=db_order.receiver_name,
            receiver_phone=db_order.receiver_phone,
            receiver_destination_id=db_order.receiver_destination_id,
            receiver_address=db_order.receiver_address,
            shipping=db_order.shipping,
            shipping_type=db_order.shipping_type,
            payment_method=db_order.payment_method,
            shipping_cost=db_order.shipping_cost,
            shipping_cashback=db_order.shipping_cashback,
            service_fee=db_order.service_fee,
            additional_cost=db_order.additional_cost,
            grand_total=db_order.grand_total,
            cod_value=db_order.cod_value,
            insurance_value=db_order.insurance_value,
            order_details=detail_items
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting store order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
