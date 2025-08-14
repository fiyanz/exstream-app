/**
 * transactionService.js
 * 
 * This module provides functions to handle transaction creation
 * with support for both COD and non-COD (Midtrans) payments.
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
 * @param {Object} orderData - Order data from frontend
 * @returns {Promise<Object>} Stored order result
 */
export const storeOrderData = async (orderData) => {
  try {
    console.log('Storing order data:', orderData);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/transaksi/store-order`, {
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
