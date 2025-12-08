/**
 * hitungCostOngkir.js
 * 
 * This module provides functions to calculate shipping costs 
 * by interacting with the backend shipping API.
 */

import { API_BASE_URL } from './dataWilayah';

/**
 * Calculates shipping costs based on destination and weight
 * @param {Object} params - Shipping calculation parameters
 * @param {string} params.receiver_destination_id - Destination location ID (city, district, or village ID)
 * @param {number} params.weight - Package weight in grams
 * @returns {Promise<Object>} Shipping cost calculation results
 */
/**
 * Format shipping cost results for display
 * @param {Object} shippingData - Shipping cost calculation results
 * @returns {Array} Formatted array of shipping options 
 */
export const formatShippingOptions = (shippingData) => {
  // Handle empty or invalid data
  if (!shippingData) {
    return [];
  }
  
  
  // Keywords to identify regular shipping services
  const regularKeywords = ['reguler', 'regular', 'reg', 'ez', 'standard', 'ekonomi', 'economy'];
  
  // Function to check if a service is a regular type
  const isRegularService = (item) => {
    const serviceNameLower = (item.service || '').toLowerCase();
    const descriptionLower = (item.description || '').toLowerCase();
    
    // Check if service name or description contains regular keywords
    return regularKeywords.some(keyword => 
      serviceNameLower.includes(keyword) || 
      descriptionLower.includes(keyword)
    );
  };
  
  // Handle domestic API format with meta status and array data
  if (shippingData.meta && shippingData.meta.status === "success" && Array.isArray(shippingData.data)) {
    const data = shippingData.data;
    
    // Filter for regular services and reasonable costs
    const filteredData = data.filter(item => 
      isRegularService(item)
    );
    
    // Format shipping options from filtered data array
    return filteredData.map(item => {
      // Format ETD (Estimated Time of Delivery)
      let etd = item.etd || '1-3 hari';
      if (etd === '' || etd === '-') etd = '1-3 hari';
      if (etd.includes('day')) etd = etd.replace('day', 'hari');
      if (!etd.includes('hari') && !isNaN(etd)) etd = `${etd} hari`;
      
      return {
        id: `${item.code}-${item.service}`,
        name: `${item.name} - ${item.service}`,
        code: item.code,
        service: item.service,
        description: item.description || item.service,
        cost: item.cost,
        etd: etd,
        label: `${item.name} - ${item.service} - Rp ${item.cost.toLocaleString('id-ID')} (${etd})`
      };
    });
  }
  
  // Direct array format
  if (Array.isArray(shippingData)) {
    // Filter for regular services and reasonable costs
    const filteredData = shippingData.filter(courier => 
      isRegularService(courier)
    );
    
    return filteredData.map(courier => {
      let etd = courier.etd || '1-3 hari';
      if (etd === '' || etd === '-') etd = '1-3 hari';
      
      return {
        id: `${courier.code}-${courier.service}`,
        name: `${courier.name} - ${courier.service}`,
        code: courier.code,
        service: courier.service,
        description: courier.description || courier.service,
        cost: courier.cost || courier.price || 0,
        etd: etd,
        label: `${courier.name} - ${courier.service} - Rp ${(courier.cost || 0).toLocaleString('id-ID')} (${etd})`
      };
    });
  }
  
  // Data property as array
  if (shippingData.data && Array.isArray(shippingData.data)) {
    // Filter for regular services and reasonable costs
    const filteredData = shippingData.data.filter(courier => 
      isRegularService(courier)
    );
    
    return filteredData.map(courier => {
      let etd = courier.etd || '1-3 hari';
      
      return {
        id: `${courier.code}-${courier.service}`,
        name: `${courier.name} - ${courier.service}`,
        code: courier.code,
        service: courier.service,
        description: courier.description || courier.service,
        cost: courier.cost || 0,
        etd: etd,
        label: `${courier.name} - ${courier.service} - Rp ${(courier.cost || 0).toLocaleString('id-ID')} (${etd})`
      };
    });
  }
  
  return [];
};

export const calculateShippingCost = async ({ receiver_destination_id, weight }) => {
  try {
    if (!receiver_destination_id) {
      throw new Error('Destination ID is required');
    }
    
    // Convert the ID to a number to ensure it's valid
    const destinationId = Number(receiver_destination_id);
    if (isNaN(destinationId) || destinationId <= 0) {
      throw new Error('ID tujuan harus berupa angka positif');
    }
    
    // Make sure weight is a number and at least 1 gram
    const validatedWeight = Math.max(1, Number(weight) || 1000);
    
    // Standard courier list for domestic shipping with colon separators as required by API
    const couriers = "jne:sicepat:ide:sap:jnt:ninja:tiki:lion:anteraja:pos:ncs:rex:rpx:sentral:star:wahana:dse";
    
    // Prepare request body - EXACT format required by API
    const requestBody = {
      destination: destinationId,
      weight: validatedWeight,
      courier: couriers,
      price: "lowest"
    };
    
    // Make API request to domestic endpoint
    const endpoint = `${API_BASE_URL}/api/v1/domestic/domestic-cost`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to calculate shipping costs (${response.status})`);
    }

    const data = await response.json();
    
    // Handle API response format
    if (data.meta) {
      // Case 1: Domestic API response with meta object
      if (data.meta.status !== "success") {
        return {
          success: false,
          message: data.meta.message || 'Gagal menghitung ongkos kirim'
        };
      }
      
      // Case 2: Successful response with data array
      if (data.meta.status === "success" && Array.isArray(data.data)) {
        
        if (data.data.length === 0) {
          return {
            success: false,
            message: "Tidak ada opsi pengiriman tersedia untuk tujuan ini"
          };
        }
        
        // Format results in a consistent structure
        return {
          success: true,
          message: data.meta.message || "Ongkos kirim berhasil dihitung",
          origin: {
            province: "JAWA TENGAH", // Default origin
            city: "KAB. KEBUMEN"
          },
          destination: {
            province: null,
            city: destinationId
          },
          weight: validatedWeight,
          data: data.data // Keep original data structure for formatting
        };
      }
    }
    
    // Return the original response for backward compatibility
    return data;
  } catch (error) {
    // Return a standardized error object that can be handled by the UI
    return {
      success: false,
      message: error.message || 'Gagal menghitung ongkos kirim',
      error: error.toString()
    };
  }
};

