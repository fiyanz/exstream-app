/**
 * storeOrder.js - API client for Komerce Store Order
 * 
 * This module provides a clean implementation of store order functionality
 * without any unnecessary code.
 */

import { API_BASE_URL } from './apiConfig';

/**
 * Creates a store order using the backend API
 * @param {Object} orderData - Complete order data in Komerce format
 * @returns {Promise<Object>} Store order response
 */
export const createStoreOrder = async (orderData) => {
  try {
    console.log('Creating store order with data:', orderData);
    console.log('Shipping courier:', orderData.shipping);
    console.log('Shipping type:', orderData.shipping_type);
    console.log('Payment method:', orderData.payment_method);
    
    // Calculate total product value for insurance validation debugging
    const totalProductValue = orderData.order_details?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
    console.log(`Total product value: ${totalProductValue} (for insurance validation)`);
    
    // Ensure required fields have proper values before sending
    const validatedData = validateOrderData(orderData);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/store_order/store_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(validatedData)
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      const errorText = await response.text();
      console.error('Store order API returned invalid JSON:', errorText);
      throw new Error(`Invalid API response: ${response.status} ${errorText}`);
    }

    if (!response.ok) {
      console.error('Store order API error:', response.status, responseData);
      
      // Extract specific error message and check for special cases
      let errorMessage = responseData?.meta?.message || 
                        responseData?.detail || 
                        `Error ${response.status}`;
      
      // Extract detailed error message from nested response if available
      const detailsError = responseData?.meta?.details?.meta?.message || 
                          responseData?.detail?.meta?.message;
      
      if (detailsError) {
        errorMessage = detailsError;
      }
      
      // Check for specific error types
      if (errorMessage.includes('only payment_method bank transfer supported')) {
        // Get the courier name from the error message
        const courierMatch = errorMessage.match(/for shipping ([A-Za-z&]+)/i);
        const courier = courierMatch ? courierMatch[1] : 'this courier';
        
        throw new Error(`${courier} tidak mendukung pembayaran COD. Silakan gunakan metode pembayaran transfer bank.`);
      } else if (errorMessage.includes('expedition not found')) {
        throw new Error('Kurir pengiriman tidak tersedia. Silakan pilih kurir lain.');
      } else if (errorMessage.includes('insurance value is invalid') || 
                errorMessage.includes('300,000') || 
                errorMessage.includes('INSURANCE_THRESHOLD_NOT_MET')) {
        
        console.warn('Insurance value error detected. Retrying without insurance value');
        console.log('Original data:', validatedData);
        
        // Calculate total product value for validation
        const totalProductValue = validatedData.order_details?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
        console.log(`Total product value: ${totalProductValue}`);
        
        // Create a new object without insurance_value
        const newOrderData = {...validatedData};
        if ('insurance_value' in newOrderData) {
          delete newOrderData.insurance_value;
          console.log('Removed insurance_value field from payload');
        }
        
        // Log the new data
        console.log('Retrying with data:', newOrderData);
        
        // Recursively call createStoreOrder without insurance_value
        return createStoreOrder(newOrderData);
      }
                          
      throw new Error(`Store order API error: ${errorMessage}`);
    }

    console.log('Store order created successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error creating store order:', error);
    throw error;
  }
};

/**
 * Validates and fixes common order data issues
 * @param {Object} orderData - Order data to validate
 * @returns {Object} - Validated order data
 */
