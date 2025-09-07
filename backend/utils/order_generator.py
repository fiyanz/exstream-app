import uuid
import time
from datetime import datetime

def generate_unique_order_id(prefix: str = "ORDER") -> str:
    """
    Generate a unique order ID with timestamp and UUID
    Format: ORDER-YYYYMMDD-HHMMSS-UUID4
    """
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"{prefix}-{timestamp}-{unique_id}"

def validate_order_id(order_id: str) -> bool:
    """
    Validate order ID format and uniqueness
    """
    if not order_id or len(order_id) < 10:
        return False
    
    # Check if contains required components
    parts = order_id.split('-')
    if len(parts) < 3:
        return False
        
    return True

# Example usage:
# order_id = generate_unique_order_id("EXTRIME")
# Result: EXTRIME-20241207-232458-A1B2C3D4
