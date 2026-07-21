import logging

import midtransclient

from core.config import settings

logger = logging.getLogger(__name__)

snap = midtransclient.Snap(
    is_production=settings.MIDTRANS_IS_PRODUCTION,
    server_key=settings.MIDTRANS_SERVER_KEY,
)


def create_snap_transaction(
    order_id: str,
    gross_amount: int,
    customer: dict,
    items: list | None = None,
    final_total: int | None = None,
) -> dict:
    amount = final_total if final_total is not None else gross_amount

    params = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": amount,
        },
        "customer_details": customer,
        "credit_card": {"secure": True},
        "callbacks": {
            "finish": f"{settings.PAYMENT_SUCCESS_URL}?order_id={order_id}",
            "unfinish": f"{settings.PAYMENT_ERROR_URL}?order_id={order_id}",
            "error": f"{settings.PAYMENT_ERROR_URL}?order_id={order_id}",
        },
    }

    if final_total is not None:
        params["item_details"] = [
            {
                "id": "ORDER-TOTAL",
                "price": final_total,
                "quantity": 1,
                "name": "Total Pesanan",
            }
        ]
    elif items:
        params["item_details"] = [
            {
                "id": f"PROD-{item.get('name', 'PRODUCT').replace(' ', '-').upper()}",
                "price": item.get("price", 0),
                "quantity": item.get("quantity", 1),
                "name": item.get("name", "Product"),
            }
            for item in items
        ]

    try:
        transaction = snap.create_transaction(params)
        if not transaction:
            raise ValueError("Empty response from Midtrans")
        return transaction
    except Exception as e:
        logger.error("Midtrans transaction failed for order %s: %s", order_id, e)
        raise
