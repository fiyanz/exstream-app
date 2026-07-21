import { API_BASE_URL } from "./apiConfig";

const COURIERS = "jne:sicepat:ninja:ide:anteraja:jnt";

// Fungsi untuk memformat dibuang karena sekarang backend yang menanganinya.
export const formatShippingOptions = (shippingData) => {
  if (!shippingData || !shippingData.data) return [];
  return shippingData.data; // Data sudah diformat dari backend
};

export const calculateShippingCost = async ({ receiver_destination_id, weight }) => {
  try {
    if (!receiver_destination_id) {
      throw new Error("Destination ID is required");
    }

    const destId = receiver_destination_id;
    const validatedWeight = Math.max(1, Number(weight) || 1000);
    const body = {
      destination: destId,
      weight: validatedWeight,
      courier: COURIERS,
      price: "lowest",
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/domestic/domestic-cost`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Failed to calculate shipping (${res.status})`);
    }

    const data = await res.json();

    if (data.meta?.status !== "success") {
      return {
        success: false,
        message: data.meta?.message || "Gagal menghitung ongkos kirim",
      };
    }

    if (!data.data?.length) {
      return {
        success: false,
        message: "Tidak ada opsi pengiriman tersedia untuk tujuan ini",
      };
    }

    return {
      success: true,
      message: data.meta?.message || "Ongkos kirim berhasil dihitung",
      data: data.data, // Data final (termasuk label dan id) dari backend
    };
  } catch (error) {
    return { success: false, message: error.message || "Gagal menghitung ongkos kirim" };
  }
};
