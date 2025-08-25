import requests
from core.config import settings
from typing import Dict, Any, List, Optional
import logging
import math

logger = logging.getLogger(__name__)

KOMERCE_API_KEY = settings.SHIPPING_COST_API_KEY
KOMERCE_ORDER_BASE_URL = settings.KOMERCE_ORDER_BASE_URL

def calculate_service_fee(grand_total: int, cod_value: int, payment_method: str = "") -> int:
    """
    Calculate service fee (2.8% of COD or grand total as required by Komerce documentation)
    
    Args:
        grand_total: Total order amount
        cod_value: COD value if applicable
        payment_method: Payment method ("COD" or "Transfer")
        
    Returns:
        Calculated service fee
    """
    # According to Komerce error documentation: service_fee should be 2.8% of grand total or COD value
    # For COD payments, use the cod_value
    # For non-COD payments, use the grand_total
    if payment_method and payment_method.upper() == "COD" and cod_value > 0:
        base_amount = cod_value
    else:
        base_amount = grand_total
    
    # Calculate exactly 2.8% without any minimums or additional calculations
    # Make sure to handle floating point precision correctly
    calculated_fee = round(base_amount * 0.028)  # 2.8% rounded to nearest integer
    
    logger.info(f"Calculated service fee: {calculated_fee} (2.8% of {base_amount}, method: {payment_method})")
    return calculated_fee

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
    payment_method = order_data.get("payment_method", "")
    current_service_fee = order_data.get("service_fee", 0)
    
    # If service fee is already set and seems reasonable, don't override it
    if current_service_fee > 0 and abs(current_service_fee - round(grand_total * 0.028)) < 10:
        logger.info(f"Using provided service fee: {current_service_fee}")
        return order_data

    # Calculate expected service fee based on payment method
    expected_service_fee = calculate_service_fee(grand_total, cod_value, payment_method)
    
    # Set the service fee in the order data
    order_data["service_fee"] = expected_service_fee
    logger.info(f"Set service fee to {expected_service_fee} for {payment_method} payment (grand_total: {grand_total}, cod_value: {cod_value})")
    
    # Make sure it's a positive integer (this shouldn't be necessary, but just to be safe)
    if not isinstance(order_data["service_fee"], int):
        logger.warning(f"Converting service fee to integer: {order_data['service_fee']}")
        order_data["service_fee"] = int(float(order_data["service_fee"]))
    
    # Make sure it's not zero, which could cause validation issues
    if order_data["service_fee"] <= 0:
        logger.warning("Service fee calculated as zero or negative, setting to minimum value")
        order_data["service_fee"] = max(1, round(grand_total * 0.028))  # At least 1, or 2.8% rounded
    
    return order_data

def calculate_insurance_value(courier: str, total_product_price: int, grand_total: int) -> int:
    """
    Calculate insurance value based on courier policies and Komerce requirements
    
    Args:
        courier: Courier code (e.g., JNE, SICEPAT, etc.)
        total_product_price: Total product price (without shipping)
        grand_total: Grand total of the order
        
    Returns:
        Calculated insurance value (0 if insurance not applicable)
    """
    # Per Komerce API error message: "only products price more than IDR 300,000.00 can be insured"
    # Check if total product price is below minimum threshold
    if total_product_price <= 300000:
        logger.info(f"Total product price ({total_product_price}) is below minimum threshold (300,000) for insurance. Setting insurance_value to 0.")
        return 0
    
    # Normalize courier code to uppercase for consistent comparison
    courier = courier.upper() if courier else ""
    
    # Default insurance value is 0
    insurance_value = 0
    
    try:
        if courier == "JNE":
            # JNE: (0.2% x total_product_price) + Rp5.000
            insurance_value = int((total_product_price * 0.002) + 5000)
            
        elif courier == "SICEPAT":
            # SiCepat: 0.3% x grand_total if grand_total > IDR 500,000
            if grand_total > 500000:
                insurance_value = int(grand_total * 0.003)
            
        elif courier == "IDEXPRESS":
            # IDExpress: 0.2% x total_product_price
            insurance_value = int(total_product_price * 0.002)
            
        elif courier == "SAP":
            # SAP: (0.3% x total_product_price) + Rp2.000/AWB
            insurance_value = int((total_product_price * 0.003) + 2000)
            
        elif courier == "NINJA":
            # Ninja: 0.25% x total_product_price with minimum IDR 2,500 for orders <= IDR 1,000,000
            if total_product_price <= 1000000:
                insurance_value = 2500
            else:
                insurance_value = int(total_product_price * 0.0025)
                
        elif courier in ["JNT", "J&T"]:
            # J&T: 0.2% x total_product_price
            insurance_value = int(total_product_price * 0.002)
            
        # Round up to the nearest 100
        insurance_value = math.ceil(insurance_value / 100) * 100
        
        logger.info(f"Calculated insurance value for {courier}: {insurance_value} (product price: {total_product_price}, grand total: {grand_total})")
        
    except Exception as e:
        logger.error(f"Error calculating insurance value: {str(e)}")
        # Default to 0 on error
        insurance_value = 0
    
    return insurance_value

