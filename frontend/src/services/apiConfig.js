/**
 * API configuration for the application
 */

// Base URL for API calls
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://service.extremestore.my.id' 
  : 'http://localhost:8000';

// API endpoints
export const ENDPOINTS = {
  // Shipping endpoints
  DOMESTIC_COST: '/api/v1/domestic/domestic-cost',
  
  // Store order endpoints
  STORE_ORDER: '/api/v1/store_order/store_order',
  
  // Transaction endpoints
  CREATE_TRANSACTION: '/api/v1/transaksi/enhanced',
  GET_ORDER_STATUS: '/api/v1/transaksi/:orderId/status',
  GET_ORDER_DATA: '/api/v1/transaksi/order/:orderId',
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
