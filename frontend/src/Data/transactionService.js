/**
 * transactionService.js
 *
 * This module provides functions to handle transaction creation
 * with support for both COD and non-COD (Midtrans) payments,
 * as well as integration with Komerce Store Order API.
 */

<<<<<<< HEAD
import { API_BASE_URL } from "./dataWilayah";
=======
import { 
  API_BASE_URL, 
  fetchProvinces, 
  fetchCities, 
  fetchSubdistricts, 
  fetchVillages 
} from './dataWilayah';
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e

// Admin WhatsApp number (will be used as primary destination)
const ADMIN_WHATSAPP = "085702257423";

// Normalize Indonesian phone number to start with 62
const normalizePhoneTo62 = (phone) => {
  if (!phone || typeof phone !== "string") return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.substring(1)}`;
  return `62${digits}`;
};

// Build and store WhatsApp redirect info for post-payment redirect
const prepareWaRedirectInfo = (orderData) => {
  try {
    // Prioritaskan nomor admin sebagai tujuan utama
    const candidatePhone =
      ADMIN_WHATSAPP ||
      orderData.storeWhatsapp ||
      orderData.whatsappPhone ||
      orderData.receiver_phone ||
      (orderData.shipper_info && orderData.shipper_info.phone) ||
      orderData.shipper_phone;

    if (!candidatePhone) return;

    const phone62 = normalizePhoneTo62(String(candidatePhone));
    const customerName =
      orderData.fullName ||
      orderData.customer_name ||
      orderData.receiver_name ||
      "-";
    const receiverPhone =
      orderData.telephone ||
      orderData.receiver_phone ||
      orderData.customer_phone ||
      "-";
    const address = orderData.address || orderData.receiver_address || "-";
    const payment = orderData.paymentMethod || orderData.payment_method || "-";
    const shipping = orderData.shippingMethod || orderData.shipping || "-";
    const shippingType = orderData.shipping_type || "-";
    const shippingCost = orderData.shippingCost || orderData.shipping_cost || 0;
    // Util: cek string numerik (ID mentah)
    const isNumericString = (val) =>
      typeof val === "string" && /^\d+$/.test(val.trim());
    // Util: ambil nama dari daftar key, abaikan angka
    const getName = (obj, keys) => {
      for (const k of keys) {
        const v = obj[k];
        if (typeof v === "string" && v.trim() && !isNumericString(v))
          return v.trim();
      }
      return "";
    };
    // Ambil nama daerah, hindari ID angka
    const province = getName(orderData, [
      "province_name",
      "receiver_province_name",
      "provinsi_name",
      "province",
      "receiver_province",
      "provinsi",
    ]);
    const city = getName(orderData, [
      "city_name",
      "receiver_city_name",
      "kota_name",
      "city",
      "receiver_city",
      "kota",
      "kabupaten",
      "kabupaten_name",
    ]);
    const subdistrict = getName(orderData, [
      "subdistrict_name",
      "receiver_subdistrict_name",
      "kecamatan_name",
      "kecamatan",
      "district_name",
      "receiver_district_name",
    ]);
    const village = getName(orderData, [
      "village_name",
      "receiver_village_name",
      "desa_name",
      "desa",
      "kelurahan",
      "kelurahan_name",
    ]);

    // Jika masih berupa ID, coba ambil dari data yang sudah di-resolve
    const getLocationName = (orderData, type) => {
      const nameKeys = {
        province: ["province_name", "receiver_province_name", "provinsi_name"],
        city: [
          "city_name",
          "receiver_city_name",
          "kota_name",
          "kabupaten_name",
        ],
        subdistrict: [
          "subdistrict_name",
          "receiver_subdistrict_name",
          "kecamatan_name",
        ],
        village: [
          "village_name",
          "receiver_village_name",
          "desa_name",
          "kelurahan_name",
        ],
      };

      // Coba ambil dari resolved location data
      const resolvedData =
        orderData.resolved_locations || orderData.location_names || {};
      if (resolvedData[`${type}_name`]) {
        return resolvedData[`${type}_name`];
      }

      // Fallback ke method getName yang sudah ada
      return getName(orderData, nameKeys[type]);
    };

    // Gunakan fungsi baru untuk mendapatkan nama lokasi
    const provinceName = getLocationName(orderData, "province");
    const cityName = getLocationName(orderData, "city");
    const subdistrictName = getLocationName(orderData, "subdistrict");
    const villageName = getLocationName(orderData, "village");
    const total =
      typeof orderData.total === "number"
        ? orderData.total
        : orderData.grand_total || orderData.totalAmount;
    const discount = orderData.discount || orderData.discount_amount || 0;
    const serviceFee = orderData.service_fee || 0;
    const additionalCost = orderData.additional_cost || 0;
    const insuranceValue = orderData.insurance_value || 0;
    const codValue = orderData.cod_value || 0;
    const orderId =
      orderData.order_id || orderData.orderId || orderData.invoice || "";

    // Ambil produk dari items (checkout) atau order_details (store order)
    const items = Array.isArray(orderData.items)
      ? orderData.items
      : Array.isArray(orderData.order_details)
      ? orderData.order_details
      : [];
    const itemsText = items
      .map((it, idx) => {
        const name = it.name || it.product_name || `Item ${idx + 1}`;
        const variant =
          it.variant ||
          it.product_variant_name ||
          [it.color, it.size].filter(Boolean).join(" ");
        const sku = it.sku || it.product_sku || "";
        const qty = parseInt(it.quantity || it.qty || 1);
        const price = parseInt(it.price || it.product_price || 0);
        const subtotal = parseInt(it.subtotal || price * qty || 0);
        const variantText = variant ? ` | Varian: ${variant}` : "";
        const skuText = sku ? ` | SKU: ${sku}` : "";
        return `- ${name}${variantText}${skuText} | Qty: ${qty} | @ Rp ${Number(
          price
        ).toLocaleString("id-ID")} | Subtotal: Rp ${Number(
          subtotal
        ).toLocaleString("id-ID")}`;
      })
      .join("\n");

    const message =
      `Halo Admin, pesanan sudah dibuat/success. Berikut detail lengkap:\n\n` +
      `Nama: ${customerName}\n` +
      `No HP: ${receiverPhone}\n` +
      `Alamat: ${address}` +
      `${villageName ? `, ${villageName}` : ""}` +
      `${subdistrictName ? `, Kec. ${subdistrictName}` : ""}` +
      `${cityName ? `, ${cityName}` : ""}` +
      `${provinceName ? `, ${provinceName}` : ""}\n` +
      `Metode Bayar: ${payment}\n` +
      `Pengiriman: ${shipping}${
        shippingType && shippingType !== "-" ? ` - ${shippingType}` : ""
      }\n` +
      (orderId ? `Order/Invoice: ${orderId}\n` : "") +
      (itemsText ? `\nProduk (${items.length} item):\n${itemsText}\n` : "") +
      (discount
        ? `\nDiskon: Rp ${Number(discount).toLocaleString("id-ID")}`
        : "") +
      (shippingCost
        ? `\nOngkir: Rp ${Number(shippingCost).toLocaleString("id-ID")}`
        : "") +
      (serviceFee
        ? `\nBiaya Layanan: Rp ${Number(serviceFee).toLocaleString("id-ID")}`
        : "") +
      (additionalCost
        ? `\nBiaya Tambahan: Rp ${Number(additionalCost).toLocaleString(
            "id-ID"
          )}`
        : "") +
      (insuranceValue
        ? `\nAsuransi: Rp ${Number(insuranceValue).toLocaleString("id-ID")}`
        : "") +
      (codValue
        ? `\nNilai COD: Rp ${Number(codValue).toLocaleString("id-ID")}`
        : "") +
      (total
        ? `\nTotal Bayar: Rp ${Number(total).toLocaleString("id-ID")}`
        : "");

    // Gunakan wa.me sebagai primary (resmi/lebih stabil), whatsapp.me sebagai secondary
    const waPrimaryUrl = `https://wa.me/${phone62}?text=${encodeURIComponent(
      message
    )}`;
    const waSecondaryUrl = `https://whatsapp.me/${phone62}?text=${encodeURIComponent(
      message
    )}`;
    const waTertiaryUrl = `https://api.whatsapp.com/send?phone=${phone62}&text=${encodeURIComponent(
      message
    )}`;

    if (typeof window !== "undefined") {
      window.__waRedirectInfo = {
        phone62,
        message,
        waPrimaryUrl,
        waSecondaryUrl,
        waTertiaryUrl,
      };
    }
  } catch {}
};

// Trigger WA redirect if prepared
const triggerWaRedirectIfPrepared = () => {
  const info = typeof window !== "undefined" ? window.__waRedirectInfo : null;
  if (!info) {
    console.warn("[WA] Redirect info not prepared");
    return false;
  }
  // Prefer same-tab navigation to avoid popup blockers; do it asynchronously
  try {
    const targetUrl =
      info.waPrimaryUrl || info.waSecondaryUrl || info.waTertiaryUrl;
    setTimeout(() => {
      try {
        window.location.href = targetUrl;
      } catch {
        try {
          window.location.href =
            info.waSecondaryUrl || info.waTertiaryUrl || targetUrl;
        } catch {
          window.location.href = info.waTertiaryUrl || targetUrl;
        }
      }
    }, 50);
    return true;
  } catch {
    return false;
  }
};

/**
 * Creates a transaction with enhanced order details
 * @param {Object} orderData - Complete order data
 * @returns {Promise<Object>} Transaction response with payment details
 */
export const createTransaction = async (orderData) => {
  try {
    // pastikan discount & total integer
    if (orderData.discount) {
      orderData.discount = Math.round(orderData.discount);
    }
    if (orderData.total) {
      orderData.total = Math.round(orderData.total);
    }

    console.log("Payload yang dikirim:", JSON.stringify(orderData, null, 2));
    // Prepare WhatsApp redirect info; actual redirect will occur after payment success
    if (typeof window !== "undefined") {
      prepareWaRedirectInfo(orderData);
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/transaksi/enhanced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error detail dari server:", errorText);
      throw new Error(
        `Failed to create transaction (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Create transaction error:", error.message);
    throw error;
  }
};

