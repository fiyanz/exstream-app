import logging

import requests

from core.config import settings

logger = logging.getLogger(__name__)

_API_KEY = settings.SHIPPING_COST_API_KEY
_BASE_URL = settings.KOMERCE_BASE_URL
_RAJA_BASE_URL = settings.RAJA_ONGKIR_BASE_URL
_ORIGIN_ID = settings.MY_ORIGIN_DESTINATION_ID


def get_provinces():
    url = f"{_RAJA_BASE_URL}/province"
    response = requests.get(url, headers={"key": _API_KEY}, timeout=15)
    response.raise_for_status()
    return response.json()


def get_cities(province_id: str | None = None):
    url = f"{_RAJA_BASE_URL}/city"
    params = {"province": province_id} if province_id else {}
    response = requests.get(url, headers={"key": _API_KEY}, params=params, timeout=15)
    response.raise_for_status()
    return response.json()


def get_cost(destination_id: str, weight: int, item_value: int, cod: bool) -> dict:
    url = f"{_BASE_URL}/calculate"
    params = {
        "shipper_destination_id": _ORIGIN_ID,
        "receiver_destination_id": destination_id,
        "weight": weight,
        "item_value": item_value,
        "cod": "yes" if cod else "no",
    }
    try:
        response = requests.get(url, headers={"x-api-key": _API_KEY}, params=params, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error("Shipping cost API error: %s", e)
        return {"meta": {"status": "error", "message": str(e)}}
