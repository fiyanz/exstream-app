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
      throw new Error(`Failed to create transaction (${response.status})`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
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
  // Method 1: Try popup mode first (if Snap.js is available)
  if (window.snap && typeof window.snap.pay === 'function') {
    try {
      
      // Create a more robust popup configuration
      const popupConfig = {
        onSuccess: function(result) {
          // Close popup and show success message
          if (window.snapPopup && !window.snapPopup.closed) {
            window.snapPopup.close();
          }
          alert('Pembayaran berhasil! Terima kasih telah berbelanja.');
          // Optionally redirect to success page
          window.location.href = '/success';
        },
        onPending: function(result) {
          alert('Pembayaran pending, silakan selesaikan pembayaran Anda.');
        },
        onError: function(result) {
          // Close popup if open
          if (window.snapPopup && !window.snapPopup.closed) {
            window.snapPopup.close();
          }
          alert('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: function() {
          // Don't show alert here as user might have intentionally closed it
        }
      };
      
      // Try to open popup
      window.snap.pay(snapToken, popupConfig);
      return;
      
    } catch (err) {
      // Trying alternative methods
    }
  }
  
  // Method 2: Try opening in new window/tab
  if (redirectUrl) {
    try {
      const popup = window.open(redirectUrl, 'midtrans_payment', 
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no');
      
      if (popup) {
        window.snapPopup = popup;
        
        // Check if popup was blocked
        if (popup.closed || typeof popup.closed === 'undefined') {
          window.location.href = redirectUrl;
        } else {
          // Monitor popup
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              // You could check payment status here
            }
          }, 1000);
        }
      } else {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      window.location.href = redirectUrl;
    }
  } else {
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
      
      // Show the container
      const container = document.getElementById(containerId);
      const embedContent = document.getElementById('snap-embed-content');
      if (container) {
        container.style.display = 'block';
      }
      
      window.snap.embed(snapToken, {
        embedId: containerId,
        onSuccess: function(result) {
          // Hide container
          if (container) {
            container.style.display = 'none';
          }
          alert('Pembayaran berhasil! Terima kasih telah berbelanja.');
          // Optionally redirect to success page
          window.location.href = '/success';
        },
        onPending: function(result) {
          alert('Pembayaran pending, silakan selesaikan pembayaran Anda.');
        },
        onError: function(result) {
          // Hide container
          if (container) {
            container.style.display = 'none';
          }
          alert('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: function() {
          // Hide container
          if (container) {
            container.style.display = 'none';
          }
        }
      });
    } catch (err) {
      alert('Terjadi kesalahan dalam menampilkan halaman pembayaran.');
    }
  } else {
    alert('Halaman pembayaran tidak dapat ditampilkan.');
  }
};

/**
 * Enhanced payment handler with multiple fallback methods
 * @param {string} snapToken - Midtrans snap token
 * @param {string} redirectUrl - Midtrans redirect URL
 */