/**
 * Gets order status by order ID
 * @param {string} orderId - The order ID to check
 * @returns {Promise<Object>} Order status information
 */
export const getOrderStatus = async (orderId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/transaksi/${orderId}/status`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get order status (${response.status})`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Handles Midtrans payment using the token and redirect_url from backend
 * Tries popup first, falls back to redirect if CSP blocks it
 * @param {string} snapToken - Midtrans snap token from backend
 * @param {string} redirectUrl - Midtrans redirect URL from backend
 */
export const handleMidtransPayment = (snapToken, redirectUrl) => {
  // Method 1: Try popup mode first (if Snap.js is available)
  if (window.snap && typeof window.snap.pay === "function") {
    try {
      // Create a more robust popup configuration
      const popupConfig = {
        onSuccess: function (result) {
          // Close popup and show success message
          if (window.snapPopup && !window.snapPopup.closed) {
            window.snapPopup.close();
          }
          // Auto redirect to WhatsApp after successful payment
          triggerWaRedirectIfPrepared();
          alert("Pembayaran berhasil! Terima kasih telah berbelanja.");
          // Optionally redirect to success page
          window.location.href = "/success";
        },
        onPending: function (result) {
          alert("Pembayaran pending, silakan selesaikan pembayaran Anda.");
        },
        onError: function (result) {
          // Close popup if open
          if (window.snapPopup && !window.snapPopup.closed) {
            window.snapPopup.close();
          }
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          // Don't show alert here as user might have intentionally closed it
        },
      };

      // Try to open popup
      window.snap.pay(snapToken, popupConfig);
      return;
    } catch (err) {
      // Trying alternative methods
    }
  }

  // Method 2: Try opening in new window/tab
  if (redirectUrl) {
    try {
      const popup = window.open(
        redirectUrl,
        "midtrans_payment",
        "width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no"
      );

      if (popup) {
        window.snapPopup = popup;

        // Check if popup was blocked
        if (popup.closed || typeof popup.closed === "undefined") {
          window.location.href = redirectUrl;
        } else {
          // Monitor popup
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              // You could check payment status here
            }
          }, 1000);
        }
      } else {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      window.location.href = redirectUrl;
    }
  } else {
    alert("Terjadi kesalahan dalam memproses pembayaran. Silakan coba lagi.");
  }
};

