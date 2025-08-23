/**
 * transactionService.js
 * 
 * This module provides functions to handle transaction creation
 * with support for both COD and non-COD (Midtrans) payments,
 * as well as integration with Komerce Store Order API.
 */

import { API_BASE_URL } from './dataWilayah';

/**
 * Creates a transaction with enhanced order details
 * @param {Object} orderData - Complete order data
 * @returns {Promise<Object>} Transaction response with payment details
 */
export const createTransaction = async (orderData) => {
  try {
    console.log('Creating transaction with data:', orderData);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/transaksi/enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}`, errorText);
      throw new Error(`Failed to create transaction (${response.status})`);
    }

    const data = await response.json();
    console.log('Transaction created successfully:', data);
    console.log('Token:', data.token);
    console.log('Redirect URL:', data.redirect_url);
    console.log('Payment status:', data.payment_status);
    console.log('Frontend total:', data.frontend_total);
    console.log('Midtrans amount:', data.midtrans_amount);
    console.log('Discount:', data.discount);
    console.log('Shipping cost:', data.shipping_cost);
    
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Gets order status by order ID
 * @param {string} orderId - The order ID to check
 * @returns {Promise<Object>} Order status information
 */
export const getOrderStatus = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/transaksi/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get order status (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting order status:', error);
    throw error;
  }
};

/**
 * Handles Midtrans payment using the token and redirect_url from backend
 * Tries popup first, falls back to redirect if CSP blocks it
 * @param {string} snapToken - Midtrans snap token from backend
 * @param {string} redirectUrl - Midtrans redirect URL from backend
 */
export const handleMidtransPayment = (snapToken, redirectUrl) => {
  console.log('Handling Midtrans payment with token:', snapToken);
  console.log('Redirect URL:', redirectUrl);
  
  // Method 1: Try popup mode first (if Snap.js is available)
  if (window.snap && typeof window.snap.pay === 'function') {
    try {
      console.log('Attempting Snap popup mode...');
      
      // Create a more robust popup configuration
      const popupConfig = {
        onSuccess: function(result) {
          console.log('Payment success via popup:', result);
          // Close popup and show success message
          if (window.snapPopup && !window.snapPopup.closed) {
            window.snapPopup.close();
          }
          alert('Pembayaran berhasil! Terima kasih telah berbelanja.');
          // Optionally redirect to success page
          window.location.href = '/success';
        },
        onPending: function(result) {
          console.log('Payment pending via popup:', result);
          alert('Pembayaran pending, silakan selesaikan pembayaran Anda.');
        },
        onError: function(result) {
          console.warn('Payment error via popup:', result);
          // Close popup if open
          if (window.snapPopup && !window.snapPopup.closed) {
            window.snapPopup.close();
          }
          alert('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: function() {
          console.log('Payment popup closed by user');
          // Don't show alert here as user might have intentionally closed it
        }
      };
      
      // Try to open popup
      window.snap.pay(snapToken, popupConfig);
      return;
      
    } catch (err) {
      console.warn('Snap popup failed, trying alternative methods...', err);
    }
  }
  
  // Method 2: Try opening in new window/tab
  if (redirectUrl) {
    try {
      console.log('Opening payment in new window...');
      const popup = window.open(redirectUrl, 'midtrans_payment', 
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no');
      
      if (popup) {
        window.snapPopup = popup;
        
        // Check if popup was blocked
        if (popup.closed || typeof popup.closed === 'undefined') {
          console.log('Popup was blocked, falling back to redirect...');
          window.location.href = redirectUrl;
        } else {
          // Monitor popup
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              console.log('Payment popup closed');
              // You could check payment status here
            }
          }, 1000);
        }
      } else {
        console.log('Popup blocked, using redirect...');
        window.location.href = redirectUrl;
      }
    } catch (err) {
      console.warn('Popup method failed, using redirect...', err);
      window.location.href = redirectUrl;
    }
  } else {
    console.error('No redirect URL provided');
    alert('Terjadi kesalahan dalam memproses pembayaran. Silakan coba lagi.');
  }
};

/**
 * Alternative method: Embed Snap in a container (for embedded mode)
 * @param {string} snapToken - Midtrans snap token
 * @param {string} containerId - ID of the container element
 */
export const embedMidtransSnap = (snapToken, containerId = 'snap-container') => {
  if (window.snap && typeof window.snap.embed === 'function') {
    try {
      console.log('Embedding Snap in container:', containerId);
      
      // Show the container
      const container = document.getElementById(containerId);
      const embedContent = document.getElementById('snap-embed-content');
      if (container) {
        container.style.display = 'block';
      }
      
      window.snap.embed(snapToken, {
        embedId: containerId,
        onSuccess: function(result) {
          console.log('Payment success via embed:', result);
          // Hide container
          if (container) {
            container.style.display = 'none';
          }
          alert('Pembayaran berhasil! Terima kasih telah berbelanja.');
          // Optionally redirect to success page
          window.location.href = '/success';
        },
        onPending: function(result) {
          console.log('Payment pending via embed:', result);
          alert('Pembayaran pending, silakan selesaikan pembayaran Anda.');
        },
        onError: function(result) {
          console.log('Payment error via embed:', result);
          // Hide container
          if (container) {
            container.style.display = 'none';
          }
          alert('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: function() {
          console.log('Payment embed closed by user');
          // Hide container
          if (container) {
            container.style.display = 'none';
          }
        }
      });
    } catch (err) {
      console.error('Error embedding Snap:', err);
      alert('Terjadi kesalahan dalam menampilkan halaman pembayaran.');
    }
  } else {
    console.error('Snap.js not available for embed mode');
    alert('Halaman pembayaran tidak dapat ditampilkan.');
  }
};

/**
 * Enhanced payment handler with multiple fallback methods
 * @param {string} snapToken - Midtrans snap token
 * @param {string} redirectUrl - Midtrans redirect URL
 */
export const handleMidtransPaymentEnhanced = (snapToken, redirectUrl) => {
  console.log('Enhanced Midtrans payment handler');
  console.log('Token:', snapToken);
  console.log('Redirect URL:', redirectUrl);
  
  // Method 1: Try direct redirect first (most reliable)
  if (redirectUrl) {
    console.log('Using direct redirect method...');
    try {
      // Try to open in new window/tab
      const popup = window.open(redirectUrl, 'midtrans_payment', 
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no');
      
      if (popup && !popup.closed) {
        console.log('Popup opened successfully');
        
        // Check if popup was blocked
        setTimeout(() => {
          if (popup.closed) {
            console.log('Popup was blocked, trying direct navigation');
            window.location.href = redirectUrl;
          }
        }, 1000);
        
        return;
      } else {
        console.log('Popup blocked, using direct navigation');
        window.location.href = redirectUrl;
        return;
      }
    } catch (err) {
      console.warn('Direct redirect failed:', err);
      window.location.href = redirectUrl;
      return;
    }
  }
  
  // Method 2: Try Snap.js if available
  if (window.snap && typeof window.snap.pay === 'function' && snapToken) {
    console.log('Trying Snap popup method...');
    try {
      window.snap.pay(snapToken, {
        onSuccess: function(result) {
          console.log('Payment success:', result);
          alert('Pembayaran berhasil! Terima kasih telah berbelanja.');
          window.location.href = '/success';
        },
        onPending: function(result) {
          console.log('Payment pending:', result);
          alert('Pembayaran pending, silakan selesaikan pembayaran Anda.');
        },
        onError: function(result) {
          console.log('Payment error:', result);
          alert('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: function() {
          console.log('Payment popup closed');
        }
      });
      return;
    } catch (err) {
      console.warn('Snap popup failed:', err);
    }
  }
  
  // Method 2: Try embedded mode with token
  if (window.snap && typeof window.snap.embed === 'function' && snapToken) {
    console.log('Trying embedded mode with token...');
    try {
      embedMidtransSnap(snapToken);
      return;
    } catch (err) {
      console.warn('Embedded mode failed:', err);
    }
  }
  
  // Method 3: Try Snap embed with redirect URL (extract token from URL)
  if (window.snap && typeof window.snap.embed === 'function' && redirectUrl) {
    console.log('Trying Snap embed with redirect URL...');
    try {
      // Extract token from redirect URL if possible
      const urlParts = redirectUrl.split('/');
      const extractedToken = urlParts[urlParts.length - 1];
      
      if (extractedToken && extractedToken.length > 10) {
        console.log('Extracted token from URL:', extractedToken);
        embedMidtransSnap(extractedToken);
        return;
      }
    } catch (err) {
      console.warn('Snap embed with redirect URL failed:', err);
    }
  }
  
  // Method 4: Try new window popup
  if (redirectUrl) {
    console.log('Trying new window popup...');
    try {
      const popup = window.open(redirectUrl, 'midtrans_payment', 
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no');
      
      if (popup && !popup.closed) {
        console.log('Popup opened successfully');
        return;
      }
    } catch (err) {
      console.warn('New window popup failed:', err);
    }
  }
  
  // Method 5: Fallback to redirect
  if (redirectUrl) {
    console.log('Using redirect fallback...');
    window.location.href = redirectUrl;
  } else {
    alert('Terjadi kesalahan dalam memproses pembayaran. Silakan coba lagi.');
  }
};

/**
 * Store order data before payment
 * For COD orders, this will be the final order processing step
 * @param {Object} orderData - Order data from frontend
 * @returns {Promise<Object>} Stored order result with complete order details
 */
export const storeOrderData = async (orderData) => {
  try {
    console.log('Storing order data (raw):', orderData);
    
    // Format order data sesuai dengan yang diharapkan backend
    const formattedData = formatStoreOrderData(orderData);
    console.log('Formatted order data:', formattedData);
    
    // Check if this is a COD order - ensure payment_method is correctly set
    if (orderData.paymentMethod && orderData.paymentMethod.toUpperCase() === 'COD') {
      console.log('Processing COD order - payment_method set to:', formattedData.payment_method);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/store_order/store_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}`, errorText);
      
      // Try to parse error response as JSON
      try {
        const errorJson = JSON.parse(errorText);
        
        // Check if this is an insurance-related error
        if (errorJson.detail && typeof errorJson.detail === 'object' && errorJson.detail.error_type === 'insurance_validation') {
          console.error('Insurance validation error:', errorJson.detail);
          throw new Error(`Pesanan tidak dapat diasuransikan: Total produk harus lebih dari Rp 300.000. Silakan coba lagi tanpa asuransi.`);
        }
        
        // Include error message from API if available
        if (errorJson.detail) {
          throw new Error(`Failed to store order: ${typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail)}`);
        }
      } catch (parseError) {
        // If not valid JSON, use the original error text
        console.warn('Error parsing API error response:', parseError);
      }
      
      throw new Error(`Failed to store order (${response.status})`);
    }

    const data = await response.json();
    console.log('Order stored successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Error storing order:', error);
    throw error;
  }
};

