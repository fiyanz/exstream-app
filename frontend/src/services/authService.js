import axios from "axios";
import { API } from "./apiConfig";

const apiClient = axios.create({
  baseURL: API.AUTH,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  },
);

export const login = async (username, password) => {
  const { data } = await apiClient.post("/login", { username, password });
  if (data.access_token) {
    localStorage.setItem("admin_token", data.access_token);
    localStorage.setItem("admin_user", JSON.stringify(data.admin));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  window.location.href = "/admin/login";
};

export const getToken = () => localStorage.getItem("admin_token");

export const isAuthenticated = () => !!getToken();

export const getAdminProfile = async () => {
  const { data } = await apiClient.get("/me");
  return data;
};

export const refreshToken = async () => {
  const { data } = await apiClient.post("/refresh");
  if (data.access_token) {
    localStorage.setItem("admin_token", data.access_token);
    localStorage.setItem("admin_user", JSON.stringify(data.admin));
  }
  return data;
};

export const getCurrentAdmin = () => {
  const raw = localStorage.getItem("admin_user");
  return raw ? JSON.parse(raw) : null;
};

export default apiClient;