def validate_insurance_value(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate and validate insurance value based on courier and Komerce requirements
    
    Args:
        order_data: Order data dictionary
        
    Returns:
        Updated order data with validated insurance value
    """
    courier = order_data.get("shipping", "")
    
    # Calculate total product price from order details
    order_details = order_data.get("order_details", [])
    total_product_price = sum(item.get("subtotal", 0) for item in order_details)
    
    grand_total = order_data.get("grand_total", 0)
    current_insurance_value = order_data.get("insurance_value", 0)
    
    # Log the total product price for debugging
    logger.info(f"Total product price: {total_product_price} (minimum 300,000 required for insurance)")
    
    # Per Komerce API: only products with price > 300,000 can be insured
    if total_product_price <= 300000:
        logger.info(f"Product price ({total_product_price}) is below the minimum threshold for insurance. Setting insurance_value to 0.")
        order_data["insurance_value"] = 0
        return order_data
    
    # Calculate expected insurance value (only if product price is above threshold)
    expected_insurance_value = calculate_insurance_value(courier, total_product_price, grand_total)
    
    # Update insurance value in order data
    if current_insurance_value <= 0 or abs(current_insurance_value - expected_insurance_value) > 1000:
        order_data["insurance_value"] = expected_insurance_value
        logger.info(f"Set insurance value to {expected_insurance_value} for courier: {courier}")
    
    return order_data

def create_store_order(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a store order using Komerce API
    
    Args:
        order_data: Dictionary containing order information
        
    Returns:
        Dict containing the API response
    """
    # Log original values before validation
    original_service_fee = order_data.get("service_fee", 0)
    original_insurance_value = order_data.get("insurance_value", 0)
    logger.info(f"Original service fee before validation: {original_service_fee}")
    logger.info(f"Original insurance value before validation: {original_insurance_value}")
    
    # Validate and fix service fee before sending to API
    order_data = validate_service_fee(order_data)
    
    # Validate and fix insurance value before sending to API
    order_data = validate_insurance_value(order_data)
    
    # Log values after validation
    logger.info(f"Final service fee after validation: {order_data.get('service_fee', 0)}")
    logger.info(f"Final insurance value after validation: {order_data.get('insurance_value', 0)}")
    logger.info(f"Payment method: {order_data.get('payment_method', 'Unknown')}")
    logger.info(f"Shipping courier: {order_data.get('shipping', 'Unknown')}")
    logger.info(f"Grand total: {order_data.get('grand_total', 0)}")
    
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
                
                # Check for specific error types
                if 'meta' in error_detail and 'message' in error_detail['meta']:
                    error_message = error_detail['meta']['message'].lower()
                    
                    # Handle service fee errors
                    if 'service fee' in error_message:
                        logger.error(f"Service fee error detected. Current service fee: {order_data.get('service_fee')}")
                        logger.error(f"Order grand total: {order_data.get('grand_total')}")
                        logger.error(f"COD value: {order_data.get('cod_value')}")
                        logger.error(f"Payment method: {order_data.get('payment_method')}")
                        
                        # Try different calculation methods to see which one should work
                        base_amount = order_data.get('grand_total', 0)
                        cod_amount = order_data.get('cod_value', 0)
                        
                        # Calculate with different methods for troubleshooting
                        fee1 = round(base_amount * 0.028)  # 2.8% of grand_total, rounded
                        fee2 = int(base_amount * 0.028)    # 2.8% of grand_total, truncated
                        fee3 = round(cod_amount * 0.028)   # 2.8% of cod_value, rounded
                        fee4 = int(cod_amount * 0.028)     # 2.8% of cod_value, truncated
                        fee5 = math.ceil(base_amount * 0.028) # 2.8% of grand_total, ceiling
                        
                        logger.error(f"Service fee calculation options:")
                        logger.error(f"  1. 2.8% of grand_total ({base_amount}), rounded: {fee1}")
                        logger.error(f"  2. 2.8% of grand_total ({base_amount}), truncated: {fee2}")
                        logger.error(f"  3. 2.8% of cod_value ({cod_amount}), rounded: {fee3}")
                        logger.error(f"  4. 2.8% of cod_value ({cod_amount}), truncated: {fee4}")
                        logger.error(f"  5. 2.8% of grand_total ({base_amount}), ceiling: {fee5}")
                        
                        # Try setting a hardcoded service fee as a last resort - retrying not implemented
                        # as that would require modifying the API structure
                    
                    # Handle insurance value errors
                    elif 'insurance' in error_message or '300,000' in error_message:
                        # Calculate total product price
                        order_details = order_data.get("order_details", [])
                        total_product_price = sum(item.get("subtotal", 0) for item in order_details)
                        
                        logger.error(f"Insurance value error detected. Current insurance value: {order_data.get('insurance_value')}")
                        logger.error(f"Total product price: {total_product_price} (minimum 300,000 required for insurance)")
                        logger.error(f"Order grand total: {order_data.get('grand_total')}")
                        logger.error(f"Shipping courier: {order_data.get('shipping')}")
                        
                        # Force insurance value to 0 due to error
                        order_data["insurance_value"] = 0
                        logger.warning("Forcing insurance_value to 0 because total product price is below minimum threshold (300,000)")
                        
                        # This is important - the API error is not recoverable without resubmitting
                        # Consider retrying the API call with insurance_value set to 0
                        # But for now, just return a clear error message
                        return {
                            "meta": {
                                "status": "error", 
                                "message": "Total product price must be more than IDR 300,000 to apply insurance. Please try again with insurance disabled.",
                                "code": "INSURANCE_THRESHOLD_NOT_MET",
                                "original_error": error_detail
                            }
                        }
                
                return {"meta": {"status": "error", "message": str(e), "details": error_detail}}
            except:
                return {"meta": {"status": "error", "message": str(e)}}
        return {"meta": {"status": "error", "message": str(e)}}
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"meta": {"status": "error", "message": f"Unexpected error: {str(e)}"}}
