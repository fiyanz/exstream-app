// paymentService.js - Dedicated payment handling

// Direct WhatsApp redirect function
export const redirectToWhatsApp = (orderId, statusCode, transactionStatus) => {
  try {
    const waRedirectUrl = `/api/v1/transaksi/payment_success_wa?order_id=${orderId}&status_code=${
      statusCode || "200"
    }&transaction_status=${transactionStatus || "settlement"}`;
    window.location.replace(waRedirectUrl); // Use replace to prevent back button
  } catch (error) {
    console.error("Error redirecting to WhatsApp:", error);
    // Fallback to basic WhatsApp redirect
    window.location.href = "/api/v1/transaksi/payment_success_wa";
  }
};

// Enhanced Midtrans payment handler
export const handleMidtransPayment = (token, orderId) => {
  if (!token) {
    console.error("No token provided for payment");
    return;
  }

  // Save order info
  try {
    sessionStorage.setItem("lastOrderId", orderId);
    sessionStorage.setItem("waPostPayment", "1");
  } catch (e) {
    console.warn("Failed to save payment info:", e);
  }

  // Configure Snap
  window.snap.pay(token, {
    onSuccess: (result) => {
      // Immediate redirect to WhatsApp on success
      redirectToWhatsApp(
        orderId,
        result.status_code,
        result.transaction_status
      );
    },
    onPending: (result) => {
      console.log("Payment pending:", result);
    },
    onError: (result) => {
      console.error("Payment error:", result);
    },
    onClose: () => {
      // Clean up if needed
      try {
        sessionStorage.removeItem("waPostPayment");
      } catch (e) {
        console.warn("Failed to clean up session:", e);
      }
    },
  });
};

// Check payment status from URL
export const checkPaymentStatusFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    const statusCode = params.get("status_code");
    const transactionStatus = params.get("transaction_status");

    // If we have successful payment parameters
    if (
      orderId &&
      (statusCode === "200" || transactionStatus === "settlement")
    ) {
      redirectToWhatsApp(orderId, statusCode, transactionStatus);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking payment status:", error);
    return false;
  }
};

// Initialize - check URL for payment success
if (typeof window !== "undefined") {
  // Check if we're on a payment return page
  if (window.location.href.includes("payment_success_wa")) {
    checkPaymentStatusFromUrl();
  }
}
