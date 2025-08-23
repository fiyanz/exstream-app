def format_phone_number(phone: str) -> str:
    """
    Format phone number to include +62 prefix for Midtrans
    """
    if not phone:
        return phone
    
    # Remove any existing +62 prefix
    if phone.startswith('+62'):
        return phone
    
    # Remove leading 0 if present
    if phone.startswith('0'):
        phone = phone[1:]
    
    # Add +62 prefix
    return f"+62{phone}"