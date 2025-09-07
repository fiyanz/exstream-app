const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');

const app = express();
app.use(cors());
app.use(express.json());

// PRODUCTION Configuration
const snap = new midtransClient.Snap({
    isProduction: true, // PENTING: true untuk Production
    serverKey: 'Mid-server-YOUR_PRODUCTION_SERVER_KEY', // Ganti dengan Production Server Key
    clientKey: 'Mid-client-YOUR_PRODUCTION_CLIENT_KEY'  // Ganti dengan Production Client Key
});

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORDER-${timestamp}-${random}`;
}

// Endpoint untuk generate Snap Token
app.post('/create-transaction', async (req, res) => {
    try {
        const orderId = generateOrderId();
        
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: req.body.amount || 100000 // Default 100k
            },
            customer_details: {
                first_name: req.body.customer_name || "Test Customer",
                email: req.body.email || "test@example.com",
                phone: req.body.phone || "08123456789"
            },
            item_details: [{
                id: "item1",
                price: req.body.amount || 100000,
                quantity: 1,
                name: req.body.item_name || "Test Product"
            }]
        };

        console.log('=== MIDTRANS DEBUG ===');
        console.log('Order ID:', orderId);
        console.log('Amount:', parameter.transaction_details.gross_amount);
        console.log('Is Production:', snap.isProduction);
        console.log('Parameter:', JSON.stringify(parameter, null, 2));

        const transaction = await snap.createTransaction(parameter);
        
        console.log('Token Generated:', transaction.token);
        console.log('Redirect URL:', transaction.redirect_url);
        console.log('=== END DEBUG ===');

        res.json({
            success: true,
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            order_id: orderId
        });

    } catch (error) {
        console.error('=== MIDTRANS ERROR ===');
        console.error('Error:', error.message);
        console.error('API Response:', error.ApiResponse);
        console.error('=== END ERROR ===');
        
        res.status(500).json({
            success: false,
            message: error.message,
            details: error.ApiResponse
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        mode: 'PRODUCTION',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Mode: PRODUCTION');
    console.log('Make sure to update your Midtrans keys!');
});
