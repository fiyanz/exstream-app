/**
 * dataWilayah.js
 * 
 * This module provides functions to fetch geographical data (provinces, cities, districts, villages)
 * from the backend API.
 */

// Determines the appropriate API base URL based on the current environment
const getApiBaseUrl = () => {
  // URL API endpoint options
  const productionApiUrl = 'https://service.jashujanextrime.my.id';
  const localApiUrl = 'http://localhost:8000';
  const testApiUrl = 'http://localhost:8000';
  
  // Check if running locally at localhost
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return localApiUrl;
  }
  
  // Port forwarding through SSH (typically using different port)
  // Try to detect backend port from current URL
  const currentPort = window.location.port;
  if (currentPort && currentPort !== '80' && currentPort !== '443') {
    // If already using non-standard port, there may be active port forwarding
    // Try to access backend on the same port
    return window.location.origin;
  }
  
  // Default fallback to production API
  return productionApiUrl;
};

// API base URL to be used for all requests
export const API_BASE_URL = getApiBaseUrl();

/**
 * Fetches provinces from the API
 * @returns {Promise<Array>} Array of province objects with id and name
 */
export const fetchProvinces = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/wilayah/provinsi`, {
      // Add headers to help handle CORS
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map(province => ({
      id: province.id,
      name: province.name
    }));
  } catch (error) {

    throw error; // Rethrow to handle in the component
  }
};

/**
 * Fetches cities based on province ID
 * @param {string} provinsiId - The province ID to fetch cities for
 * @returns {Promise<Array>} Array of city objects with id and name
 */
export const fetchCities = async (provinsiId) => {
  if (!provinsiId) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/wilayah/kota?provinsi_id=${provinsiId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map(city => ({
      id: city.id,
      name: city.name
    }));
  } catch (error) {

    throw error;
  }
};

/**
 * Fetches districts (kecamatan) based on city ID
 * @param {string} kotaId - The city ID to fetch districts for
 * @returns {Promise<Array>} Array of district objects with id and name
 */
export const fetchSubdistricts = async (kotaId) => {
  if (!kotaId) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/wilayah/kecamatan?kota_id=${kotaId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map(subdistrict => ({
      id: subdistrict.id,
      name: subdistrict.name
    }));
  } catch (error) {

    throw error;
  }
};

/**
 * Fetches villages (desa) based on district ID
 * @param {string} kecamatanId - The district ID to fetch villages for
 * @returns {Promise<Array>} Array of village objects with id and name
 */
export const fetchVillages = async (kecamatanId) => {
  if (!kecamatanId) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/wilayah/desa?kecamatan_id=${kecamatanId}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map(village => ({
      id: village.id,
      name: village.name
    }));
  } catch (error) {

    throw error;
  }
};