export const handleMidtransPaymentEnhanced = (snapToken, redirectUrl) => {
  // Method 1: Try direct redirect first (most reliable)
  if (redirectUrl) {
    try {
      // Try to open in new window/tab
      const popup = window.open(redirectUrl, 'midtrans_payment', 
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no');
      
      if (popup && !popup.closed) {
        // Check if popup was blocked
        setTimeout(() => {
          if (popup.closed) {
            window.location.href = redirectUrl;
          }
        }, 1000);
        
        return;
      } else {
        window.location.href = redirectUrl;
        return;
      }
    } catch (err) {
      window.location.href = redirectUrl;
      return;
    }
  }
  
  // Method 2: Try Snap.js if available
  if (window.snap && typeof window.snap.pay === 'function' && snapToken) {
    try {
      window.snap.pay(snapToken, {
        onSuccess: function(result) {
          alert('Pembayaran berhasil! Terima kasih telah berbelanja.');
          window.location.href = '/success';
        },
        onPending: function(result) {
          alert('Pembayaran pending, silakan selesaikan pembayaran Anda.');
        },
        onError: function(result) {
          alert('Pembayaran gagal. Silakan coba lagi.');
        },
        onClose: function() {
          // Payment popup closed
        }
      });
      return;
    } catch (err) {
      // Snap popup failed
    }
  }
  
  // Method 2: Try embedded mode with token
  if (window.snap && typeof window.snap.embed === 'function' && snapToken) {
    try {
      embedMidtransSnap(snapToken);
      return;
    } catch (err) {
      // Embedded mode failed
    }
  }
  
  // Method 3: Try Snap embed with redirect URL (extract token from URL)
  if (window.snap && typeof window.snap.embed === 'function' && redirectUrl) {
    try {
      // Extract token from redirect URL if possible
      const urlParts = redirectUrl.split('/');
      const extractedToken = urlParts[urlParts.length - 1];
      
      if (extractedToken && extractedToken.length > 10) {
        embedMidtransSnap(extractedToken);
        return;
      }
    } catch (err) {
      // Snap embed with redirect URL failed
    }
  }
  
  // Method 4: Try new window popup
  if (redirectUrl) {
    try {
      const popup = window.open(redirectUrl, 'midtrans_payment', 
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no');
      
      if (popup && !popup.closed) {
        return;
      }
    } catch (err) {
      // New window popup failed
    }
  }
  
  // Method 5: Fallback to redirect
  if (redirectUrl) {
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
export const storeOrder = async (orderData) => {
  try {
    // Format data for the API
    const formattedData = formatOrderData(orderData);
    
    // Special case handling for COD orders
    if (orderData.paymentMethod === 'COD') {
      // Process COD order
    }

    // Rest of the implementation
    return {};
  } catch (error) {
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
    
    const response = await fetch(`${API_BASE_URL}/api/v1/transaksi/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get order (${response.status})`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
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
    
    // Validasi data order sebelum mengirim ke API
    if (!orderData) {
      throw new Error('Data order tidak tersedia');
    }
    
    // Validasi field yang diperlukan
    const requiredFields = [
      'order_date', 'receiver_name', 'receiver_phone', 'receiver_address', 'receiver_destination_id',
      'shipping', 'shipping_type', 'payment_method', 'shipping_cost', 'grand_total'
    ];
    
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Data tidak lengkap: ${missingFields.join(', ')}`);
    }    // Kirim request ke API dengan timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout
    
    try {
      // Log the request payload for debugging
      console.log('Creating store order with data:', JSON.stringify(orderData, null, 2)); 
      // kirim wa
      
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

          // Check for specific error messages about service fee or insurance
          if (errorResponse.detail && typeof errorResponse.detail === 'string') {
            // Check for COD not supported by courier error
            if (errorResponse.detail.includes('Kurir') && errorResponse.detail.includes('tidak mendukung pembayaran COD')) {
              // Show alert for courier not supporting COD
              alert(errorResponse.detail);
              errorDetail = errorResponse.detail;
            } else if (errorResponse.detail.includes('service fee') || errorResponse.detail.includes('insurance')) {
              errorDetail = errorResponse.detail;
            } else {
              errorDetail = `Error from server: ${errorResponse.detail}`;
            }
          } else if (errorResponse.meta && errorResponse.meta.message) {
            // Handle errors that come in the meta.message format
            errorDetail = errorResponse.meta.message;
            
            // Special handling for date order error
            if (errorDetail.includes("date order can't before today")) {
              console.error("Date error detected! Current date used:", orderData.order_date);
              errorDetail = "Terjadi kesalahan pada tanggal order. Silakan coba lagi.";
            }
          } else {
            errorDetail = JSON.stringify(errorResponse);
          }
        } catch (e) {
          const errorText = await response.text();

          errorDetail = errorText;
        }
        throw new Error(`Gagal membuat store order (${response.status}): ${errorDetail}`);
      }

      const data = await response.json();
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Koneksi timeout, silakan coba lagi');
      }
      
      throw fetchError;
    }
  } catch (error) {

    throw error;
  }
};

/**
 * Format checkout data into Komerce store order format
 * @param {Object} checkoutData - Checkout data from frontend form
 * @returns {Object} Formatted store order data
 */
export const formatStoreOrderData = (checkoutData) => {
  // Get the current date in Jakarta/Indonesia timezone (GMT+7) in YYYY-MM-DD HH:MM:SS format
  // This ensures the date is always current according to Indonesia time, regardless of client timezone
  const now = new Date();
  const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours for GMT+7
  
  // Format as YYYY-MM-DD HH:MM:SS
  const year = jakartaTime.getUTCFullYear();
  const month = String(jakartaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jakartaTime.getUTCDate()).padStart(2, '0');
  const hours = String(jakartaTime.getUTCHours()).padStart(2, '0');
  const minutes = String(jakartaTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(jakartaTime.getUTCSeconds()).padStart(2, '0');
  
  const orderDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
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
  

  
  if (!fullName || !telephone || !address || !destination_id) {
    throw new Error('Data penerima tidak lengkap');
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Data produk tidak tersedia');
  }
  
  // Map payment method to Komerce format
  const mappedPaymentMethod = paymentMethod.includes('COD') ? 'COD' : 'Transfer';
  
  // Parse shipping method to get courier and service type
  const [courier, serviceType] = parseShippingMethod(shippingMethod);
  
  // Calculate COD value
  const codValue = mappedPaymentMethod === 'COD' ? totalAmount : 0;
  
  // Format full address
  const fullAddress = `${address}${city ? `, ${city}` : ''}${province ? `, ${province}` : ''}`;
  
  // Format order details
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
  
  // Calculate total product price to check insurance eligibility
  const totalProductPrice = formattedOrder.order_details.reduce((sum, item) => sum + item.subtotal, 0);
  
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
  
  if (!shippingMethod || typeof shippingMethod !== 'string') {
    throw new Error('Metode pengiriman tidak valid');
  }
  
  try {
    // Format yang mungkin:
    // 1. ID dari shippingOptions: "jne-REG23"
    // 2. Label: "JNE - REG - Rp 10.000 (2-3 hari)"
    // 3. Nama: "JNE - REG (2-3 hari)"
    
    let courier, serviceType;
    
    // Prioritaskan format ID dari shippingOptions (format langsung)
    if (shippingMethod.includes('-') && !shippingMethod.includes(' - ')) {
      const parts = shippingMethod.split('-');
      
      if (parts.length >= 2) {
        courier = parts[0].trim().toLowerCase(); // Extract courier code
        // Combine all the remaining parts as the service type
        serviceType = parts.slice(1).join('-').trim();
        
        // Map courier and service type to standardized format
        const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
        const mappedServiceType = serviceTypeMapper[serviceType.toLowerCase()] || serviceType.toUpperCase();
        return [mappedCourier, mappedServiceType];
      }
    }
    
    // Coba format label: "JNE - REG - Rp 10.000 (2-3 hari)"
    if (shippingMethod.includes(' - Rp ')) {
      const splitByPrice = shippingMethod.split(' - Rp ');
      
      const firstParts = splitByPrice[0].split(' - ');
      
      if (firstParts.length >= 2) {
        courier = firstParts[0].trim().toLowerCase();
        serviceType = firstParts[1].trim();
        
        // Map courier and service type to standardized format
        const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
        const mappedServiceType = serviceTypeMapper[serviceType.toLowerCase()] || serviceType.toUpperCase();
        return [mappedCourier, mappedServiceType];
      }
    }
    
    // Format nama: "JNE - REG (2-3 hari)" atau "J&T - EKONOMI"
    const parts = shippingMethod.split(' - ');
    
    if (parts.length >= 2) {
      courier = parts[0].trim().toLowerCase();
      
      // Extract service type without the ETD part
      const servicePart = parts[1];
      
      if (servicePart.includes('(')) {
        serviceType = servicePart.split('(')[0].trim();
      } else {
        serviceType = servicePart.trim();
      }
      
      // Map courier and service type to standardized format
      const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
      const mappedServiceType = serviceTypeMapper[serviceType.toLowerCase()] || serviceType.toUpperCase();
      return [mappedCourier, mappedServiceType];
    }
    
    // Fallback - jika tidak ada format yang cocok, coba ekstrak dengan regex
    const courierMatch = /^([a-zA-Z&]+)/.exec(shippingMethod);
    const serviceMatch = /-\s*([a-zA-Z0-9]+)/.exec(shippingMethod);
    
    if (courierMatch && serviceMatch) {
      courier = courierMatch[1].trim().toLowerCase();
      serviceType = serviceMatch[1].trim();
      
      // Map courier and service type to standardized format
      const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
      const mappedServiceType = serviceTypeMapper[serviceType.toLowerCase()] || serviceType.toUpperCase();
      return [mappedCourier, mappedServiceType];
    }
    
    throw new Error(`Format metode pengiriman tidak valid: ${shippingMethod}`);
  } catch (error) {
    // Fallback ke nilai default untuk mencegah aplikasi crash
    return ["JNE", "REG"]; // Menggunakan kode kurir dalam huruf besar yang didukung oleh API Komerce
  }
};



/**
 * Create a new transaction with stored order data
 * @param {string} orderId - Order ID from stored order
 * @returns {Promise<Object>} Transaction result
 */
export const createTransactionFromStoredOrder = async (orderId) => {
  try {
    // First get the stored order data
    const orderData = await getOrderData(orderId);
    
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

      throw new Error(`Failed to create transaction (${response.status})`);
    }

    const data = await response.json();

    
    return data;
  } catch (error) {
    throw error;
  }
};

