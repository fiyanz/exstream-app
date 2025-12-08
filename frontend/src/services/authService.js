import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Admin Authentication Service
 */

export const login = async (username, password) => {
  const response = await apiClient.post('/auth/login', { username, password });
  
  if (response.data.access_token) {
    localStorage.setItem('admin_token', response.data.access_token);
    localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
  }
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  window.location.href = '/admin/login';
};

export const getToken = () => {
  return localStorage.getItem('admin_token');
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const getAdminProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const refreshToken = async () => {
  const response = await apiClient.post('/auth/refresh');
  
  if (response.data.access_token) {
    localStorage.setItem('admin_token', response.data.access_token);
    localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
  }
  
  return response.data;
};

export const getCurrentAdmin = () => {
  const adminData = localStorage.getItem('admin_user');
  return adminData ? JSON.parse(adminData) : null;
};

export default apiClient;
