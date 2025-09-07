<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// PRODUCTION Configuration
$serverKey = 'Mid-server-YOUR_PRODUCTION_SERVER_KEY'; // Ganti dengan Production Server Key
$isProduction = true; // PENTING: true untuk Production

// Midtrans API URL
$snapUrl = $isProduction ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.stg.midtrans.com/snap/v1/transactions';

// Generate unique order ID
function generateOrderId() {
    $timestamp = round(microtime(true) * 1000);
    $random = rand(100, 999);
    return "ORDER-{$timestamp}-{$random}";
}

// Debug logging function
function debugLog($message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    echo "<!-- DEBUG [{$timestamp}] {$message}: " . ($data ? json_encode($data) : '') . " -->\n";
    error_log("[MIDTRANS DEBUG] {$message}: " . ($data ? json_encode($data) : ''));
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    $orderId = generateOrderId();
    $amount = $input['amount'] ?? 100000;
    $customerName = $input['customer_name'] ?? 'Test Customer';
    $email = $input['email'] ?? 'test@example.com';
    $phone = $input['phone'] ?? '08123456789';
    $itemName = $input['item_name'] ?? 'Test Product';
    
    // Prepare transaction data
    $transactionData = [
        'transaction_details' => [
            'order_id' => $orderId,
            'gross_amount' => (int)$amount
        ],
        'customer_details' => [
            'first_name' => $customerName,
            'email' => $email,
            'phone' => $phone
        ],
        'item_details' => [
            [
                'id' => 'item1',
                'price' => (int)$amount,
                'quantity' => 1,
                'name' => $itemName
            ]
        ]
    ];
    
    debugLog('=== MIDTRANS DEBUG ===');
    debugLog('Order ID', $orderId);
    debugLog('Amount', $amount);
    debugLog('Is Production', $isProduction ? 'true' : 'false');
    debugLog('Snap URL', $snapUrl);
    debugLog('Transaction Data', $transactionData);
    
    // Prepare cURL request
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $snapUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($transactionData),
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($serverKey . ':')
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = curl_error($curl);
    curl_close($curl);
    
    if ($curlError) {
        throw new Exception("cURL Error: {$curlError}");
    }
    
    $result = json_decode($response, true);
    
    debugLog('HTTP Code', $httpCode);
    debugLog('API Response', $result);
    
    if ($httpCode !== 201) {
        throw new Exception("Midtrans API Error: " . ($result['error_messages'][0] ?? 'Unknown error'));
    }
    
    if (!isset($result['token'])) {
        throw new Exception("No token received from Midtrans");
    }
    
    debugLog('Token Generated', $result['token']);
    debugLog('Redirect URL', $result['redirect_url']);
    debugLog('=== END DEBUG ===');
    
    // Return success response
    echo json_encode([
        'success' => true,
        'token' => $result['token'],
        'redirect_url' => $result['redirect_url'],
        'order_id' => $orderId,
        'debug' => [
            'is_production' => $isProduction,
            'timestamp' => date('Y-m-d H:i:s'),
            'amount' => $amount
        ]
    ]);
    
} catch (Exception $e) {
    debugLog('=== MIDTRANS ERROR ===');
    debugLog('Error Message', $e->getMessage());
    debugLog('=== END ERROR ===');
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'is_production' => $isProduction ?? false,
            'timestamp' => date('Y-m-d H:i:s'),
            'server_key_set' => isset($serverKey) && !empty($serverKey)
        ]
    ]);
}
?>
