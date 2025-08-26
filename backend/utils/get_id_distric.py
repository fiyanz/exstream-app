"""
Utility functions to parse and convert location IDs for shipping calculations.

The subdistrict IDs (or village IDs) follow a pattern:
- First 2 digits: Province code
- Next 2 digits: City/Regency code
- Next 2 digits: District code
- Next 4 digits: Village/Subdistrict code

Example:
3516052014
35: East Java province
16: Mojokerto regency
05: Gondang district
2014: A specific village in Gondang

For RajaOngkir domestic shipping, we need to extract the district ID
which is the first 6 digits of the subdistrict/village ID.
"""

def extract_district_id_from_village(village_id: str) -> str:
    """
    Extract district ID from village/subdistrict ID.
    
    Args:
        village_id: The village or subdistrict ID (typically 10 digits)
    
    Returns:
        The district ID (first 6 digits of village ID)
    """
    if not village_id:
        return None
        
    # Convert to string if it's not already
    village_id_str = str(village_id)
    
    # District ID is the first 6 digits of the village ID
    if len(village_id_str) >= 6:
        return village_id_str[:6]
    
    # Return the original ID if it's shorter than 6 digits (shouldn't happen with valid IDs)
    return village_id_str


def extract_city_id_from_village(village_id: str) -> str:
    """
    Extract city/regency ID from village/subdistrict ID.
    
    Args:
        village_id: The village or subdistrict ID (typically 10 digits)
    
    Returns:
        The city ID (first 4 digits of village ID)
    """
    if not village_id:
        return None
        
    # Convert to string if it's not already
    village_id_str = str(village_id)
    
    # City ID is the first 4 digits of the village ID
    if len(village_id_str) >= 4:
        return village_id_str[:4]
    
    # Return the original ID if it's shorter than 4 digits (shouldn't happen with valid IDs)
    return village_id_str


def extract_province_id_from_village(village_id: str) -> str:
    """
    Extract province ID from village/subdistrict ID.
    
    Args:
        village_id: The village or subdistrict ID (typically 10 digits)
    
    Returns:
        The province ID (first 2 digits of village ID)
    """
    if not village_id:
        return None
        
    # Convert to string if it's not already
    village_id_str = str(village_id)
    
    # Province ID is the first 2 digits of the village ID
    if len(village_id_str) >= 2:
        return village_id_str[:2]
    
    # Return the original ID if it's shorter than 2 digits (shouldn't happen with valid IDs)
    return village_id_str
