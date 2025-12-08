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
      throw new Error(`Invalid API response: ${response.status} ${errorText}`);
    }

    if (!response.ok) {
      
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
        
        // Create a new object without insurance_value
        const newOrderData = {...validatedData};
        if ('insurance_value' in newOrderData) {
          delete newOrderData.insurance_value;
        }
        
        // Recursively call createStoreOrder without insurance_value
        return createStoreOrder(newOrderData);
      }
                          
      throw new Error(`Store order API error: ${errorMessage}`);
    }

    // Order created successfully
    return responseData;
  } catch (error) {
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
  
  // Only include insurance if product price is above threshold
  // For products below 300,000 IDR, remove insurance_value completely from the payload
  if ('insurance_value' in data) {
    // Insurance value should be calculated by backend
    // Just ensure the field is not present to avoid validation issues
    delete data.insurance_value;
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

  // Create final order object - NEVER include insurance_value field, let backend handle it
  return {
    order_date: orderDate,
    brand_name: shipper.brand_name || "Extreme Store",
    shipper_name: shipper.name || "Extreme Store Official",
    shipper_phone: shipper.phone || telephone.replace(/^0/, ""),  // Remove leading zero as per API format
    shipper_destination_id: parseInt(shipper.destination_id || destination_id),
    shipper_address: shipper.address || address,
    shipper_email: shipper.email || "jashujanextremee@gmail.com",
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
    throw error;
  }
};
