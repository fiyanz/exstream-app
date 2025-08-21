/**
 * hitungCostOngkir.js
 * 
 * This module provides functions to calculate shipping costs 
 * by interacting with the backend shipping API.
 */

import { API_BASE_URL } from './dataWilayah';

/**
 * Calculates shipping costs based on destination and package details
 * @param {Object} params - Shipping calculation parameters
 * @param {string} params.receiver_destination_id - Destination location ID (city, district, or village ID)
 * @param {number} params.weight - Package weight in grams
 * @param {number} params.item_value - Value of items being shipped in IDR (for insurance purposes)
 * @param {boolean} params.cod - Whether the shipment is Cash on Delivery
 * @returns {Promise<Object>} Shipping cost calculation results
 */
export const calculateShippingCost = async ({ receiver_destination_id, weight, item_value, cod }) => {
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
    
    // Make sure item_value is a number and non-negative
    const validatedItemValue = Math.max(0, Number(item_value) || 0);
    
    console.log(`Calculating shipping cost to destination ID: ${destinationId}`);
    console.log(`Package details - Weight: ${validatedWeight}g, Value: IDR ${validatedItemValue}, COD: ${cod ? 'yes' : 'no'}`);
    
    // Membuat request body yang akan digunakan
    const requestBody = {
      receiver_destination_id: destinationId,
      weight: validatedWeight,
      item_value: validatedItemValue,
      cod: Boolean(cod)
    };
    
    // Log request details
    console.log('Using API URL:', API_BASE_URL);
    console.log('Request body:', JSON.stringify(requestBody));
    
    // Menggunakan endpoint Komerce API melalui backend proxy
    const response = await fetch(`${API_BASE_URL}/api/v1/cost_ongkir/hitung`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}`, errorText);
      throw new Error(`Failed to calculate shipping costs (${response.status})`);
    }

    const data = await response.json();
    console.log('Shipping cost calculation results:', data);
    
    // Handle Komerce API response format which has meta object
    if (data.meta && data.meta.status !== "success") {
      console.error('API returned error:', data.meta.message || 'Unknown error');
      throw new Error(data.meta.message || 'Gagal menghitung ongkos kirim');
    }
    
    // Handle RajaOngkirResponse format which has success field
    if (data.hasOwnProperty('success') && !data.success) {
      console.error('API returned error:', data.message || 'Unknown error');
      throw new Error(data.message || 'Gagal menghitung ongkos kirim');
    }
    
    // Check if Komerce API returned empty shipping data in all categories
    if (data.meta && data.meta.status === "success" && data.data) {
      // Check if all shipping categories are empty
      const isEmpty = 
        (!data.data.calculate_reguler || data.data.calculate_reguler.length === 0) &&
        (!data.data.calculate_cargo || data.data.calculate_cargo.length === 0) &&
        (!data.data.calculate_instant || data.data.calculate_instant.length === 0);
      
      if (isEmpty) {
        console.warn('Komerce API returned empty shipping data in all categories');
        // Try the local API as a fallback instead of throwing an error
        console.log('Trying alternative API endpoint as fallback...');
        
        try {
          const fallbackResponse = await fetch(`${API_BASE_URL}/api/v1/cost_ongkir_lokal/cek-ongkir`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              receiver_destination_id: destinationId,
              weight: validatedWeight,
              item_value: validatedItemValue,
              cod: Boolean(cod)
            })
          });
          
          if (!fallbackResponse.ok) {
            console.warn('Fallback API also failed');
          } else {
            const fallbackData = await fallbackResponse.json();
            console.log('Fallback API response:', fallbackData);
            
            // If fallback was successful, return that data instead
            if (fallbackData.success && fallbackData.results && fallbackData.results.length > 0) {
              console.log('Using fallback API data instead');
              return fallbackData;
            }
          }
        } catch (fallbackError) {
          console.error('Error with fallback API:', fallbackError);
        }
        
        // If we get here, even the fallback failed
        console.log('Using original data even though it has empty categories');
      }
    }
    
    // Check if local API returned empty results
    if (data.hasOwnProperty('success') && data.success && 
        (!data.results || data.results.length === 0)) {
      console.warn('Local API returned empty shipping data');
      console.log('Will try to extract any usable data anyway');
    }
    
    // Return the complete response for handling in the component
    console.log('Returning shipping cost data:', data);
    return data;
  } catch (error) {
    console.error('Error calculating shipping costs:', error);
    
    // Provide user-friendly error message
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      console.error('Network error - Possible CORS issue or server not accessible');
      console.error('Current hostname:', window.location.hostname);
      console.error('API Base URL being used:', API_BASE_URL);
      throw new Error('Tidak dapat terhubung ke server. Mohon periksa koneksi internet Anda.');
    }
    
    // Add additional debug information
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    throw error;
  }
};

/**
 * Format the shipping cost results for display
 * @param {Object} shippingData - Shipping cost calculation results
 * @returns {Array} Formatted array of shipping options grouped by courier
 */
export const formatShippingOptions = (shippingData) => {
  console.log('Formatting shipping options from data:', shippingData);
  
  // Handle empty or invalid data
  if (!shippingData) {
    return [];
  }
  
  // Handle different API response formats
  
  // Case 1: RajaOngkirResponse format - local API
  if (shippingData.hasOwnProperty('success') && shippingData.hasOwnProperty('results')) {
    console.log('Processing RajaOngkirResponse format');
    return (shippingData.results || []).flatMap(courier => {
      return (courier.costs || []).map(service => {
        return {
          id: `${courier.code}-${service.service}`,
          name: `${courier.name} - ${service.description} (${service.etd})`,
          code: courier.code,
          service: service.service,
          description: service.description,
          cost: service.cost,
          etd: service.etd,
          label: `${courier.name} - ${service.description} - Rp ${service.cost.toLocaleString('id-ID')} (${service.etd})`
        };
      });
    });
  }
  
  // Case 2: Komerce API format with meta status and data
  if (shippingData.meta && shippingData.meta.status === "success" && shippingData.data) {
    console.log('Processing Komerce API format');
    const data = shippingData.data;
    
    // Check if the data structure has the expected properties
    if (!data.hasOwnProperty('calculate_reguler') &&
        !data.hasOwnProperty('calculate_cargo') &&
        !data.hasOwnProperty('calculate_instant')) {
      console.warn('Komerce API response is missing expected shipping categories');
      return getDefaultShippingOptions(); // Use default options
    }
    
    // Komerce response has three shipping categories
    const allOptions = [];
    let processedItems = 0;
    
    // Process calculate_reguler, calculate_cargo, calculate_instant
    for (const category of ['calculate_reguler', 'calculate_cargo', 'calculate_instant']) {
      if (data[category] && Array.isArray(data[category])) {
        console.log(`Processing ${category}: ${data[category].length} items`);
        
        data[category].forEach(item => {
          // Skip invalid items
          if (!item || typeof item !== 'object') {
            console.warn(`Skipping invalid item in ${category}`);
            return;
          }
          
          // Make sure we have the required fields
          if (!item.shipping_name || !item.service_name) {
            console.warn(`Item missing required fields in ${category}:`, item);
            return;
          }
          
          // Adjust the cost - Komerce returns values like 27000000 for 27,000
          const originalCost = item.shipping_cost || 0;
          // If cost > 100000, divide by 1000 to get a more reasonable value
          const adjustedCost = originalCost > 100000 ? originalCost / 1000 : originalCost;
          
          // Format ETD
          let etd = item.etd || '1-3 hari';
          if (etd === '-') etd = '1-3 hari';
          if (!etd.includes('hari') && !etd.includes('day')) etd += ' hari';
          
          allOptions.push({
            id: `${item.shipping_name}-${item.service_name}`,
            name: `${item.shipping_name} - ${item.service_name}`,
            code: item.shipping_name,
            service: item.service_name,
            description: item.service_name,
            cost: Math.round(adjustedCost),
            etd: etd,
            label: `${item.shipping_name} - ${item.service_name} - Rp ${Math.round(adjustedCost).toLocaleString('id-ID')} (${etd})`
          });
          
          processedItems++;
        });
      }
    }
    
    console.log(`Processed ${processedItems} shipping options from Komerce API`);
    
    // If we have options, return them
    if (allOptions.length > 0) {
      return allOptions;
    } else {
      console.warn('No valid shipping options found in Komerce API response, using default options');
      return getDefaultShippingOptions(); // Use default options when API returns empty data
    }
  }
  
  // Case 3: Old format - data is directly an array
  if (Array.isArray(shippingData)) {
    console.log('Processing direct array format');
    return shippingData.map(courier => {
      return {
        id: `${courier.courier_code || courier.code}-${courier.courier_service || courier.service}`,
        name: `${courier.courier_name || courier.name} - ${courier.courier_service || courier.service}`,
        code: courier.courier_code || courier.code,
        service: courier.courier_service || courier.service,
        description: courier.description || courier.courier_service || courier.service,
        cost: courier.cost || courier.price || 0,
        etd: courier.etd || courier.estimated_day || '1-3 hari',
        label: `${courier.courier_name || courier.name} - ${courier.courier_service || courier.service} - Rp ${(courier.cost || courier.price || 0).toLocaleString('id-ID')} (${courier.etd || courier.estimated_day || '1-3 hari'})`
      };
    });
  }
  
  // Case 4: Old format with data property as array
  if (shippingData.data && Array.isArray(shippingData.data)) {
    console.log('Processing data array format');
    return shippingData.data.map(courier => {
      return {
        id: `${courier.courier_code || courier.code}-${courier.courier_service || courier.service}`,
        name: `${courier.courier_name || courier.name} - ${courier.courier_service || courier.service}`,
        code: courier.courier_code || courier.code,
        service: courier.courier_service || courier.service,
        description: courier.description || courier.courier_service || courier.service,
        cost: courier.cost || courier.price || 0,
        etd: courier.etd || courier.estimated_day || '1-3 hari',
        label: `${courier.courier_name || courier.name} - ${courier.courier_service || courier.service} - Rp ${(courier.cost || courier.price || 0).toLocaleString('id-ID')} (${courier.etd || courier.estimated_day || '1-3 hari'})`
      };
    });
  }
  
  // Unrecognized format, log error and return default options
  console.error('Unknown shipping data format:', shippingData);
};

