import { API_BASE_URL } from "./apiConfig";

// Helper function to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`
  };
};

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard-stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error(`Gagal mengambil statistik: ${res.status}`);
  }
  return res.json();
}

export async function getOrders(skip = 0, limit = 50, search = "", statusFilter = "all") {
  const query = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (search) query.append("search", search);
  if (statusFilter) query.append("status_filter", statusFilter);

  const res = await fetch(`${API_BASE_URL}/api/v1/admin/orders?${query.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error(`Gagal mengambil pesanan: ${res.status}`);
  }
  return res.json();
}

export async function updateOrderStatus(orderId, status, resi = null) {
  const payload = { status };
  if (resi) payload.resi = resi;

  const res = await fetch(`${API_BASE_URL}/api/v1/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error(`Gagal mengubah status: ${res.status}`);
  }
  return res.json();
}
