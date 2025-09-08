/**
 * transactionService.js
 *
 * This module provides functions to handle transaction creation
 * with support for both COD and non-COD (Midtrans) payments,
 * as well as integration with Komerce Store Order API.
 */

import {
  API_BASE_URL,
  fetchProvinces,
  fetchCities,
  fetchSubdistricts,
  fetchVillages,
} from "./dataWilayah";
import { formatOrderData } from "./storeOrder";

/**
 * Fetches location names based on their IDs
 * @param {number|string} provinceId - Province ID
 * @param {number|string} cityId - City ID
 * @param {number|string} districtId - District/Subdistrict ID
 * @param {number|string} villageId - Village ID
 * @returns {Promise<Object>} Object containing location names
 */
const fetchLocationNames = async (
  provinceId,
  cityId,
  districtId,
  villageId
) => {
  try {
    const locationNames = {
      provinceName: "",
      cityName: "",
      districtName: "",
      villageName: "",
    };

    // Fetch province name if ID is provided
    if (provinceId) {
      try {
        const provinces = await fetchProvinces();
        const province = provinces.find(
          (p) => String(p.id) === String(provinceId)
        );
        if (province) {
          locationNames.provinceName = province.name;
        }
      } catch (e) {
        console.error("Error fetching province:", e);
      }
    }

    // Fetch city name if ID is provided
    if (cityId && provinceId) {
      try {
        const cities = await fetchCities(provinceId);
        const city = cities.find((c) => String(c.id) === String(cityId));
        if (city) {
          locationNames.cityName = city.name;
        }
      } catch (e) {
        console.error("Error fetching city:", e);
      }
    }

    // Fetch district/subdistrict name if ID is provided
    if (districtId && cityId) {
      try {
        const districts = await fetchSubdistricts(cityId);
        const district = districts.find(
          (d) => String(d.id) === String(districtId)
        );
        if (district) {
          locationNames.districtName = district.name;
        }
      } catch (e) {
        console.error("Error fetching district:", e);
      }
    }

    // Fetch village name if ID is provided
    if (villageId && districtId) {
      try {
        const villages = await fetchVillages(districtId);
        const village = villages.find(
          (v) => String(v.id) === String(villageId)
        );
        if (village) {
          locationNames.villageName = village.name;
        }
      } catch (e) {
        console.error("Error fetching village:", e);
      }
    }

    return locationNames;
  } catch (error) {
    console.error("Error fetching location names:", error);
    return {
      provinceName: "",
      cityName: "",
      districtName: "",
      villageName: "",
    };
  }
};