/**
 * Get order data by order ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
export const getOrderData = async (orderId) => {
  try {
    console.log('Getting order data for ID:', orderId);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/transaksi/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}`, errorText);
      throw new Error(`Failed to get order (${response.status})`);
    }

    const data = await response.json();
    console.log('Order data retrieved:', data);
    
    return data;
  } catch (error) {
    console.error('Error getting order data:', error);
    throw error;
  }
};

/**
 * Creates a store order using Komerce API
 * @param {Object} orderData - Order data according to Komerce API format
 * @returns {Promise<Object>} Store order response
 */
export const createStoreOrder = async (orderData) => {
  try {
    // Debug log untuk membantu troubleshooting
    console.log('=== CREATE STORE ORDER DEBUG INFO ===');
    console.log('Full order data received:', orderData);
    console.log('Order date:', orderData.order_date);
    console.log('Receiver info:', {
      name: orderData.receiver_name,
      phone: orderData.receiver_phone,
      address: orderData.receiver_address,
      destination_id: orderData.receiver_destination_id
    });
    console.log('Shipping info:', {
      method: orderData.shipping,
      type: orderData.shipping_type,
      cost: orderData.shipping_cost
    });
    console.log('Payment info:', {
      method: orderData.payment_method,
      grand_total: orderData.grand_total
    });
    
    // Validasi data order sebelum mengirim ke API
    if (!orderData) {
      throw new Error('Data order tidak tersedia');
    }
    
    // Validasi field-field yang wajib ada
    const requiredFields = [
      'order_date', 'receiver_name', 'receiver_phone', 
      'receiver_destination_id', 'receiver_address', 'shipping',
      'shipping_type', 'payment_method', 'grand_total'
    ];
    
    // Cetak daftar field yang hilang
    const missingFields = requiredFields.filter(field => !orderData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
    }
    
    for (const field of requiredFields) {
      if (!orderData[field]) {
        throw new Error(`Field wajib '${field}' tidak tersedia pada data order`);
      }
    }
    
    // Validasi order details
    if (!orderData.order_details || !Array.isArray(orderData.order_details) || orderData.order_details.length === 0) {
      throw new Error('Detail produk tidak tersedia');
    }
    
    console.log('Creating store order with data:', orderData);
    
    // Kirim request ke API dengan timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/store_order/store_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorResponse = await response.json();
          console.error(`HTTP error! Status: ${response.status}`, errorResponse);
          // Check for specific error messages about service fee or insurance
          if (errorResponse.detail && typeof errorResponse.detail === 'string') {
            if (errorResponse.detail.includes('service fee') || errorResponse.detail.includes('insurance')) {
              errorDetail = errorResponse.detail;
            } else {
              errorDetail = `Error from server: ${errorResponse.detail}`;
            }
          } else {
            errorDetail = JSON.stringify(errorResponse);
          }
        } catch (e) {
          const errorText = await response.text();
          console.error(`HTTP error (text)! Status: ${response.status}`, errorText);
          errorDetail = errorText;
        }
        throw new Error(`Gagal membuat store order (${response.status}): ${errorDetail}`);
      }

      const data = await response.json();
      console.log('Store order created successfully:', data);
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Koneksi timeout, silakan coba lagi');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error creating store order:', error);
    throw error;
  }
};

