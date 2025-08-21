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

    // Make sure weight is a number and at least 1 gram
    const validatedWeight = Math.max(1, Number(weight) || 1000);
    
    // Make sure item_value is a number and non-negative
    const validatedItemValue = Math.max(0, Number(item_value) || 0);
    
    console.log(`Calculating shipping cost to destination ID: ${receiver_destination_id}`);
    console.log(`Package details - Weight: ${validatedWeight}g, Value: IDR ${validatedItemValue}, COD: ${cod ? 'yes' : 'no'}`);
    
    // Menggunakan endpoint Komerce API yang benar
    // (melalui backend proxy untuk keamanan API key)
    const response = await fetch(`${API_BASE_URL}/api/v1/cost_ongkir/hitung`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        receiver_destination_id,
        weight: validatedWeight,
        item_value: validatedItemValue,
        cod: Boolean(cod)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! Status: ${response.status}`, errorText);
      throw new Error(`Failed to calculate shipping costs (${response.status})`);
    }

    const data = await response.json();
    console.log('Shipping cost calculation results:', data);
    
    if (!data.success) {
      console.error('API returned error:', data.message || 'Unknown error');
      throw new Error(data.message || 'Gagal menghitung ongkos kirim');
    }
    
    // Check if data is empty
    if (!data.data || (Array.isArray(data.data) && data.data.length === 0)) {
      console.warn('API returned empty shipping data');
      throw new Error('Tidak ada opsi pengiriman tersedia untuk tujuan ini');
    }
    
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
  // Handle empty or invalid data
  if (!shippingData || !shippingData.data) {
    return [];
  }
  
  // Komerce API mungkin memberikan format yang berbeda dari API lokal sebelumnya
  // Cek dahulu format datanya
  const data = shippingData.data;
  
  // Jika data adalah array langsung
  if (Array.isArray(data)) {
    return data.map(courier => {
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
  
  // Jika data dikelompokkan per kurir (format RajaOngkir)
  if (data.results && Array.isArray(data.results)) {
    return data.results.flatMap(courier => {
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
  
  // Format Komerce yang seperti objek dengan couriers
  if (data.couriers && Array.isArray(data.couriers)) {
    return data.couriers.map(courier => {
      return {
        id: `${courier.courier_code}-${courier.courier_service}`,
        name: `${courier.courier_name} - ${courier.courier_service}`,
        code: courier.courier_code,
        service: courier.courier_service,
        description: courier.description || courier.courier_service,
        cost: courier.price || 0,
        etd: courier.estimated_day || '1-3 hari',
        label: `${courier.courier_name} - ${courier.courier_service} - Rp ${(courier.price || 0).toLocaleString('id-ID')} (${courier.estimated_day || '1-3 hari'})`
      };
    });
  }
  
  // Jika tidak sesuai format yang dikenal, kembalikan array kosong
  console.error('Unknown shipping data format:', data);
  return [];
};
