import midtransclient
from core.config import settings

MIDTRANS_SERVER_KEY = settings.MIDTRANS_SERVER_KEY

snap = midtransclient.Snap(
    is_production=settings.MIDTRANS_IS_PRODUCTION,
    server_key=MIDTRANS_SERVER_KEY
)

def create_snap_transaction(order_id: str, gross_amount: int, customer: dict):
    param = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": gross_amount
        },
        "customer_details": customer,
        "credit_card": {
            "secure": True
        }
    }
    transaction = snap.create_transaction(param)
    return transaction  # berisi token & redirect_url