/**
 * Alternative method: Embed Snap in a container (for embedded mode)
 * @param {string} snapToken - Midtrans snap token
 * @param {string} containerId - ID of the container element
 */
export const embedMidtransSnap = (
  snapToken,
  containerId = "snap-container"
) => {
  if (window.snap && typeof window.snap.embed === "function") {
    try {
      // Show the container
      const container = document.getElementById(containerId);
      const embedContent = document.getElementById("snap-embed-content");
      if (container) {
        container.style.display = "block";
      }

      window.snap.embed(snapToken, {
        embedId: containerId,
        onSuccess: function (result) {
          // Hide container
          if (container) {
            container.style.display = "none";
          }
          alert("Pembayaran berhasil! Terima kasih telah berbelanja.");
          // Optionally redirect to success page
          window.location.href = "/success";
        },
        onPending: function (result) {
          alert("Pembayaran pending, silakan selesaikan pembayaran Anda.");
        },
        onError: function (result) {
          // Hide container
          if (container) {
            container.style.display = "none";
          }
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          // Hide container
          if (container) {
            container.style.display = "none";
          }
        },
      });
    } catch (err) {
      alert("Terjadi kesalahan dalam menampilkan halaman pembayaran.");
    }
  } else {
    alert("Halaman pembayaran tidak dapat ditampilkan.");
  }
};

/**
 * Enhanced payment handler with multiple fallback methods
 * @param {string} snapToken - Midtrans snap token
 * @param {string} redirectUrl - Midtrans redirect URL
 */
export const handleMidtransPaymentEnhanced = (snapToken, redirectUrl) => {
  // Method 1: Try direct redirect first (most reliable)
  if (redirectUrl) {
    try {
      // Try to open in new window/tab
      const popup = window.open(
        redirectUrl,
        "midtrans_payment",
        "width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no"
      );

      if (popup && !popup.closed) {
        // Check if popup was blocked
        setTimeout(() => {
          if (popup.closed) {
            window.location.href = redirectUrl;
          }
        }, 1000);

        return;
      } else {
        window.location.href = redirectUrl;
        return;
      }
    } catch (err) {
      window.location.href = redirectUrl;
      return;
    }
  }

  // Method 2: Try Snap.js if available
  if (window.snap && typeof window.snap.pay === "function" && snapToken) {
    try {
      window.snap.pay(snapToken, {
        onSuccess: function (result) {
          // Auto redirect to WhatsApp after successful payment
          triggerWaRedirectIfPrepared();
          alert("Pembayaran berhasil! Terima kasih telah berbelanja.");
          window.location.href = "/success";
        },
        onPending: function (result) {
          alert("Pembayaran pending, silakan selesaikan pembayaran Anda.");
        },
        onError: function (result) {
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          // Payment popup closed
        },
      });
      return;
    } catch (err) {
      // Snap popup failed
    }
  }

  // Method 2: Try embedded mode with token
  if (window.snap && typeof window.snap.embed === "function" && snapToken) {
    try {
      embedMidtransSnap(snapToken);
      return;
    } catch (err) {
      // Embedded mode failed
    }
  }

  // Method 3: Try Snap embed with redirect URL (extract token from URL)
  if (window.snap && typeof window.snap.embed === "function" && redirectUrl) {
    try {
      // Extract token from redirect URL if possible
      const urlParts = redirectUrl.split("/");
      const extractedToken = urlParts[urlParts.length - 1];

      if (extractedToken && extractedToken.length > 10) {
        embedMidtransSnap(extractedToken);
        return;
      }
    } catch (err) {
      // Snap embed with redirect URL failed
    }
  }

  // Method 4: Try new window popup
  if (redirectUrl) {
    try {
      const popup = window.open(
        redirectUrl,
        "midtrans_payment",
        "width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no"
      );

      if (popup && !popup.closed) {
        return;
      }
    } catch (err) {
      // New window popup failed
    }
  }

  // Method 5: Fallback to redirect
  if (redirectUrl) {
    window.location.href = redirectUrl;
  } else {
    alert("Terjadi kesalahan dalam memproses pembayaran. Silakan coba lagi.");
  }
};

