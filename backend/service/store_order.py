import requests
from core.config import settings
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

KOMERCE_API_KEY = settings.RAJA_ONGKIR_API
KOMERCE_ORDER_BASE_URL = settings.KOMERCE_ORDER_BASE_URL

def calculate_service_fee(grand_total: int, cod_value: int = 0) -> int:
    """
    Calculate service fee (typically 2.8% of grand total or COD value)
    
    Args:
        grand_total: Total order amount
        cod_value: COD value if applicable
        
    Returns:
        Calculated service fee
    """
    base_amount = max(grand_total, cod_value)
    return int(base_amount * 0.028)  # 2.8%

def validate_service_fee(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and auto-calculate service fee if needed
    
    Args:
        order_data: Order data dictionary
        
    Returns:
        Updated order data with validated service fee
    """
    grand_total = order_data.get("grand_total", 0)
    cod_value = order_data.get("cod_value", 0)
    current_service_fee = order_data.get("service_fee", 0)
    
    # Calculate expected service fee
    expected_service_fee = calculate_service_fee(grand_total, cod_value)
    
    # If service fee is missing or invalid, set it to calculated value
    if current_service_fee <= 0:
        order_data["service_fee"] = expected_service_fee
        logger.info(f"Auto-calculated service fee: {expected_service_fee}")
    else:
        # Check if the provided service fee is reasonable (within 10% of expected)
        tolerance = expected_service_fee * 0.1
        if abs(current_service_fee - expected_service_fee) > tolerance:
            logger.warning(f"Service fee {current_service_fee} differs significantly from expected {expected_service_fee}")
    
    return order_data

def create_store_order(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a store order using Komerce API
    
    Args:
        order_data: Dictionary containing order information
        
    Returns:
        Dict containing the API response
    """
    # Validate and fix service fee before sending to API
    order_data = validate_service_fee(order_data)
    
    url = f"{KOMERCE_ORDER_BASE_URL}/orders/store"
    headers = {
        "x-api-key": KOMERCE_API_KEY,
        "Content-Type": "application/json"
    }
    
    logger.info(f"Sending store order request to Komerce API: {url}")
    logger.info(f"Headers: {headers}")
    logger.info(f"Order data: {order_data}")
    
    try:
        response = requests.post(url, headers=headers, json=order_data)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        result = response.json()
        logger.info(f"API Response status: {response.status_code}")
        logger.info(f"API Response: {result}")
        return result
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling Komerce Store Order API: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                logger.error(f"API Error Details: {error_detail}")
                return {"meta": {"status": "error", "message": str(e), "details": error_detail}}
            except:
                return {"meta": {"status": "error", "message": str(e)}}
        return {"meta": {"status": "error", "message": str(e)}}
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"meta": {"status": "error", "message": f"Unexpected error: {str(e)}"}}
