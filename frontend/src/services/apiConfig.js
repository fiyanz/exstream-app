const RAW_BASE = import.meta.env.PROD
  ? "https://service.extremestore.my.id"
  : "http://localhost:8000";

export const API_BASE_URL = RAW_BASE;

export const API = {
  BASE: RAW_BASE,
  AUTH: `${RAW_BASE}/api/v1/auth`,
  ORDERS: `${RAW_BASE}/api/v1/orders`,
  TRANSAKSI: `${RAW_BASE}/api/v1/transaksi`,
  STORE_ORDER: `${RAW_BASE}/api/v1/store_order`,
  DOMESTIC: `${RAW_BASE}/api/v1/domestic`,
  WILAYAH: `${RAW_BASE}/api/v1/wilayah`,
};