/**
 * Store order data before payment
 * For COD orders, this will be the final order processing step
 * @param {Object} orderData - Order data from frontend
 * @returns {Promise<Object>} Stored order result with complete order details
 */
export const storeOrder = async (orderData) => {
  try {
    // Format data for the API
    const formattedData = formatOrderData(orderData);

    // Special case handling for COD orders
    if (orderData.paymentMethod === "COD") {
      // Process COD order
    }

    // Rest of the implementation
    return {};
  } catch (error) {
    throw error;
  }
};

/**
 * Get order data by order ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data
 */
export const getOrderData = async (orderId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/transaksi/order/${orderId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get order (${response.status})`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a store order using Komerce API
 * This function formats checkout data and sends it to the order API
 * @param {Object} checkoutData - Raw checkout data from the frontend
 * @returns {Promise<Object>} Store order response
 */
export const createStoreOrder = async (checkoutData) => {
  try {
<<<<<<< HEAD
    // Validasi data order sebelum mengirim ke API
=======
    if (!checkoutData) {
      throw new Error('Data checkout tidak tersedia');
    }
    
    // Format the checkout data into the order format with proper location names
    const orderData = await formatStoreOrderData(checkoutData);
    
    // Validate the formatted order data
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
    if (!orderData) {
      throw new Error("Data order tidak tersedia");
    }
<<<<<<< HEAD

=======
    
    // Enhanced logging with visual separation for easier debugging
    console.log('\n\n🔍 ========== STORE ORDER DEBUGGING INFO ==========');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📦 ORDER DATA (API CALL DISABLED):');
    console.log(JSON.stringify(orderData, null, 2));
    
    // Log specific important fields
    if (orderData.receiver_name) console.log('👤 Receiver:', orderData.receiver_name);
    if (orderData.receiver_phone) console.log('📱 Phone:', orderData.receiver_phone);
    if (orderData.payment_method) console.log('💰 Payment Method:', orderData.payment_method);
    if (orderData.shipping) console.log('🚚 Courier:', orderData.shipping);
    console.log('================================================\n\n');
    
    // DISABLED: API call temporarily disabled for debugging
    // Instead, return a mock successful response
    console.warn('⚠️ API CALL DISABLED: Store order API call has been temporarily disabled for debugging');
    
    // Generate a realistic looking order ID
    const mockOrderId = `SIM-${Date.now().toString().slice(-8)}`;
    
    // Return mock successful response
    return {
      success: true,
      message: "Order simulated successfully (API call disabled)",
      order_id: mockOrderId,
      status: "SIMULATION_MODE",
      timestamp: new Date().toISOString(),
      data: orderData
    };
    
    /* DISABLED API CALL - KEEP FOR REFERENCE
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
    // Validasi field yang diperlukan
    const requiredFields = [
      "order_date",
      "receiver_name",
      "receiver_phone",
      "receiver_address",
      "receiver_destination_id",
      "shipping",
      "shipping_type",
      "payment_method",
      "shipping_cost",
      "grand_total",
    ];

    const missingFields = requiredFields.filter((field) => !orderData[field]);

    if (missingFields.length > 0) {
<<<<<<< HEAD
      throw new Error(`Data tidak lengkap: ${missingFields.join(", ")}`);
    } // Kirim request ke API dengan timeout
=======
      throw new Error(`Data tidak lengkap: ${missingFields.join(', ')}`);
    }
    
    // Kirim request ke API dengan timeout
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout

    try {
      // Log the request payload for debugging
<<<<<<< HEAD
      console.log(
        "Creating store order with data:",
        JSON.stringify(orderData, null, 2)
      );
      // kirim wa

      const response = await fetch(
        `${API_BASE_URL}/api/v1/store_order/store_order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(orderData),
          signal: controller.signal,
        }
      );

