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
export const calculateShippingCost = async ({ receiver_destination_id, weight = 1000, item_value = 0, cod = false }) => {
  try {
    if (!receiver_destination_id) {
      throw new Error('Destination ID is required');
    }

    // Make sure weight is a number and at least 1 gram
    const validatedWeight = Math.max(1, Number(weight) || 1000);
    
    // Make sure item_value is a number and non-negative
    const validatedItemValue = Math.max(0, Number(item_value) || 0);
    
    console.log(`Calculating shipping cost to destination ID: ${receiver_destination_id}`);
    console.log(`Package details - Weight: ${validatedWeight}g, Value: IDR ${validatedItemValue}, COD: ${cod}`);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/pengiriman-lokal/cek-ongkir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        receiver_destination_id,
        weight: validatedWeight,
        item_value: validatedItemValue,
        cod
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}`, errorText);
      throw new Error(`Failed to calculate shipping costs (${response.status})`);
    }

    const data = await response.json();
    console.log('Shipping cost calculation results:', data);
    
    // Return the complete response for handling in the component
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
    
    throw error;
  }
};

/**
 * Format the shipping cost results for display
 * @param {Object} shippingData - Shipping cost calculation results
 * @returns {Array} Formatted array of shipping options grouped by courier
 */
export const formatShippingOptions = (shippingData) => {
  if (!shippingData || !shippingData.results || !Array.isArray(shippingData.results)) {
    return [];
  }
  
  // Map the results to a format suitable for the selection dropdown
  return shippingData.results.flatMap(courier => {
    // Each courier can have multiple service options
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
};