// Admin WhatsApp number (will be used as primary destination)
const ADMIN_WHATSAPP = "6285137535186";

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
    // Save order_id in session storage for redirect after payment
    if (orderData.id) {
      try {
        sessionStorage.setItem("lastOrderId", orderData.id);
        sessionStorage.setItem("waPostPayment", "1");
      } catch (e) {
        console.warn("Failed to save order info:", e);
      }
    }

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
    // Ambil nama daerah, hindari ID angka (lookup performed below with getLocationName)

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

    // Build receipt-style messages (Jakarta time)
    const now = new Date();
    const jkt = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const dd = String(jkt.getUTCDate()).padStart(2, "0");
    const mm = String(jkt.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = jkt.getUTCFullYear();
    const HH = String(jkt.getUTCHours()).padStart(2, "0");
    const MM = String(jkt.getUTCMinutes()).padStart(2, "0");
    const SS = String(jkt.getUTCSeconds()).padStart(2, "0");
    const tanggal = `${dd}/${mm}/${yyyy}`;
    const waktu = `${HH}:${MM}:${SS}`;

    const headerBox =
      `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
      `┃  🛒 JAS HUJAN EXTREME STORE       ┃\n` +
      `┃        ✅ ORDER CONFIRMATION      ┃\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n` +
      (orderId ? `Order ID: ${orderId}\n` : "") +
      `Tanggal: ${tanggal}\n` +
      `Waktu: ${waktu}\n\n`;

    const customerBlock =
      `📋 INFORMASI PELANGGAN\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Nama: ${customerName}\n` +
      `📱 No. HP: ${receiverPhone}\n` +
      `📍 Alamat: ${address}` +
      `${villageName ? `, ${villageName}` : ""}` +
      `${subdistrictName ? `, Kec. ${subdistrictName}` : ""}` +
      `${cityName ? `, ${cityName}` : ""}` +
      `${provinceName ? `, ${provinceName}` : ""}\n\n`;

    const productBlock =
      `🛍️ DETAIL PRODUK (${items.length} item)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      (itemsText ? `${itemsText}\n` : "") +
      `──────────────────────────────────────\n\n`;

    const summaryLines =
      (discount
        ? `Diskon: Rp ${Number(discount).toLocaleString("id-ID")}\n`
        : "") +
      (shippingCost
        ? `Ongkir: Rp ${Number(shippingCost).toLocaleString("id-ID")}\n`
        : "") +
      (serviceFee
        ? `Biaya Layanan: Rp ${Number(serviceFee).toLocaleString("id-ID")}\n`
        : "") +
      (additionalCost
        ? `Biaya Tambahan: Rp ${Number(additionalCost).toLocaleString(
            "id-ID"
          )}\n`
        : "") +
      (insuranceValue
        ? `Asuransi: Rp ${Number(insuranceValue).toLocaleString("id-ID")}\n`
        : "");

    const totalLine = total
      ? `💵 TOTAL BAYAR: Rp ${Number(total).toLocaleString("id-ID")}\n`
      : "";

    const codMessage =
      headerBox +
      customerBlock +
      productBlock +
      `🚚 Pengiriman: ${shipping}${
        shippingType && shippingType !== "-" ? ` - ${shippingType}` : ""
      }\n` +
      `💳 Metode Pembayaran: COD\n` +
      (codValue
        ? `💰 Nilai COD: Rp ${Number(codValue).toLocaleString("id-ID")}\n`
        : "") +
      (summaryLines || "") +
      totalLine +
      `\n✅ STATUS: PESANAN COD BERHASIL DIBUAT\n` +
      `💡 Pembayaran dilakukan saat barang diterima\n` +
      `📦 Pesanan akan segera diproses dan dikirim\n` +
      `⏰ Estimasi pengiriman: 1-3 hari kerja\n` +
      `\nTerima kasih telah berbelanja di Jas Hujan Extreme Store! ✨`;

    // Use the same layout as COD receipt for paid transfer, only the payment/status lines differ
    const transferPaidMessage =
      headerBox +
      customerBlock +
      productBlock +
      `🚚 Pengiriman: ${shipping}${
        shippingType && shippingType !== "-" ? ` - ${shippingType}` : ""
      }\n` +
      `💳 Metode Pembayaran: Transfer Bank\n` +
      (summaryLines || "") +
      totalLine +
      `\n✅ STATUS: PEMBAYARAN LUNAS\n` +
      `💡 Pembayaran telah diterima ✅\n` +
      `📦 Pesanan akan segera diproses dan dikirim\n` +
      `⏰ Estimasi pengiriman: 1-3 hari kerja\n` +
      `\nTerima kasih telah berbelanja di Jas Hujan Extreme Store! ✨`;

    const isCOD =
      (payment || "").toString().toUpperCase().includes("COD") ||
      (codValue && Number(codValue) > 0);
    const defaultMessage = isCOD
      ? codMessage
      : headerBox +
        customerBlock +
        productBlock +
        `🚚 Pengiriman: ${shipping}${
          shippingType && shippingType !== "-" ? ` - ${shippingType}` : ""
        }\n` +
        `💳 Metode Pembayaran: Transfer Bank\n` +
        (summaryLines || "") +
        totalLine +
        `\n⏳ STATUS: MENUNGGU PEMBAYARAN\n` +
        `💡 Mohon selesaikan pembayaran untuk memproses pesanan\n` +
        `📦 Pesanan akan segera diproses setelah pembayaran diterima\n` +
        `⏰ Estimasi pengiriman: 1-3 hari kerja\n` +
        `\nTerima kasih telah berbelanja di Jas Hujan Extreme Store! ✨`;

    // Pre-build URLs for default message (COD uses this directly)
    const waPrimaryUrl = `https://wa.me/${phone62}?text=${encodeURIComponent(
      defaultMessage
    )}`;
    const waSecondaryUrl = `https://whatsapp.me/${phone62}?text=${encodeURIComponent(
      defaultMessage
    )}`;
    const waTertiaryUrl = `https://api.whatsapp.com/send?phone=${phone62}&text=${encodeURIComponent(
      defaultMessage
    )}`;

    if (typeof window !== "undefined") {
      window.__waRedirectInfo = {
        phone62,
        isCOD,
        message: defaultMessage,
        transferPaidMessage,
        waPrimaryUrl,
        waSecondaryUrl,
        waTertiaryUrl,
      };
    }
  } catch {
    /* no-op */
  }
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
    // If transfer and paid message exists, rebuild URLs on the fly
    let targetMessage = info.message;
    if (!info.isCOD && info.transferPaidMessage) {
      targetMessage = info.transferPaidMessage;
    }
    const waPrimaryUrl = `https://wa.me/${
      info.phone62
    }?text=${encodeURIComponent(targetMessage)}`;
    const waSecondaryUrl = `https://whatsapp.me/${
      info.phone62
    }?text=${encodeURIComponent(targetMessage)}`;
    const waTertiaryUrl = `https://api.whatsapp.com/send?phone=${
      info.phone62
    }&text=${encodeURIComponent(targetMessage)}`;

    const targetUrl = waPrimaryUrl || waSecondaryUrl || waTertiaryUrl;
    setTimeout(() => {
      try {
        window.location.href = targetUrl;
      } catch {
        try {
          window.location.href = waSecondaryUrl || waTertiaryUrl || targetUrl;
        } catch {
          window.location.href = waTertiaryUrl || targetUrl;
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
  // Only use Snap popup, do not fallback to redirect/tab
  if (window.snap && typeof window.snap.pay === "function") {
    try {
      const popupConfig = {
        onSuccess: function () {
          // Tutup popup jika ada
          if (window.snapPopup && !window.snapPopup.closed) {
            window.snapPopup.close();
          }
          // Langsung redirect ke WhatsApp dengan template lunas
          if (
            window.__waRedirectInfo &&
            window.__waRedirectInfo.transferPaidMessage
          ) {
            const phone = window.__waRedirectInfo.phone62 || "6285137535186";
            const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
              window.__waRedirectInfo.transferPaidMessage
            )}`;
            window.location.href = targetUrl;
          } else {
            console.error("No message template found for WhatsApp redirect");
            alert(
              "Terjadi kesalahan dalam memproses pesan. Silakan coba lagi."
            );
          }
        },
        onPending: function () {
          alert("Pembayaran pending, silakan selesaikan pembayaran Anda.");
        },
        onError: function () {
          if (window.snapPopup && !window.snapPopup.closed) {
            window.snapPopup.close();
          }
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          // User closed popup
        },
      };
      window.snap.pay(snapToken, popupConfig);
      return;
    } catch (err) {
      console.error("Midtrans popup failed:", err);
      alert(
        "Gagal membuka popup pembayaran. Silakan cek pengaturan browser Anda atau coba lagi."
      );
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
export const embedMidtransSnap = (snapToken, onSuccessCallback) => {
  if (window.snap && typeof window.snap.embed === "function") {
    try {
      const container = document.getElementById("snap-container");
      const embedContent = document.getElementById("snap-embed-content");
      if (!container || !embedContent) {
        throw new Error("Required container elements not found");
      }

      container.style.display = "block";

      window.snap.embed(snapToken, {
        embedId: "snap-embed-content",
        onSuccess: function (result) {
          container.style.display = "none";
          if (
            window.__waRedirectInfo &&
            window.__waRedirectInfo.transferPaidMessage
          ) {
            const phone = window.__waRedirectInfo.phone62 || "6285137535186";
            const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
              window.__waRedirectInfo.transferPaidMessage
            )}`;
            window.location.href = targetUrl;
          } else {
            console.error("No message template found for WhatsApp redirect");
            alert(
              "Terjadi kesalahan dalam memproses pesan. Silakan coba lagi."
            );
          }
        },
        onPending: function () {
          alert("Pembayaran pending, silakan selesaikan pembayaran Anda.");
        },
        onError: function () {
          if (container) {
            container.style.display = "none";
          }
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          if (container) {
            container.style.display = "none";
          }
        },
      });
    } catch (err) {
      console.error("Midtrans popup failed:", err);
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
// Accepts optional onSuccessCallback for post-payment actions (e.g., WhatsApp redirect)
export const handleMidtransPaymentEnhanced = (
  snapToken,
  redirectUrl,
  onSuccessCallback
) => {
  // Create or ensure container exists
  let container = document.getElementById("snap-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "snap-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    container.style.zIndex = "9999";
    container.style.display = "none";
    document.body.appendChild(container);
  }

  // Method 1: Try embedded mode with token (preferred method)
  if (window.snap && typeof window.snap.embed === "function" && snapToken) {
    try {
      const container = document.getElementById("snap-container");
      container.style.display = "block";

      window.snap.embed(snapToken, {
        embedId: "snap-container",
        onSuccess: function (result) {
          container.style.display = "none";
          if (
            window.__waRedirectInfo &&
            window.__waRedirectInfo.transferPaidMessage
          ) {
            const phone = window.__waRedirectInfo.phone62 || "6285137535186";
            const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
              window.__waRedirectInfo.transferPaidMessage
            )}`;
            window.location.href = targetUrl;
          } else {
            console.error("No message template found for WhatsApp redirect");
            alert(
              "Terjadi kesalahan dalam memproses pesan. Silakan coba lagi."
            );
          }
        },
        onPending: function (result) {
          container.style.display = "none";
          alert("Pembayaran pending, silakan selesaikan pembayaran Anda.");
        },
        onError: function (result) {
          container.style.display = "none";
          console.error("Payment error:", result);
          alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          container.style.display = "none";
        },
      });
      return;
    } catch (err) {
      console.error("Midtrans embedded mode failed:", err);
    }
  }

  // Method 2: Extract token from redirect URL and try embedded mode
  if (window.snap && typeof window.snap.embed === "function" && redirectUrl) {
    try {
      const urlParts = redirectUrl.split("/");
      const extractedToken = urlParts[urlParts.length - 1];

      if (extractedToken && extractedToken.length > 10) {
        const container = document.getElementById("snap-container");
        container.style.display = "block";

        window.snap.embed(extractedToken, {
          embedId: "snap-container",
          onSuccess: function (result) {
            container.style.display = "none";
            if (
              window.__waRedirectInfo &&
              window.__waRedirectInfo.transferPaidMessage
            ) {
              const phone = window.__waRedirectInfo.phone62 || "6285137535186";
              const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
                window.__waRedirectInfo.transferPaidMessage
              )}`;
              window.location.href = targetUrl;
            } else {
              console.error("No message template found for WhatsApp redirect");
              alert(
                "Terjadi kesalahan dalam memproses pesan. Silakan coba lagi."
              );
            }
          },
          onPending: function () {
            container.style.display = "none";
            alert("Pembayaran pending, silakan selesaikan pembayaran Anda.");
          },
          onError: function () {
            container.style.display = "none";
            console.error("Payment error");
            alert("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: function () {
            container.style.display = "none";
          },
        });
        return;
      }
    } catch (err) {
      console.error("Midtrans embedded mode failed:", err);
    }
  }

  // Method 3: Fallback to redirect
  if (redirectUrl) {
    try {
      sessionStorage.setItem("waPostPayment", "1");
    } catch {
      /* no-op */
    }
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

    // Get payment method from possible properties
    const paymentMethod =
      orderData.paymentMethod ||
      orderData.payment_method ||
      (formattedData && formattedData.payment_method);

    // Special case handling for COD orders
    if (paymentMethod && paymentMethod.toUpperCase().includes("COD")) {
      // Process COD order
    }

    // Rest of the implementation
    return {};
  } catch (error) {
    console.error("Store order error:", error);
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
    if (!checkoutData) {
      throw new Error("Data checkout tidak tersedia");
    }

    // Format the checkout data into the order format with proper location names
    const orderData = await formatStoreOrderData(checkoutData);

    // Validate the formatted order data
    if (!orderData) {
      throw new Error("Data order tidak tersedia");
    }

    // Enhanced logging with visual separation for easier debugging
    console.log("\n\n🔍 ========== STORE ORDER DEBUGGING INFO ==========");
    console.log("📅 Timestamp:", new Date().toISOString());
    console.log("📦 ORDER DATA (API CALL DISABLED):");
    console.log(JSON.stringify(orderData, null, 2));

    // Log specific important fields
    if (orderData.receiver_name)
      console.log("👤 Receiver:", orderData.receiver_name);
    if (orderData.receiver_phone)
      console.log("📱 Phone:", orderData.receiver_phone);
    if (orderData.payment_method)
      console.log("💰 Payment Method:", orderData.payment_method);
    if (orderData.shipping) console.log("🚚 Courier:", orderData.shipping);
    console.log("================================================\n\n");

    // (API call disabled)
    // Instead, return a mock successful response
    console.warn(
      "⚠️ API CALL DISABLED: Store order API call has been temporarily disabled for debugging"
    );

    // Generate a realistic looking order ID
    const mockOrderId = `SIM-${Date.now().toString().slice(-8)}`;

    // If COD, prepare and redirect to WhatsApp immediately with COD receipt
    try {
      const payMethod = (orderData.payment_method || "")
        .toString()
        .toUpperCase();
      if (payMethod.includes("COD")) {
        const orderWithId = { ...orderData, order_id: mockOrderId };
        if (typeof window !== "undefined") {
          prepareWaRedirectInfo(orderWithId);
          triggerWaRedirectIfPrepared();
        }
      }
    } catch {
      /* no-op */
    }

    // Return mock successful response
    return {
      success: true,
      message: "Order simulated successfully (API call disabled)",
      order_id: mockOrderId,
      status: "SIMULATION_MODE",
      timestamp: new Date().toISOString(),
      data: orderData,
    };
  } catch (error) {
    console.error("❌ ERROR in createStoreOrder:", error);
    console.error("Error details:", error.message);

    // Provide more context about the error for debugging
    if (error.message.includes("tidak tersedia")) {
      console.error("Cause: Missing order data");
    } else if (error.message.includes("tidak lengkap")) {
      console.error("Cause: Incomplete required fields");
    } else if (error.message.includes("COD")) {
      console.error("Cause: COD payment method issue");
    }

    // Log the stack trace
    console.error("Stack trace:", error.stack);

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
    villageName: existingVillageName,
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
      console.error("Failed to fetch location names:", error);
      // Continue with whatever names we have
    }
  }

  // Special handling for testing: if any location ID is present but the corresponding name is missing,
  // try fetching them one more time with direct calls
  if (
    (province_id && !provinceName) ||
    (city_id && !cityName) ||
    (district_id && !districtName) ||
    (village_id && !villageName)
  ) {
    console.log(
      "🔄 Location names missing but IDs present - trying direct fetch..."
    );

    try {
      // Direct API calls to populate missing location names
      if (province_id && !provinceName) {
        const provinces = await fetchProvinces();
        const province = provinces.find(
          (p) => p.id == province_id || String(p.id) === String(province_id)
        );
        if (province) {
          provinceName = province.name;
          console.log(`✅ Direct fetch - Found province: ${province.name}`);
        }
      }

      if (city_id && !cityName) {
        const cities = await fetchCities(province_id);
        const city = cities.find(
          (c) => c.id == city_id || String(c.id) === String(city_id)
        );
        if (city) {
          cityName = city.name;
          console.log(`✅ Direct fetch - Found city: ${city.name}`);
        }
      }

      if (district_id && !districtName) {
        const districts = await fetchSubdistricts(city_id);
        const district = districts.find(
          (d) => d.id == district_id || String(d.id) === String(district_id)
        );
        if (district) {
          districtName = district.name;
          console.log(`✅ Direct fetch - Found district: ${district.name}`);
        }
      }

      if (village_id && !villageName) {
        const villages = await fetchVillages(district_id);
        const village = villages.find(
          (v) => v.id == village_id || String(v.id) === String(village_id)
        );
        if (village) {
          villageName = village.name;
          console.log(`✅ Direct fetch - Found village: ${village.name}`);
        }
      }
    } catch (error) {
      console.error("Error in direct location fetch:", error);
    }
  }

  // Process checkout data

  // Validate phone number format
  if (
    telephone &&
    !/^(\+62|62|0)[0-9]{9,13}$/.test(telephone.replace(/[\s-]/g, ""))
  ) {
    throw new Error(
      "Format nomor telepon tidak valid. Gunakan format: 08XXXXXXXXXX"
    );
  }

  // Use items if available or fallback to empty array
  if (!items || !Array.isArray(items)) {
    items = [];
  }

  // Map payment method to Komerce format
  const mappedPaymentMethod = (paymentMethod || "")
    .toString()
    .toUpperCase()
    .includes("COD")
    ? "COD"
    : "Transfer";

  // Parse shipping method to get courier and service type
  const [courier, serviceType] = parseShippingMethod(shippingMethod);

  // Calculate COD value
  const codValue = mappedPaymentMethod === "COD" ? totalAmount : 0;

  // Ensure we have the correct names for address formation
  const villageString = villageName || "";
  const districtString = districtName || "";
  const cityString = cityName || city || "";
  const provinceString = provinceName || province || "";

  // Debug log location data
  console.log("📍 DEBUG LOCATION DATA:");
  console.log("Province ID:", province_id, "Name:", provinceName || "MISSING");
  console.log("City ID:", city_id, "Name:", cityName || "MISSING");
  console.log("District ID:", district_id, "Name:", districtName || "MISSING");
  console.log("Village ID:", village_id, "Name:", villageName || "MISSING");

  // Double check that we're not using IDs in the address
  if (!villageString && village_id)
    console.warn("⚠️ Missing village name for ID:", village_id);
  if (!districtString && district_id)
    console.warn("⚠️ Missing district name for ID:", district_id);
  if (!cityString && city_id)
    console.warn("⚠️ Missing city name for ID:", city_id);
  if (!provinceString && province_id)
    console.warn("⚠️ Missing province name for ID:", province_id);

  // Only use parts that are actual names, not numeric IDs
  const fullAddress = [
    address,
    // Filter out any parts that look like numeric IDs
    villageString && !/^\d+$/.test(villageString) ? villageString : "",
    districtString && !/^\d+$/.test(districtString) ? districtString : "",
    cityString && !/^\d+$/.test(cityString) ? cityString : "",
    provinceString && !/^\d+$/.test(provinceString) ? provinceString : "",
    postalCode ? `Kode Pos: ${postalCode}` : "",
  ]
    .filter((part) => part && part.trim() !== "")
    .join(", ");

  // Format order details with minimal error checking
  const orderDetails = [];

  // Process each item if available
  if (items && items.length > 0) {
    for (const item of items) {
      if (item) {
        const productName =
          item.name || item.product_name || item.title || "Product";
        const price = item.price || 0;
        const quantity = item.quantity || 1;

        const formattedItem = {
          product_name: productName,
          product_variant_name:
            item.color && item.size
              ? `${item.color} - ${item.size}`
              : item.variant || item.variant_name || productName,
          product_price: parseInt(price),
          product_width: parseInt(
            item.width ||
              item.product_width ||
              shipper_info?.product_width ||
              20
          ),
          product_height: parseInt(
            item.height ||
              item.product_height ||
              shipper_info?.product_height ||
              5
          ),
          product_weight: parseInt(
            item.weight ||
              item.product_weight ||
              shipper_info?.product_weight ||
              300
          ),
          product_length: parseInt(
            item.length ||
              item.product_length ||
              shipper_info?.product_length ||
              30
          ),
          qty: parseInt(quantity),
          subtotal: parseInt(price * quantity),
        };

        orderDetails.push(formattedItem);
      }
    }
  }

  // Default product if needed
  if (orderDetails.length === 0) {
    console.error("No valid items could be processed");
    throw new Error("Tidak ada produk valid yang dapat diproses");
  }

  // Get shipper info from checkout data or use store info from configuration
  // const shipper = shipper_info || checkoutData.shipper || {};

  // Set official shipper (seller) information
  const shipperInfo = {
    name: "Extreme Store Official",
    brand_name: "Extreme Store",
    email: "jashujanextrimee@gmail.com",
    address: "Jl. Raya Kebumen, Kebumen, Jawa Tengah",
    destination_id: 3305, // Kebumen city ID
  };

  // Create store order object according to backend schema with clear separation of seller/buyer data
  // Log all checkout data for debugging
  console.log("Raw checkout data:", checkoutData);

  // Make sure we have proper destination names for the API
  const receiverDestName = districtName || cityName || city || "";
  const receiverProvName = provinceName || province || "";

  // Log the final address components we're using
  console.log("🏠 FINAL ADDRESS COMPONENTS:");
  console.log("Street address:", address);
  console.log("Village:", villageString);
  console.log("District:", districtString);
  console.log("City:", cityString);
  console.log("Province:", provinceString);
  console.log("Full address:", fullAddress);

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

    // Financial calculations
    service_fee:
      mappedPaymentMethod === "COD"
        ? Math.round(parseInt(codValue) * 0.028)
        : Math.round(parseInt(totalAmount) * 0.028),
    additional_cost: parseInt(checkoutData.additional_cost || 0),
    grand_total: parseInt(totalAmount),
    cod_value: parseInt(codValue),

    // Insurance value - explicitly set to 0 to avoid issues with Komerce API
    // Per Komerce API, only products with total price > IDR 300,000 can be insured
    insurance_value: 0,

    // Order items
    order_details: orderDetails,
  };

  // Calculate total product price to check insurance eligibility
  // const totalProductPrice = formattedOrder.order_details.reduce((sum, item) => sum + item.subtotal, 0);

  // Log the formatted order for debugging
  console.log("\n\n📋 ========== FORMATTED ORDER DATA ==========");
  console.log(JSON.stringify(formattedOrder, null, 2));

  // Log specific location information for debugging
  console.log("\n📍 Location Information:");
  console.log(
    "Shipper Location:",
    formattedOrder.shipper_destination_name,
    "(ID:",
    formattedOrder.shipper_destination_id,
    ")"
  );
  console.log(
    "Receiver City/District:",
    formattedOrder.receiver_destination_name,
    "(ID:",
    formattedOrder.receiver_destination_id,
    ")"
  );
  console.log("Receiver Province:", formattedOrder.receiver_province_name);
  console.log("=============================================\n\n");

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
      await response.text();
      throw new Error(`Failed to create transaction (${response.status})`);
    }

    const data = await response.json();

    return data;
  } catch (e) {
    throw e;
  }
};