/**
 * Format checkout data into Komerce store order format
 * @param {Object} checkoutData - Checkout data from frontend form
 * @returns {Object} Formatted store order data
 */
export const formatStoreOrderData = (checkoutData) => {
  console.log('=== FORMAT STORE ORDER DATA DEBUG ===');
  console.log('Checkout data received:', checkoutData);
  
  // Current timestamp in YYYY-MM-DD HH:MM:SS format
  const now = new Date();
  const orderDate = now.toISOString().slice(0, 19).replace('T', ' ');
  console.log('Formatted order date:', orderDate);
  
  // Extract customer and shipping information
  const {
    fullName,
    telephone,
    address,
    city,
    province,
    shippingMethod,
    paymentMethod,
    shippingCost,
    items,
    totalAmount,
    destination_id,
    shipper_info
  } = checkoutData;
  
  console.log('Shipping method received:', shippingMethod);
  console.log('Payment method received:', paymentMethod);
  
  if (!fullName || !telephone || !address || !destination_id) {
    throw new Error('Data penerima tidak lengkap');
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Data produk tidak tersedia');
  }
  
  // Map payment method to Komerce format
  const mappedPaymentMethod = paymentMethod.includes('COD') ? 'COD' : 'Transfer';
  console.log('Mapped payment method:', mappedPaymentMethod);
  
  // Parse shipping method to get courier and service type
  console.log('Parsing shipping method:', shippingMethod);
  const [courier, serviceType] = parseShippingMethod(shippingMethod);
  console.log('Parsed shipping details:', { courier, serviceType });
  
  // Calculate COD value
  const codValue = mappedPaymentMethod === 'COD' ? totalAmount : 0;
  console.log('COD value:', codValue);
  
  // Format full address
  const fullAddress = `${address}${city ? `, ${city}` : ''}${province ? `, ${province}` : ''}`;
  console.log('Formatted address:', fullAddress);
  
  // Format order details
  console.log('Items to format:', items);
  const orderDetails = items.map(item => {
    if (!item.name || !item.price || !item.quantity) {
      throw new Error(`Data produk tidak lengkap: ${JSON.stringify(item)}`);
    }
    
    return {
      product_name: item.name,
      product_variant_name: item.color && item.size ? `${item.color} - ${item.size}` : item.variant || item.name,
      product_price: parseInt(item.price),
      product_width: item.width || item.product_width || (shipper_info?.product_width || 20),
      product_height: item.height || item.product_height || (shipper_info?.product_height || 5),
      product_weight: item.weight || item.product_weight || (shipper_info?.product_weight || 300),
      product_length: item.length || item.product_length || (shipper_info?.product_length || 30),
      qty: parseInt(item.quantity),
      subtotal: parseInt(item.price * item.quantity)
    };
  });
  
  // Get shipper info from checkout data or use store info from configuration
  const shipper = shipper_info || checkoutData.shipper || {};
  
  // Create store order object according to backend schema
  const formattedOrder = {
    order_date: orderDate,
    brand_name: shipper.brand_name || checkoutData.brand_name || "Extreme Store",
    shipper_name: shipper.name || checkoutData.shipper_name || "Extreme Store Official",
    shipper_phone: shipper.phone || checkoutData.shipper_phone || telephone, // Fallback to customer phone
    shipper_destination_id: parseInt(shipper.destination_id || checkoutData.shipper_destination_id || destination_id), // Use origin from config
    shipper_address: shipper.address || checkoutData.shipper_address || address, // Fallback to customer address
    shipper_email: shipper.email || checkoutData.shipper_email || checkoutData.email || "store@extreme.com",
    receiver_name: fullName,
    receiver_phone: telephone,
    receiver_destination_id: parseInt(destination_id),
    receiver_address: fullAddress,
    shipping: courier,
    shipping_type: serviceType,
    payment_method: mappedPaymentMethod,
    shipping_cost: parseInt(shippingCost),
    shipping_cashback: parseInt(checkoutData.shipping_cashback || 0),
    // Calculate service fee according to Komerce's requirements: 2.8% of COD value or grand total
    service_fee: mappedPaymentMethod === 'COD' 
      ? Math.round(parseInt(codValue) * 0.028) 
      : Math.round(parseInt(totalAmount) * 0.028),
    additional_cost: parseInt(checkoutData.additional_cost || 0),
    grand_total: parseInt(totalAmount),
    cod_value: parseInt(codValue),
    // Insurance value - explicitly set to 0 to avoid issues with Komerce API
    // Per Komerce API, only products with total price > IDR 300,000 can be insured
    // The backend will calculate this if appropriate
    insurance_value: 0,
    order_details: orderDetails
  };
  
  // Log final formatted data for debugging
  console.log('=== FINAL STORE ORDER DATA ===');
  console.log('Shipping details:', { 
    courier: formattedOrder.shipping,
    serviceType: formattedOrder.shipping_type,
    cost: formattedOrder.shipping_cost
  });
  console.log('Order details count:', formattedOrder.order_details.length);
  console.log('Grand total:', formattedOrder.grand_total);
  
  // Log service fee and insurance calculation details
  console.log('Service fee details:');
  console.log('- Payment method:', formattedOrder.payment_method);
  console.log('- Service fee value:', formattedOrder.service_fee);
  console.log('- Calculated as 2.8% of:', formattedOrder.payment_method === 'COD' ? 
               `COD value (${formattedOrder.cod_value})` : 
               `Grand total (${formattedOrder.grand_total})`);
  
  // Calculate total product price to check insurance eligibility
  const totalProductPrice = formattedOrder.order_details.reduce((sum, item) => sum + item.subtotal, 0);
  console.log('Insurance details:');
  console.log('- Total product price:', totalProductPrice);
  console.log('- Insurance eligibility:', totalProductPrice > 300000 ? 'Eligible (>300,000)' : 'Not eligible (≤300,000)');
  console.log('- Courier:', formattedOrder.shipping);
  console.log('- Insurance value set to:', formattedOrder.insurance_value);
  
  return formattedOrder;
};

