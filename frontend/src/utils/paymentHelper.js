// Fungsi untuk menangani berbagai kemungkinan status dari Midtrans
export const handleMidtransStatus = (status, orderId) => {
  // Status yang mungkin dari Midtrans:
  // settlement: pembayaran berhasil
  // pending: menunggu pembayaran
  // deny: pembayaran ditolak
  // cancel: pembayaran dibatalkan
  // expire: pembayaran expired
  // failure: pembayaran gagal

  switch (status?.toLowerCase()) {
    case "settlement":
    case "capture":
    case "success":
      return {
        status: "success",
        message: "Pembayaran berhasil!",
        redirect: `/api/v1/transaksi/payment_success_wa?order_id=${orderId}`,
      };

    case "pending":
      return {
        status: "pending",
        message: "Menunggu pembayaran",
        redirect: null,
      };

    case "deny":
    case "denied":
      return {
        status: "failed",
        message: "Pembayaran ditolak",
        redirect: `/transaksi?order_id=${orderId}&status=failed`,
      };

    case "cancel":
    case "cancelled":
      return {
        status: "failed",
        message: "Pembayaran dibatalkan",
        redirect: `/transaksi?order_id=${orderId}&status=cancelled`,
      };

    case "expire":
    case "expired":
      return {
        status: "failed",
        message: "Pembayaran kedaluwarsa",
        redirect: `/transaksi?order_id=${orderId}&status=expired`,
      };

    case "failure":
    case "failed":
      return {
        status: "failed",
        message: "Pembayaran gagal",
        redirect: `/transaksi?order_id=${orderId}&status=failed`,
      };

    default:
      return {
        status: "unknown",
        message: "Status pembayaran tidak diketahui",
        redirect: `/transaksi?order_id=${orderId}&status=unknown`,
      };
  }
};

// Fungsi untuk mengecek apakah URL saat ini adalah redirect dari Midtrans
export const isMidtransRedirect = () => {
  return (
    window.location.href.includes("app.sandbox.midtrans.com") ||
    window.location.href.includes("app.midtrans.com")
  );
};

// Fungsi untuk mendapatkan order ID dari URL Midtrans
export const getOrderIdFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("order_id") || sessionStorage.getItem("lastOrderId");
  } catch (e) {
    console.error("Error getting order ID:", e);
    return null;
  }
};

// Fungsi untuk mendapatkan status dari URL Midtrans
export const getMidtransStatusFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      transaction_status: urlParams.get("transaction_status"),
      status_code: urlParams.get("status_code"),
      status_message: urlParams.get("status_message"),
    };
  } catch (e) {
    console.error("Error getting status:", e);
    return {};
  }
};
