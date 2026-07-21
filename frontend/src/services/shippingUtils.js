export const COURIER_MAP = {
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
};

export const SERVICE_MAP = {
  reg: "REG",
  regular: "REG",
  ctc23: "CTC23",
  ez: "EZ",
  udrreg: "UDRREG",
  standard: "Standard",
  siunt: "SIUNT",
  idlite: "IDlite",
  regpack: "REGPACK",
};

export const NON_COD_COURIERS = [
  "lion", "ncs", "rex", "rpx", "sentral", "star", "wahana", "dse",
];

export const SHIPPER_INFO = {
  name: "Extreme Store Official",
  brand_name: "Extreme Store",
  email: "jashujanextrimee@gmail.com",
  address: "Jl. Raya Kebumen, Kebumen, Jawa Tengah",
  destination_id: 3305,
};

export const ADMIN_WHATSAPP = "6287890792595";

export function parseShippingMethod(shippingMethod) {
  if (!shippingMethod || typeof shippingMethod !== "string") {
    return ["jne", "reg"];
  }

  try {
    if (shippingMethod.includes("-") && !shippingMethod.includes(" - ")) {
      const parts = shippingMethod.split("-");
      if (parts.length >= 2) {
        const courier = parts[0].trim().toLowerCase();
        const service = parts.slice(1).join("-").trim();
        return [
          COURIER_MAP[courier] || courier.toUpperCase(),
          SERVICE_MAP[service.toLowerCase()] || service.toUpperCase(),
        ];
      }
    }

    if (shippingMethod.includes(" - Rp ")) {
      const first = shippingMethod.split(" - Rp ")[0].split(" - ");
      if (first.length >= 2) {
        return [
          COURIER_MAP[first[0].trim().toLowerCase()] || first[0].trim().toUpperCase(),
          SERVICE_MAP[first[1].trim().toLowerCase()] || first[1].trim().toUpperCase(),
        ];
      }
    }

    const parts = shippingMethod.split(" - ");
    if (parts.length >= 2) {
      const courier = parts[0].trim().toLowerCase();
      const service = parts[1].split("(")[0].trim();
      return [
        COURIER_MAP[courier] || courier.toUpperCase(),
        SERVICE_MAP[service.toLowerCase()] || service.toUpperCase(),
      ];
    }

    const courierMatch = /^([a-zA-Z&]+)/.exec(shippingMethod);
    const serviceMatch = /-\s*([a-zA-Z0-9]+)/.exec(shippingMethod);
    if (courierMatch && serviceMatch) {
      const courier = courierMatch[1].trim().toLowerCase();
      const service = serviceMatch[1].trim();
      return [
        COURIER_MAP[courier] || courier.toUpperCase(),
        SERVICE_MAP[service.toLowerCase()] || service.toUpperCase(),
      ];
    }

    return ["JNE", "REG"];
  } catch {
    return ["JNE", "REG"];
  }
}

export function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return "";
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.substring(1)}`;
  return `62${digits}`;
}

export function courierSupportsCOD(courier) {
  if (!courier) return false;
  return !NON_COD_COURIERS.includes(courier.toLowerCase());
}
