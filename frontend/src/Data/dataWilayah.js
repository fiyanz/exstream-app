/**
 * dataWilayah.js
 * 
 * This module provides functions to fetch geographical data (provinces, cities, districts, villages)
 * from the backend API.
 */

// Determines the appropriate API base URL based on the current environment
const getApiBaseUrl = () => {
  // URL API endpoint options
  const productionApiUrl = 'http://service.jashujanextrime.my.id';
  const localApiUrl = 'http://localhost:8000';
  const testApiUrl = 'http://localhost:8000';
  
  // Check if running locally at localhost
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('Detected localhost, using local API URL');
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
  console.log('No specific match found, defaulting to production API URL');
  return productionApiUrl;
};

// API base URL to be used for all requests
export const API_BASE_URL = getApiBaseUrl();

// Log for debugging purposes
console.log('Current hostname:', window.location.hostname);
console.log('Current origin:', window.location.origin);
console.log('API Base URL being used:', API_BASE_URL);

/**
 * Fetches provinces from the API
 * @returns {Promise<Array>} Array of province objects with id and name
 */
export const fetchProvinces = async () => {
  try {
    console.log(`Fetching provinces from: ${API_BASE_URL}/api/v1/wilayah/provinsi`);
    
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
    console.log('Provinces data received:', data.length, 'provinces');
    
    return data.map(province => ({
      id: province.id,
      name: province.name
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      console.error('Network error - Possible CORS issue or server not accessible');
      console.error('Current hostname:', window.location.hostname);
      console.error('API Base URL being used:', API_BASE_URL);
      
      console.error('Network error - Cannot connect to API.');
    } else {
      console.error('API error:', error.message);
    }
    
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
    console.log(`Fetching cities for province ID: ${provinsiId} from: ${API_BASE_URL}/api/v1/wilayah/kota?provinsi_id=${provinsiId}`);
    
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
    console.log('Cities data received:', data.length, 'cities for province ID', provinsiId);
    
    return data.map(city => ({
      id: city.id,
      name: city.name
    }));
  } catch (error) {
    console.error('Error fetching cities:', error);
    
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      console.error('Network error - Possible CORS issue or server not accessible');
      console.error('Current hostname:', window.location.hostname);
      console.error('API Base URL being used:', API_BASE_URL);
      console.error('Province ID being used:', provinsiId);
    }
    
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
    console.log(`Fetching subdistricts for city ID: ${kotaId} from: ${API_BASE_URL}/api/v1/wilayah/kecamatan?kota_id=${kotaId}`);
    
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
    console.log('Subdistricts data received:', data.length, 'subdistricts for city ID', kotaId);
    
    return data.map(subdistrict => ({
      id: subdistrict.id,
      name: subdistrict.name
    }));
  } catch (error) {
    console.error('Error fetching subdistricts:', error);
    
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      console.error('Network error - Possible CORS issue or server not accessible');
      console.error('Current hostname:', window.location.hostname);
      console.error('API Base URL being used:', API_BASE_URL);
      console.error('City ID being used:', kotaId);
    }
    
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
    console.log(`Fetching villages for subdistrict ID: ${kecamatanId} from: ${API_BASE_URL}/api/v1/wilayah/desa?kecamatan_id=${kecamatanId}`);
    
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
    console.log('Villages data received:', data.length, 'villages for subdistrict ID', kecamatanId);
    
    return data.map(village => ({
      id: village.id,
      name: village.name
    }));
  } catch (error) {
    console.error('Error fetching villages:', error);
    
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      console.error('Network error - Possible CORS issue or server not accessible');
      console.error('Current hostname:', window.location.hostname);
      console.error('API Base URL being used:', API_BASE_URL);
      console.error('Subdistrict ID being used:', kecamatanId);
    }
    
    throw error;
  }
};