=======
      console.log('Creating store order with data:', JSON.stringify(orderData, null, 2)); 
      
      const response = await fetch(`${API_BASE_URL}/api/v1/store_order/store_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderData),
        signal: controller.signal
      });
      
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = "";
        try {
          const errorResponse = await response.json();

          // Check for specific error messages about service fee or insurance
          if (
            errorResponse.detail &&
            typeof errorResponse.detail === "string"
          ) {
            // Check for COD not supported by courier error
            if (
              errorResponse.detail.includes("Kurir") &&
              errorResponse.detail.includes("tidak mendukung pembayaran COD")
            ) {
              // Show alert for courier not supporting COD
              alert(errorResponse.detail);
              errorDetail = errorResponse.detail;
            } else if (
              errorResponse.detail.includes("service fee") ||
              errorResponse.detail.includes("insurance")
            ) {
              errorDetail = errorResponse.detail;
            } else {
              errorDetail = `Error from server: ${errorResponse.detail}`;
            }
          } else if (errorResponse.meta && errorResponse.meta.message) {
            // Handle errors that come in the meta.message format
            errorDetail = errorResponse.meta.message;

            // Special handling for date order error
            if (errorDetail.includes("date order can't before today")) {
              console.error(
                "Date error detected! Current date used:",
                orderData.order_date
              );
              errorDetail =
                "Terjadi kesalahan pada tanggal order. Silakan coba lagi.";
            }
          } else {
            errorDetail = JSON.stringify(errorResponse);
          }
        } catch (e) {
          const errorText = await response.text();
          errorDetail = errorText;
        }
        throw new Error(
          `Gagal membuat store order (${response.status}): ${errorDetail}`
        );
      }

      const data = await response.json();
      // Jika pembayaran COD, langsung redirect ke WhatsApp setelah order berhasil dibuat
      try {
        const payMethod = (
          orderData.payment_method ||
          orderData.paymentMethod ||
          ""
        ).toString();
        if (payMethod.toUpperCase().includes("COD")) {
          // Siapkan data WA jika belum
          if (typeof window !== "undefined" && !window.__waRedirectInfo) {
            prepareWaRedirectInfo(orderData);
          }
          triggerWaRedirectIfPrepared();
        }
      } catch {}
      return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        throw new Error("Koneksi timeout, silakan coba lagi");
      }

      throw fetchError;
    }
    */
  } catch (error) {
<<<<<<< HEAD
=======
    console.error("❌ ERROR in createStoreOrder:", error);
    console.error("Error details:", error.message);
    
    // Provide more context about the error for debugging
    if (error.message.includes('tidak tersedia')) {
      console.error("Cause: Missing order data");
    } else if (error.message.includes('tidak lengkap')) {
      console.error("Cause: Incomplete required fields");
    } else if (error.message.includes('COD')) {
      console.error("Cause: COD payment method issue");
    }
    
    // Log the stack trace
    console.error("Stack trace:", error.stack);
    
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
    throw error;
  }
};

/**
 * Format checkout data into Komerce store order format
 * @param {Object} checkoutData - Checkout data from frontend form
 * @returns {Promise<Object>} Formatted store order data with location names from API
 */
export const formatStoreOrderData = async (checkoutData) => {
  // Get the current date in Jakarta/Indonesia timezone (GMT+7) in YYYY-MM-DD HH:MM:SS format
  // This ensures the date is always current according to Indonesia time, regardless of client timezone
  const now = new Date();
  const jakartaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours for GMT+7

  // Format as YYYY-MM-DD HH:MM:SS
  const year = jakartaTime.getUTCFullYear();
  const month = String(jakartaTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jakartaTime.getUTCDate()).padStart(2, "0");
  const hours = String(jakartaTime.getUTCHours()).padStart(2, "0");
  const minutes = String(jakartaTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(jakartaTime.getUTCSeconds()).padStart(2, "0");

  const orderDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // Extract customer and shipping information
  const {
    fullName,
    telephone,
    address,
    city,
    province,
    shippingMethod,
    paymentMethod,
    shippingCost,
    totalAmount,
    destination_id,
    shipper_info,
<<<<<<< HEAD
  } = checkoutData;

  if (!fullName || !telephone || !address || !destination_id) {
    throw new Error("Data penerima tidak lengkap");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Data produk tidak tersedia");
=======
    // Get location IDs
    province_id,
    city_id,
    district_id,
    village_id,
    // Additional fields for location names - these might contain the actual region names
    cityName: existingCityName,
    provinceName: existingProvinceName,
    districtName: existingDistrictName,
    postalCode,
    villageName: existingVillageName
  } = checkoutData;
  
  // Extract items separately as a variable we can modify later
  let items = checkoutData.items;
  
  // If we have IDs but not names, fetch the names from the wilayah API
  let cityName = existingCityName;
  let provinceName = existingProvinceName;
  let districtName = existingDistrictName;
  let villageName = existingVillageName;
  
  // Fetch location names if they're not already provided
  if (province_id || city_id || district_id || village_id) {
    try {
      const locationNames = await fetchLocationNames(
        province_id,
        city_id,
        district_id,
        village_id || destination_id // destination_id might be the village ID
      );
      
      // Use fetched names if they exist and we don't already have names
      if (locationNames.provinceName && !provinceName) {
        provinceName = locationNames.provinceName;
      }
      
      if (locationNames.cityName && !cityName) {
        cityName = locationNames.cityName;
      }
      
      if (locationNames.districtName && !districtName) {
        districtName = locationNames.districtName;
      }
      
      if (locationNames.villageName && !villageName) {
        villageName = locationNames.villageName;
      }
    } catch (error) {
      console.error('Failed to fetch location names:', error);
      // Continue with whatever names we have
    }
  }
  
  // Special handling for testing: if any location ID is present but the corresponding name is missing,
  // try fetching them one more time with direct calls
  if ((province_id && !provinceName) || 
      (city_id && !cityName) || 
      (district_id && !districtName) || 
      (village_id && !villageName)) {
    
    console.log('🔄 Location names missing but IDs present - trying direct fetch...');
    
    try {
      // Direct API calls to populate missing location names
      if (province_id && !provinceName) {
        const provinces = await fetchProvinces();
        const province = provinces.find(p => p.id == province_id || String(p.id) === String(province_id));
        if (province) {
          provinceName = province.name;
          console.log(`✅ Direct fetch - Found province: ${province.name}`);
        }
      }
      
      if (city_id && !cityName) {
        const cities = await fetchCities(province_id);
        const city = cities.find(c => c.id == city_id || String(c.id) === String(city_id));
        if (city) {
          cityName = city.name;
          console.log(`✅ Direct fetch - Found city: ${city.name}`);
        }
      }
      
      if (district_id && !districtName) {
        const districts = await fetchSubdistricts(city_id);
        const district = districts.find(d => d.id == district_id || String(d.id) === String(district_id));
        if (district) {
          districtName = district.name;
          console.log(`✅ Direct fetch - Found district: ${district.name}`);
        }
      }
      
      if (village_id && !villageName) {
        const villages = await fetchVillages(district_id);
        const village = villages.find(v => v.id == village_id || String(v.id) === String(village_id));
        if (village) {
          villageName = village.name;
          console.log(`✅ Direct fetch - Found village: ${village.name}`);
        }
      }
    } catch (error) {
      console.error('Error in direct location fetch:', error);
    }
  }
  
  // Process checkout data
  
  // Validate phone number format
  if (telephone && !/^(\+62|62|0)[0-9]{9,13}$/.test(telephone.replace(/[\s-]/g, ''))) {
    throw new Error('Format nomor telepon tidak valid. Gunakan format: 08XXXXXXXXXX');
  }
  
  // Use items if available or fallback to empty array
  if (!items || !Array.isArray(items)) {
    items = [];
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
  }

  // Map payment method to Komerce format
  const mappedPaymentMethod = paymentMethod.includes("COD")
    ? "COD"
    : "Transfer";

  // Parse shipping method to get courier and service type
  const [courier, serviceType] = parseShippingMethod(shippingMethod);

  // Calculate COD value
<<<<<<< HEAD
  const codValue = mappedPaymentMethod === "COD" ? totalAmount : 0;

  // Format full address
  const fullAddress = `${address}${city ? `, ${city}` : ""}${
    province ? `, ${province}` : ""
  }`;

  // Format order details
  const orderDetails = items.map((item) => {
    if (!item.name || !item.price || !item.quantity) {
      throw new Error(`Data produk tidak lengkap: ${JSON.stringify(item)}`);
    }

    return {
      product_name: item.name,
      product_variant_name:
        item.color && item.size
          ? `${item.color} - ${item.size}`
          : item.variant || item.name,
      product_price: parseInt(item.price),
      product_width:
        item.width || item.product_width || shipper_info?.product_width || 20,
      product_height:
        item.height || item.product_height || shipper_info?.product_height || 5,
      product_weight:
        item.weight ||
        item.product_weight ||
        shipper_info?.product_weight ||
        300,
      product_length:
        item.length ||
        item.product_length ||
        shipper_info?.product_length ||
        30,
      qty: parseInt(item.quantity),
      subtotal: parseInt(item.price * item.quantity),
    };
  });

  // Get shipper info from checkout data or use store info from configuration
  const shipper = shipper_info || checkoutData.shipper || {};

  // Create store order object according to backend schema
  const formattedOrder = {
    order_date: orderDate,
    brand_name:
      shipper.brand_name || checkoutData.brand_name || "Extreme Store",
    shipper_name:
      shipper.name || checkoutData.shipper_name || "Extreme Store Official",
    shipper_phone: shipper.phone || checkoutData.shipper_phone || telephone, // Fallback to customer phone
    shipper_destination_id: parseInt(
      shipper.destination_id ||
        checkoutData.shipper_destination_id ||
        destination_id
    ), // Use origin from config
    shipper_address: shipper.address || checkoutData.shipper_address || address, // Fallback to customer address
    shipper_email:
      shipper.email ||
      checkoutData.shipper_email ||
      checkoutData.email ||
      "store@extreme.com",
=======
  const codValue = mappedPaymentMethod === 'COD' ? totalAmount : 0;
  
  // Ensure we have the correct names for address formation
  const villageString = villageName || "";
  const districtString = districtName || "";
  const cityString = cityName || city || "";
  const provinceString = provinceName || province || "";
  
  // Debug log location data
  console.log('📍 DEBUG LOCATION DATA:');
  console.log('Province ID:', province_id, 'Name:', provinceName || 'MISSING');
  console.log('City ID:', city_id, 'Name:', cityName || 'MISSING');
  console.log('District ID:', district_id, 'Name:', districtName || 'MISSING');
  console.log('Village ID:', village_id, 'Name:', villageName || 'MISSING');
  
  // Double check that we're not using IDs in the address
  if (!villageString && village_id) console.warn('⚠️ Missing village name for ID:', village_id);
  if (!districtString && district_id) console.warn('⚠️ Missing district name for ID:', district_id);
  if (!cityString && city_id) console.warn('⚠️ Missing city name for ID:', city_id);
  if (!provinceString && province_id) console.warn('⚠️ Missing province name for ID:', province_id);
  
  // Only use parts that are actual names, not numeric IDs
  const fullAddress = [
    address,
    // Filter out any parts that look like numeric IDs
    villageString && !/^\d+$/.test(villageString) ? villageString : "",
    districtString && !/^\d+$/.test(districtString) ? districtString : "",
    cityString && !/^\d+$/.test(cityString) ? cityString : "",
    provinceString && !/^\d+$/.test(provinceString) ? provinceString : "",
    postalCode ? `Kode Pos: ${postalCode}` : ""
  ].filter(part => part && part.trim() !== "").join(", ");
  
  // Format order details with minimal error checking
  const orderDetails = [];
  
  // Process each item if available
  if (items && items.length > 0) {
    for (const item of items) {
      if (item) {
        const productName = item.name || item.product_name || item.title || "Product";
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        
        const formattedItem = {
          product_name: productName,
          product_variant_name: (item.color && item.size) ? `${item.color} - ${item.size}` : 
                              item.variant || item.variant_name || productName,
          product_price: parseInt(price),
          product_width: parseInt(item.width || item.product_width || (shipper_info?.product_width || 20)),
          product_height: parseInt(item.height || item.product_height || (shipper_info?.product_height || 5)),
          product_weight: parseInt(item.weight || item.product_weight || (shipper_info?.product_weight || 300)),
          product_length: parseInt(item.length || item.product_length || (shipper_info?.product_length || 30)),
          qty: parseInt(quantity),
          subtotal: parseInt(price * quantity)
        };
        
        orderDetails.push(formattedItem);
      }
    }
  }
  
  // Default product if needed
  if (orderDetails.length === 0) {
    console.error('No valid items could be processed');
    throw new Error('Tidak ada produk valid yang dapat diproses');
  }
  
  // Get shipper info from checkout data or use store info from configuration
  const shipper = shipper_info || checkoutData.shipper || {};
  
  // Set official shipper (seller) information
  const shipperInfo = {
    name: "Extreme Store Official",
    brand_name: "Extreme Store", 
    email: "jashujanextrimee@gmail.com",
    address: "Jl. Raya Kebumen, Kebumen, Jawa Tengah", 
    destination_id: 3305 // Kebumen city ID
  };
  
  // Create store order object according to backend schema with clear separation of seller/buyer data
  // Log all checkout data for debugging
  console.log('Raw checkout data:', checkoutData);
  
  // Make sure we have proper destination names for the API
  const receiverDestName = districtName || cityName || city || "";
  const receiverProvName = provinceName || province || "";
  
  // Log the final address components we're using
  console.log('🏠 FINAL ADDRESS COMPONENTS:');
  console.log('Street address:', address);
  console.log('Village:', villageString);
  console.log('District:', districtString);
  console.log('City:', cityString);
  console.log('Province:', provinceString);
  console.log('Full address:', fullAddress);

  const formattedOrder = {
    order_date: orderDate,
    // Shipper (seller) data - use official store information
    brand_name: shipperInfo.brand_name,
    shipper_name: shipperInfo.name,
    shipper_phone: "081234567890", // Hardcoded for now - add actual phone via checkout data in production
    shipper_destination_id: parseInt(shipperInfo.destination_id),
    shipper_destination_name: "Kebumen",
    shipper_province_name: "Jawa Tengah",
    shipper_address: shipperInfo.address,
    shipper_email: shipperInfo.email,
    
    // Receiver (customer/buyer) data
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
    receiver_name: fullName,
    receiver_phone: telephone,
    receiver_destination_id: parseInt(destination_id),
    receiver_destination_name: receiverDestName, 
    receiver_province_name: receiverProvName,
    receiver_address: fullAddress,
    
    // Shipping information
    shipping: courier,
    shipping_type: serviceType,
    payment_method: mappedPaymentMethod,
    shipping_cost: parseInt(shippingCost),
    shipping_cashback: parseInt(checkoutData.shipping_cashback || 0),
<<<<<<< HEAD
    // Calculate service fee according to Komerce's requirements: 2.8% of COD value or grand total
    service_fee:
      mappedPaymentMethod === "COD"
        ? Math.round(parseInt(codValue) * 0.028)
        : Math.round(parseInt(totalAmount) * 0.028),
=======
    
    // Financial calculations
    service_fee: mappedPaymentMethod === 'COD' 
      ? Math.round(parseInt(codValue) * 0.028) 
      : Math.round(parseInt(totalAmount) * 0.028),
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
    additional_cost: parseInt(checkoutData.additional_cost || 0),
    grand_total: parseInt(totalAmount),
    cod_value: parseInt(codValue),
    
    // Insurance value - explicitly set to 0 to avoid issues with Komerce API
    // Per Komerce API, only products with total price > IDR 300,000 can be insured
    insurance_value: 0,
<<<<<<< HEAD
    order_details: orderDetails,
=======
    
    // Order items
    order_details: orderDetails
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
  };

  // Calculate total product price to check insurance eligibility
<<<<<<< HEAD
  const totalProductPrice = formattedOrder.order_details.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

=======
  const totalProductPrice = formattedOrder.order_details.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Log the formatted order for debugging
  console.log('\n\n📋 ========== FORMATTED ORDER DATA ==========');
  console.log(JSON.stringify(formattedOrder, null, 2));
  
  // Log specific location information for debugging
  console.log('\n📍 Location Information:');
  console.log('Shipper Location:', formattedOrder.shipper_destination_name, '(ID:', formattedOrder.shipper_destination_id, ')');
  console.log('Receiver City/District:', formattedOrder.receiver_destination_name, '(ID:', formattedOrder.receiver_destination_id, ')');
  console.log('Receiver Province:', formattedOrder.receiver_province_name);
  console.log('=============================================\n\n');
  
>>>>>>> 4ae5f5c74b15d594129ef46a767a8e1829a8cf0e
  return formattedOrder;
};

/**
 * Parse shipping method string into courier and service type
 * @param {string} shippingMethod - Shipping method string (e.g. "JNE - REG (2-3 hari)")
 * @returns {Array} [courier, serviceType]
 */
/**
 * Mapper untuk kode kurir ke format yang dikenali oleh API Komerce
 */
const courierCodeMapper = {
  jne: "JNE",
  jnt: "JNT",
  "j&t": "JNT",
  ninja: "NINJA",
  anteraja: "ANTERAJA",
  sicepat: "SICEPAT",
  sap: "SAP",
  pos: "POS",
  idexpress: "IDEXPRESS",
  lion: "LION",
  // tambahkan mapper lain jika diperlukan
};

/**
 * Mapper untuk tipe layanan ke format yang dikenali oleh API Komerce
 */
const serviceTypeMapper = {
  reg: "REG",
  regular: "REG",
  ctc23: "CTC23",
  ez: "EZ",
  udrreg: "UDRREG",
  standard: "Standard",
  siunt: "SIUNT",
  idlite: "IDlite",
  regpack: "REGPACK",
  // tambahkan mapper lain jika diperlukan
};

const parseShippingMethod = (shippingMethod) => {
  if (!shippingMethod || typeof shippingMethod !== "string") {
    throw new Error("Metode pengiriman tidak valid");
  }

  try {
    // Format yang mungkin:
    // 1. ID dari shippingOptions: "jne-REG23"
    // 2. Label: "JNE - REG - Rp 10.000 (2-3 hari)"
    // 3. Nama: "JNE - REG (2-3 hari)"

    let courier, serviceType;

    // Prioritaskan format ID dari shippingOptions (format langsung)
    if (shippingMethod.includes("-") && !shippingMethod.includes(" - ")) {
      const parts = shippingMethod.split("-");

      if (parts.length >= 2) {
        courier = parts[0].trim().toLowerCase(); // Extract courier code
        // Combine all the remaining parts as the service type
        serviceType = parts.slice(1).join("-").trim();

        // Map courier and service type to standardized format
        const mappedCourier =
          courierCodeMapper[courier] || courier.toUpperCase();
        const mappedServiceType =
          serviceTypeMapper[serviceType.toLowerCase()] ||
          serviceType.toUpperCase();
        return [mappedCourier, mappedServiceType];
      }
    }

    // Coba format label: "JNE - REG - Rp 10.000 (2-3 hari)"
    if (shippingMethod.includes(" - Rp ")) {
      const splitByPrice = shippingMethod.split(" - Rp ");

      const firstParts = splitByPrice[0].split(" - ");

      if (firstParts.length >= 2) {
        courier = firstParts[0].trim().toLowerCase();
        serviceType = firstParts[1].trim();

        // Map courier and service type to standardized format
        const mappedCourier =
          courierCodeMapper[courier] || courier.toUpperCase();
        const mappedServiceType =
          serviceTypeMapper[serviceType.toLowerCase()] ||
          serviceType.toUpperCase();
        return [mappedCourier, mappedServiceType];
      }
    }

    // Format nama: "JNE - REG (2-3 hari)" atau "J&T - EKONOMI"
    const parts = shippingMethod.split(" - ");

    if (parts.length >= 2) {
      courier = parts[0].trim().toLowerCase();

      // Extract service type without the ETD part
      const servicePart = parts[1];

      if (servicePart.includes("(")) {
        serviceType = servicePart.split("(")[0].trim();
      } else {
        serviceType = servicePart.trim();
      }

      // Map courier and service type to standardized format
      const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
      const mappedServiceType =
        serviceTypeMapper[serviceType.toLowerCase()] ||
        serviceType.toUpperCase();
      return [mappedCourier, mappedServiceType];
    }

    // Fallback - jika tidak ada format yang cocok, coba ekstrak dengan regex
    const courierMatch = /^([a-zA-Z&]+)/.exec(shippingMethod);
    const serviceMatch = /-\s*([a-zA-Z0-9]+)/.exec(shippingMethod);

    if (courierMatch && serviceMatch) {
      courier = courierMatch[1].trim().toLowerCase();
      serviceType = serviceMatch[1].trim();

      // Map courier and service type to standardized format
      const mappedCourier = courierCodeMapper[courier] || courier.toUpperCase();
      const mappedServiceType =
        serviceTypeMapper[serviceType.toLowerCase()] ||
        serviceType.toUpperCase();
      return [mappedCourier, mappedServiceType];
    }

    throw new Error(`Format metode pengiriman tidak valid: ${shippingMethod}`);
  } catch (error) {
    // Fallback ke nilai default untuk mencegah aplikasi crash
    return ["JNE", "REG"]; // Menggunakan kode kurir dalam huruf besar yang didukung oleh API Komerce
  }
};

/**
 * Create a new transaction with stored order data
 * @param {string} orderId - Order ID from stored order
 * @returns {Promise<Object>} Transaction result
 */
export const createTransactionFromStoredOrder = async (orderId) => {
  try {
    // First get the stored order data
    const orderData = await getOrderData(orderId);

    // Convert items back to the format expected by the API
    const formattedOrderData = {
      ...orderData,
      items: orderData.items.map((item) => ({
        name: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
    };

    // Then create transaction
    const response = await fetch(`${API_BASE_URL}/api/v1/transaksi/enhanced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formattedOrderData),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Failed to create transaction (${response.status})`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};