const validateOrderData = (orderData) => {
  const data = {...orderData};
  
  // Fix shipping courier (expedition) format
  // Komerce API expects lowercase courier codes
  if (data.shipping) {
    data.shipping = data.shipping.toLowerCase();
    
    // Map common courier codes to Komerce format
    const courierMap = {
      'j&t': 'jnt',
      'pos indonesia': 'pos',
      'id express': 'idexpress'
    };
    
    data.shipping = courierMap[data.shipping] || data.shipping;
  }
  
  // Fix service type format (should be lowercase)
  if (data.shipping_type) {
    data.shipping_type = data.shipping_type.toLowerCase();
  }
  
  // Fix phone number format (remove leading zero)
  if (data.shipper_phone && data.shipper_phone.startsWith('0')) {
    data.shipper_phone = data.shipper_phone.slice(1);
  }
  
  if (data.receiver_phone && data.receiver_phone.startsWith('0')) {
    data.receiver_phone = data.receiver_phone.slice(1);
  }
  
  // Check for couriers that don't support COD payment
  // Based on Komerce API error: "only payment_method bank transfer supported for shipping LION"
  const nonCodCouriers = ['lion', 'ncs', 'rex', 'rpx', 'sentral', 'star', 'wahana', 'dse'];
  
  if (data.payment_method === 'COD' && nonCodCouriers.includes(data.shipping.toLowerCase())) {
    console.warn(`Courier ${data.shipping} doesn't support COD payments. Switching to BANK TRANSFER.`);
    data.payment_method = 'BANK TRANSFER';
    data.cod_value = 0;
  }
  
  // Ensure service_fee is properly calculated (2.8% of grand total or COD value)
  const baseAmount = data.payment_method === 'COD' ? 
    (data.cod_value || data.grand_total) : data.grand_total;
  
  data.service_fee = Math.round(baseAmount * 0.028);
  
  // Handle insurance value
  // Calculate total product price to determine if insurance should be applied
  const totalProductPrice = data.order_details.reduce((sum, item) => sum + item.subtotal, 0);
  console.log(`Total product price in validation: ${totalProductPrice} (threshold: 300,000 IDR)`);
  
  // Only include insurance if product price is above threshold
  // For products below 300,000 IDR, remove insurance_value completely from the payload
  if ('insurance_value' in data) {
    if (totalProductPrice <= 300000) {
      console.warn("Products total below 300,000 IDR - removing insurance_value from request");
      delete data.insurance_value;
    } else {
      console.log(`Products total above 300,000 IDR - insurance eligible (${totalProductPrice} IDR)`);
      // Insurance value should be calculated by backend
      // Just ensure the field is not present to avoid validation issues
      delete data.insurance_value;
    }
  } else {
    console.log("No insurance_value field in request - good!");
  }
  
  return data;
};

/**
 * Format order data according to Komerce API requirements
 * @param {Object} checkoutData - Checkout data from frontend
 * @returns {Object} Formatted order data
 */
