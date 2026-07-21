import { API_BASE_URL } from "./apiConfig";

export async function createTransaction(orderData) {
  if (orderData.discount) orderData.discount = Math.round(orderData.discount);
  if (orderData.total) orderData.total = Math.round(orderData.total);

  const res = await fetch(`${API_BASE_URL}/api/v1/transaksi/enhanced`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create transaction (${res.status}): ${text}`);
  }

  return res.json();
}

export async function getOrderStatus(orderId) {
  const res = await fetch(`${API_BASE_URL}/api/v1/transaksi/${orderId}/status`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to get order status (${res.status})`);
  return res.json();
}

export async function getOrderData(orderId) {
  const res = await fetch(`${API_BASE_URL}/api/v1/transaksi/order/${orderId}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to get order (${res.status})`);
  return res.json();
}

export function handleMidtransPayment(snapToken, redirectUrl, onSuccessCallback) {
  if (window.snap?.pay) {
    try {
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          if (window.snapPopup && !window.snapPopup.closed) window.snapPopup.close();
          if (onSuccessCallback) onSuccessCallback(result);
        },
        onPending: () => alert("Pembayaran pending, silakan selesaikan pembayaran Anda."),
        onError: () => {
          if (window.snapPopup && !window.snapPopup.closed) window.snapPopup.close();
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: () => { /* user closed */ },
      });
      return;
    } catch (err) {
      console.error("Midtrans popup failed:", err);
    }
  }

  if (redirectUrl) {
    window.location.href = redirectUrl;
  } else {
    alert("Terjadi kesalahan dalam memproses pembayaran. Silakan coba lagi.");
  }
}

export async function createUnifiedOrder(orderData) {
  return createTransaction(orderData);
}

export function handleMidtransPaymentEnhanced(snapToken, redirectUrl, onSuccessCallback) {
  return handleMidtransPayment(snapToken, redirectUrl, onSuccessCallback);
}
