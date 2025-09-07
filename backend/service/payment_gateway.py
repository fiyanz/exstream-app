import midtransclient
from core.config import settings

MIDTRANS_SERVER_KEY = settings.MIDTRANS_SERVER_KEY

snap = midtransclient.Snap(
    is_production=settings.MIDTRANS_IS_PRODUCTION,
    server_key=MIDTRANS_SERVER_KEY
)

def create_snap_transaction(order_id: str, gross_amount: int, customer: dict, items: list = None, final_total: int = None):
    try:
        print(f"Creating Midtrans transaction for order: {order_id}")
        print(f"Gross amount: {gross_amount}")
        print(f"Final total: {final_total}")
        print(f"Customer: {customer}")
        print(f"Items: {items}")
        print(f"Server key: {MIDTRANS_SERVER_KEY[:10]}...")
        print(f"Production mode: {settings.MIDTRANS_IS_PRODUCTION}")
        
        # Use final_total if provided, otherwise use gross_amount
        midtrans_gross_amount = final_total if final_total is not None else gross_amount
        
        print(f"Midtrans gross amount: {midtrans_gross_amount}")
        
        # Prepare transaction parameters
        param = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": midtrans_gross_amount
            },
            "customer_details": customer,
            "credit_card": {
                "secure": True
            },
            # Midtrans callback endpoints
            "callbacks": {
                "finish": "http://localhost:3000/payment/success",
                "unfinish": "http://localhost:3000/payment/pending",
                "error": "http://localhost:3000/payment/error"
            },
            "notification_url": [
                "http://localhost:8000/api/v1/transaksi/callback"
            ]
        }
        
        # For Midtrans, we only need the final total amount
        # Create a single item representing the total order
        if final_total is not None:
            param["item_details"] = [
                {
                    "id": "ORDER-TOTAL",
                    "price": final_total,
                    "quantity": 1,
                    "name": "Total Pesanan"
                }
            ]
            
            # Use final_total as gross_amount
            midtrans_gross_amount = final_total
            param["transaction_details"]["gross_amount"] = midtrans_gross_amount
            
            print(f"Final total: {final_total}")
            print(f"Midtrans gross amount: {midtrans_gross_amount}")
            print(f"Item details: {param['item_details']}")
        else:
            # Fallback to original logic if final_total not provided
            if items and len(items) > 0:
                param["item_details"] = []
                for item in items:
                    item_detail = {
                        "id": f"PROD-{item.get('name', 'Jas Hujan Extrime').replace(' ', '-').upper()}",
                        "price": item.get('price', 0),
                        "quantity": item.get('quantity', 1),
                        "name": item.get('name', 'Jas Hujan Extrime')
                    }
                    param["item_details"].append(item_detail)
                
                # Use gross_amount as provided
                midtrans_gross_amount = gross_amount
                param["transaction_details"]["gross_amount"] = midtrans_gross_amount
        
        print(f"Midtrans parameters: {param}")
        
        transaction = snap.create_transaction(param)
        print(f"Midtrans response: {transaction}")
        print(f"Response keys: {list(transaction.keys()) if transaction else 'None'}")
        
        # Validate response
        if not transaction:
            raise Exception(f"Empty Midtrans response")
            
        # Check for token or snap_token
        if 'token' not in transaction and 'snap_token' not in transaction:
            print(f"Warning: No token found in response. Available keys: {list(transaction.keys())}")
            
        return transaction  # berisi token & redirect_url
        
    except Exception as e:
        print(f"Error creating Midtrans transaction: {str(e)}")
        raise e