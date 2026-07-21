import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from main import app

client = TestClient(app)

valid_order_payload = {
    "customer_name": "Test User",
    "customer_phone": "081234567890",
    "customer_address": "Jl. Test No. 123",
    "province": "Jawa Tengah",
    "city": "Kebumen",
    "subdistrict": "Kebumen",
    "village": "Kebumen",
    "province_name": "Jawa Tengah",
    "city_name": "Kebumen",
    "subdistrict_name": "Kebumen",
    "village_name": "Kebumen",
    "items": [
        {
            "name": "Jas Hujan Extrime",
            "variant": "Hitam - L",
            "color": "Hitam",
            "size": "L",
            "quantity": 1,
            "price": 150000,
            "product_weight": 1000,
        }
    ],
    "shipping_method": "JNE - REG",
    "shipping_cost": 20000,
    "payment_method": "Transfer",
    "subtotal": 150000,
    "discount": 0,
    "total": 170000,
}


@patch("service.order_service.create_snap_transaction")
def test_create_order_transfer(mock_create_snap):
    mock_create_snap.return_value = {"token": "snap_token_123", "redirect_url": "http://redirect.url"}

    response = client.post("/api/v1/orders/", json=valid_order_payload)

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "snap_token" in data
    assert data["snap_token"] == "snap_token_123"
    assert data["order_id"] is not None


@patch("service.order_service.create_komerce_order")
def test_create_order_cod(mock_create_komerce):
    cod_payload = valid_order_payload.copy()
    cod_payload["payment_method"] = "COD"

    mock_create_komerce.return_value = {"data": {"order_id": "KOMERCE-123"}}

    response = client.post("/api/v1/orders/", json=cod_payload)

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "komerce_data" in data
