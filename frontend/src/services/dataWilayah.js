import { API_BASE_URL } from "./apiConfig";

const fetchJSON = async (url) => {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    mode: "cors",
    cache: "no-cache",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const mapResults = (data) =>
  data.map((item) => ({ id: item.id, name: item.name }));

export const fetchProvinces = async () => {
  const data = await fetchJSON(`${API_BASE_URL}/api/v1/wilayah/provinsi`);
  return mapResults(data);
};

export const fetchCities = async (provinceId) => {
  if (!provinceId) return [];
  const data = await fetchJSON(
    `${API_BASE_URL}/api/v1/wilayah/kota?provinsi_id=${provinceId}`,
  );
  return mapResults(data);
};

export const fetchSubdistricts = async (cityId) => {
  if (!cityId) return [];
  const data = await fetchJSON(
    `${API_BASE_URL}/api/v1/wilayah/kecamatan?kota_id=${cityId}`,
  );
  return mapResults(data);
};

export const fetchVillages = async (districtId) => {
  if (!districtId) return [];
  const data = await fetchJSON(
    `${API_BASE_URL}/api/v1/wilayah/desa?kecamatan_id=${districtId}`,
  );
  return mapResults(data);
};