// Redirect to WhatsApp with LUNAS after returning from Midtrans if status indicates success
export const initWaReturnRedirect = () => {
  if (typeof window === "undefined") return;
  if (window.__waReturnInit) return;
  window.__waReturnInit = true;

  try {
    const params = new URLSearchParams(window.location.search);
    const statusCode = params.get("status_code") || params.get("status") || "";
    const txnStatus = (params.get("transaction_status") || "").toLowerCase();
    const redirectStatus = (params.get("redirect_status") || "").toLowerCase();
    const statusMessage = (params.get("status_message") || "").toLowerCase();
    const hash = (window.location.hash || "").toLowerCase();
    const sessionFlag = (() => {
      try {
        return sessionStorage.getItem("waPostPayment") === "1";
      } catch {
        return false;
      }
    })();
    const isSuccess =
      statusCode === "200" ||
      statusCode.toLowerCase() === "success" ||
      ["settlement", "capture", "success", "paid"].includes(txnStatus) ||
      redirectStatus === "success" ||
      statusMessage === "success" ||
      hash.includes("#/success") ||
      (hash && hash.includes("success"));

    if (sessionFlag && isSuccess) {
      try {
        sessionStorage.removeItem("waPostPayment");
      } catch {
        /* no-op */
      }
      setTimeout(() => {
        try {
          triggerWaRedirectIfPrepared();
        } catch {
          /* no-op */
        }
      }, 120);
    } else if (sessionFlag) {
      const host = (window.location.hostname || "").toLowerCase();
      if (!host.includes("midtrans")) {
        setTimeout(() => {
          try {
            triggerWaRedirectIfPrepared();
          } catch {
            /* no-op */
          }
        }, 600);
      }
    }
  } catch {
    /* no-op */
  }
};

// Expose a helper for UI to manually open the prepared WhatsApp receipt
export const openWhatsappReceipt = () => {
  try {
    return triggerWaRedirectIfPrepared();
  } catch {
    return false;
  }
};

// Auto-init on module load
try {
  initWaReturnRedirect();
} catch {
  /* no-op */
}