/**
 * Parse shipping method string into courier and service type
 * @param {string} shippingMethod - Shipping method string (e.g. "JNE - REG (2-3 hari)")
 * @returns {Array} [courier, serviceType]
 */
/**
 * Mapper untuk kode kurir ke format yang dikenali oleh API Komerce
 */
const courierCodeMapper = {
  'jne': 'JNE',
  'jnt': 'JNT',
  'j&t': 'JNT',
  'ninja': 'NINJA',
  'anteraja': 'ANTERAJA',
  'sicepat': 'SICEPAT',
  'sap': 'SAP',
  'pos': 'POS',
  'idexpress': 'IDEXPRESS',
  'lion': 'LION',
  // tambahkan mapper lain jika diperlukan
};

/**
 * Mapper untuk tipe layanan ke format yang dikenali oleh API Komerce
 */
const serviceTypeMapper = {
  'reg': 'REG',
  'regular': 'REG',
  'ctc23': 'CTC23',
  'ez': 'EZ',
  'udrreg': 'UDRREG',
  'standard': 'Standard',
  'siunt': 'SIUNT',
  'idlite': 'IDlite',
  'regpack': 'REGPACK',
  // tambahkan mapper lain jika diperlukan
};

const parseShippingMethod = (shippingMethod) => {
  console.log("=== PARSING SHIPPING METHOD DEBUG ===");
  
  if (!shippingMethod || typeof shippingMethod !== 'string') {
    console.error("Invalid shipping method input:", shippingMethod);
    throw new Error('Metode pengiriman tidak valid');
  }
  
  console.log("Input shipping method:", shippingMethod);
  console.log("Type:", typeof shippingMethod);
  console.log("Length:", shippingMethod.length);
  console.log("Contains '-':", shippingMethod.includes('-'));
  console.log("Contains ' - ':", shippingMethod.includes(' - '));
  
  try {
    // Format yang mungkin:
    // 1. ID dari shippingOptions: "jne-REG23"
    // 2. Label: "JNE - REG - Rp 10.000 (2-3 hari)"
    // 3. Nama: "JNE - REG (2-3 hari)"
    
    let courier, serviceType;
    
    // Prioritaskan format ID dari shippingOptions (format langsung)
    if (shippingMethod.includes('-') && !shippingMethod.includes(' - ')) {
      const parts = shippingMethod.split('-');
      console.log("Direct format parts:", parts);
      
      if (parts.length >= 2) {
        courier = parts[0].trim().toLowerCase(); // Extract courier code
        // Combine all the remaining parts as the service type
        serviceType = parts.slice(1).join('-').trim();
        
        // Map courier and service type to standardized format
        const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
        const mappedServiceType = serviceTypeMapper[serviceType.toLowerCase()] || serviceType.toUpperCase();
        
        console.log(`Parsed direct format: courier=${courier} → ${mappedCourier}, serviceType=${serviceType} → ${mappedServiceType}`);
        return [mappedCourier, mappedServiceType];
      }
    }
    
    // Coba format label: "JNE - REG - Rp 10.000 (2-3 hari)"
    if (shippingMethod.includes(' - Rp ')) {
      console.log("Trying label format parse");
      const splitByPrice = shippingMethod.split(' - Rp ');
      console.log("Split by price:", splitByPrice);
      
      const firstParts = splitByPrice[0].split(' - ');
      console.log("First parts:", firstParts);
      
      if (firstParts.length >= 2) {
        courier = firstParts[0].trim().toLowerCase();
        serviceType = firstParts[1].trim();
        
        // Map courier and service type to standardized format
        const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
        const mappedServiceType = serviceTypeMapper[serviceType.toLowerCase()] || serviceType.toUpperCase();
        
        console.log(`Parsed label format: courier=${courier} → ${mappedCourier}, serviceType=${serviceType} → ${mappedServiceType}`);
        return [mappedCourier, mappedServiceType];
      }
    }
    
    // Format nama: "JNE - REG (2-3 hari)" atau "J&T - EKONOMI"
    console.log("Trying name format parse");
    const parts = shippingMethod.split(' - ');
    console.log("Parts by ' - ':", parts);
    
    if (parts.length >= 2) {
      courier = parts[0].trim().toLowerCase();
      
      // Extract service type without the ETD part
      const servicePart = parts[1];
      
      if (servicePart.includes('(')) {
        serviceType = servicePart.split('(')[0].trim();
        console.log("Service part contains ETD, extracted:", serviceType);
      } else {
        serviceType = servicePart.trim();
        console.log("Service part without ETD:", serviceType);
      }
      
      // Map courier and service type to standardized format
      const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
      const mappedServiceType = serviceTypeMapper[serviceType.toLowerCase()] || serviceType.toUpperCase();
      
      console.log(`Parsed name format: courier=${courier} → ${mappedCourier}, serviceType=${serviceType} → ${mappedServiceType}`);
      return [mappedCourier, mappedServiceType];
    }
    
    // Fallback - jika tidak ada format yang cocok, coba ekstrak dengan regex
    console.log("Trying regex fallback");
    const courierMatch = /^([a-zA-Z&]+)/.exec(shippingMethod);
    const serviceMatch = /-\s*([a-zA-Z0-9]+)/.exec(shippingMethod);
    
    console.log("Courier regex match:", courierMatch);
    console.log("Service regex match:", serviceMatch);
    
    if (courierMatch && serviceMatch) {
      courier = courierMatch[1].trim().toLowerCase();
      serviceType = serviceMatch[1].trim();
      
      // Map courier and service type to standardized format
      const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
      const mappedServiceType = serviceTypeMapper[serviceType.toLowerCase()] || serviceType.toUpperCase();
      
      console.log(`Parsed regex format: courier=${courier} → ${mappedCourier}, serviceType=${serviceType} → ${mappedServiceType}`);
      return [mappedCourier, mappedServiceType];
    }
    
    console.error("No parsing pattern matched for:", shippingMethod);
    throw new Error(`Format metode pengiriman tidak valid: ${shippingMethod}`);
  } catch (error) {
    console.error("Error parsing shipping method:", error);
    // Fallback ke nilai default untuk mencegah aplikasi crash
    console.warn("Using fallback shipping method: jne-reg");
    return ["JNE", "REG"]; // Menggunakan kode kurir dalam huruf besar yang didukung oleh API Komerce
  }
};