export const formatOrderData = (checkoutData) => {
  // Current timestamp in YYYY-MM-DD HH:MM:SS format
  const now = new Date();
  const orderDate = now.toISOString().slice(0, 19).replace('T', ' ');
  
  // Extract required fields from checkout data
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
  
  // Parse shipping method to get courier and service type
  const [courier, serviceType] = parseShippingMethod(shippingMethod);
  
  // List of couriers that don't support COD payments
  const nonCodCouriers = ['lion', 'ncs', 'rex', 'rpx', 'sentral', 'star', 'wahana', 'dse'];
  const lowerCourier = courier.toLowerCase();
  
  // Map payment method to expected format
  let mappedPaymentMethod = paymentMethod.toUpperCase().includes('COD') ? 'COD' : 'BANK TRANSFER';
  
  // Force BANK TRANSFER for couriers that don't support COD
  if (mappedPaymentMethod === 'COD' && nonCodCouriers.includes(lowerCourier)) {
    console.warn(`Courier ${courier} doesn't support COD payments. Switching to BANK TRANSFER.`);
    mappedPaymentMethod = 'BANK TRANSFER';
  }
  
  // Calculate COD value
  const codValue = mappedPaymentMethod === 'COD' ? totalAmount : 0;
  
  // Format full address
  const fullAddress = `${address}${city ? `, ${city}` : ''}${province ? `, ${province}` : ''}`;
  
  // Format order details
  const orderDetails = items.map(item => ({
    product_name: item.name,
    product_variant_name: item.variant || '',
    product_price: parseInt(item.price),
    product_weight: parseInt(item.weight),
    product_width: parseInt(item.width || 10),
    product_height: parseInt(item.height || 5),
    product_length: parseInt(item.length || 15),
    qty: parseInt(item.quantity),
    subtotal: parseInt(item.price * item.quantity)
  }));
  
  // Get shipper info
  const shipper = shipper_info || {};
  
  // Calculate total product price to determine if insurance should be applied
  const totalProductPrice = orderDetails.reduce((sum, item) => sum + item.subtotal, 0);
  console.log(`Total product price in formatOrderData: ${totalProductPrice} (threshold: 300,000 IDR)`);

  // Create final order object - NEVER include insurance_value field, let backend handle it
  return {
    order_date: orderDate,
    brand_name: shipper.brand_name || "Extreme Store",
    shipper_name: shipper.name || "Extreme Store Official",
    shipper_phone: shipper.phone || telephone.replace(/^0/, ""),  // Remove leading zero as per API format
    shipper_destination_id: parseInt(shipper.destination_id || destination_id),
    shipper_address: shipper.address || address,
    shipper_email: shipper.email || "store@extreme.com",
    receiver_name: fullName,
    receiver_phone: telephone.replace(/^0/, ""),  // Remove leading zero as per API format
    receiver_destination_id: parseInt(destination_id),
    receiver_address: fullAddress,
    shipping: courier.toLowerCase(),  // Ensure lowercase courier code
    shipping_type: serviceType.toLowerCase(),  // Ensure lowercase service type
    payment_method: mappedPaymentMethod === "COD" ? "COD" : "BANK TRANSFER",  // Ensure correct payment method format
    shipping_cost: parseInt(shippingCost),
    shipping_cashback: 0,
    service_fee: parseInt(totalAmount * 0.028),  // Calculate 2.8% as per Komerce requirements
    additional_cost: 0,
    grand_total: parseInt(totalAmount),
    cod_value: parseInt(codValue),
    // IMPORTANT: Don't include insurance_value field at all - let backend handle it
    order_details: orderDetails
  };
};

/**
 * Checks if a courier supports COD payment
 * @param {string} courier - Courier code
 * @returns {boolean} - True if courier supports COD, false otherwise
 */
export const doesCourierSupportCOD = (courier) => {
  if (!courier) return false;
  
  const nonCodCouriers = ['lion', 'ncs', 'rex', 'rpx', 'sentral', 'star', 'wahana', 'dse'];
  const lowerCourier = courier.toLowerCase();
  
  return !nonCodCouriers.includes(lowerCourier);
};

/**
 * Parse shipping method string into courier and service type
 * @param {string} shippingMethod - Shipping method string (e.g., "JNE - REG (2-3 hari)")
 * @returns {Array} [courier, serviceType]
 */
const parseShippingMethod = (shippingMethod) => {
  if (!shippingMethod || typeof shippingMethod !== 'string') {
    return ['jne', 'reg'];
  }
  
  try {
    // Split by dash or colon to separate courier from service type
    const parts = shippingMethod.split(/\s*[-:]\s*/);
    
    if (parts.length >= 2) {
      // Important: Komerce API expects lowercase courier codes
      const courier = parts[0].trim().toLowerCase();
      // Extract service type (remove any text in parentheses)
      let serviceType = parts[1].trim().split('(')[0].trim();
      
      // Map common service types to expected format
      const serviceMap = {
        'REGULAR': 'reg',
        'REGULER': 'reg',
        'STANDARD': 'std',
        'EXPRESS': 'exp',
        'ECONOMY': 'eco',
        'REG': 'reg'
      };
      
      // Convert service type to lowercase for consistency
      serviceType = serviceType.toLowerCase();
      return [courier, serviceMap[serviceType] || serviceType];
    }
    
    return [shippingMethod.trim().toLowerCase(), 'reg'];
  } catch (error) {
    console.error('Error parsing shipping method:', error);
    return ['jne', 'reg'];
  }
};

/**
 * Get a store order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getStoreOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/store_order/store_order/${orderId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error getting order: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting store order:', error);
    throw error;
  }
};