/**
 * Get a store order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Store order details
 */
export const getStoreOrder = async (orderId) => {
  try {
    // Validasi ID order
    if (!orderId) {
      throw new Error('ID order tidak tersedia');
    }
    
    console.log('Getting store order with ID:', orderId);
    
    // Kirim request ke API dengan timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/store_order/${orderId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! Status: ${response.status}`, errorText);
        
        // Berikan pesan error yang sesuai berdasarkan status code
        if (response.status === 404) {
          throw new Error(`Order dengan ID ${orderId} tidak ditemukan`);
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Tidak memiliki akses untuk melihat order ini');
        } else {
          throw new Error(`Gagal mengambil data order (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();
      
      // Validasi data respons
      if (!data) {
        throw new Error('Respons API tidak valid');
      }
      
      console.log('Store order retrieved successfully:', data);
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Koneksi timeout, silakan coba lagi');
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Error getting store order:', error);
    throw error;
  }
};

/**
 * Create a new transaction with stored order data
 * @param {string} orderId - Order ID from stored order
 * @returns {Promise<Object>} Transaction result
 */
export const createTransactionFromStoredOrder = async (orderId) => {
  try {
    console.log('Creating transaction from stored order ID:', orderId);
    
    // First get the stored order data
    const orderData = await getOrderData(orderId);
    console.log('Retrieved order data:', orderData);
    
    // Convert items back to the format expected by the API
    const formattedOrderData = {
      ...orderData,
      items: orderData.items.map(item => ({
        name: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }))
    };
    
    console.log('Formatted order data for transaction:', formattedOrderData);
    
    // Then create transaction
    const response = await fetch(`${API_BASE_URL}/api/v1/transaksi/enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formattedOrderData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}`, errorText);
      throw new Error(`Failed to create transaction (${response.status})`);
    }

    const data = await response.json();
    console.log('Transaction created successfully:', data);
    console.log('Token:', data.token);
    console.log('Redirect URL:', data.redirect_url);
    console.log('Payment status:', data.payment_status);
    console.log('Frontend total:', data.frontend_total);
    console.log('Midtrans amount:', data.midtrans_amount);
    
    return data;
  } catch (error) {
    console.error('Error creating transaction from stored order:', error);
    throw error;
  }
};

/**
 * Create store order from checkout data and handle multiple payment options
 * @param {Object} checkoutData - Complete checkout data
 * @returns {Promise<Object>} Complete transaction result with store order info
 */
export const createStoreOrderTransaction = async (checkoutData) => {
  console.log('=== CREATE STORE ORDER TRANSACTION WORKFLOW ===');
  try {
    // Validasi data checkout
    if (!checkoutData) {
      console.error('Checkout data is undefined or null');
      throw new Error('Data checkout tidak tersedia');
    }
    
    console.log('Creating store order transaction with data:');
    console.log('- Customer:', checkoutData.fullName);
    console.log('- Phone:', checkoutData.telephone);
    console.log('- Payment method:', checkoutData.paymentMethod);
    console.log('- Shipping method:', checkoutData.shippingMethod);
    console.log('- Items count:', checkoutData.items ? checkoutData.items.length : 0);
    console.log('- Total amount:', checkoutData.totalAmount);
    
    // Step 1: Format checkout data to store order format
    console.log('Step 1: Formatting checkout data to store order format');
    const storeOrderData = formatStoreOrderData(checkoutData);
    console.log('Store order data formatted successfully:', storeOrderData.order_date);
    
    // Step 2: Create store order
    console.log('Step 2: Creating store order with formatted data');
    const storeOrderResponse = await createStoreOrder(storeOrderData);
    
    // Validasi respons dari API
    if (!storeOrderResponse) {
      console.error('API returned empty response');
      throw new Error('Tidak ada respons dari API store order');
    }
    
    console.log('Store order created successfully with ID:', storeOrderResponse.id || storeOrderResponse.order_id);
    
    // Check store order response
    if (!storeOrderResponse.meta || storeOrderResponse.meta.status !== 'success') {
      // Extract error message and check if it's related to insurance
      const errorMessage = storeOrderResponse.meta?.message || 'Terjadi kesalahan pada server';
      
      // Check if this is an insurance-related error
      if (errorMessage.includes('insurance') || errorMessage.includes('300,000')) {
        console.error('Insurance validation error:', errorMessage);
        throw new Error(`Pesanan tidak dapat diasuransikan: Total produk harus lebih dari Rp 300.000. Silakan coba lagi tanpa asuransi.`);
      } else {
        throw new Error(`Gagal membuat store order: ${errorMessage}`);
      }
    }
    
    console.log('Store order created successfully:', storeOrderResponse);
    
    // Validasi data respons
    if (!storeOrderResponse.data) {
      throw new Error('Data store order tidak tersedia dalam respons API');
    }
    
    // Step 3: Extract order ID and save for reference
    const orderId = storeOrderResponse.data.id || storeOrderResponse.data.order_id;
    
    if (!orderId) {
      throw new Error('ID order tidak tersedia dalam respons API');
    }
    
    // Save order ID for reference
    localStorage.setItem('last_store_order_id', orderId);
    
    // Step 4: For COD payment, we're done
    if (checkoutData.paymentMethod && checkoutData.paymentMethod.includes('COD')) {
      return {
        success: true,
        payment_type: 'COD',
        order_id: orderId,
        store_order: storeOrderResponse.data,
        timestamp: new Date().toISOString()
      };
    }
    
    // Step 5: For non-COD payment, create Midtrans transaction
    // Format order data for Midtrans transaction
    const midtransOrderData = {
      ...checkoutData,
      store_order_id: orderId // Include store order ID for reference
    };
    
    // Create Midtrans transaction
    const transactionResponse = await createTransaction(midtransOrderData);
    
    // Validasi respons transaksi
    if (!transactionResponse) {
      throw new Error('Tidak ada respons dari API transaksi');
    }
    
    // Return combined response
    return {
      ...transactionResponse,
      success: true,
      store_order_id: orderId,
      store_order: storeOrderResponse.data,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error creating store order transaction:', error);
    // Berikan pesan error yang lebih deskriptif
    throw new Error(`Gagal membuat transaksi: ${error.message}`);
  }
};
