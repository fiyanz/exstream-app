import { useState, useEffect } from 'react';
import {
  fetchProvinces,
  fetchCities,
  fetchSubdistricts,
  fetchVillages,
} from '../services/dataWilayah';

export const useLocationSelector = () => {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Initial load of provinces
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setIsLoadingLocations(true);
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to load provinces", error);
      } finally {
        setIsLoadingLocations(false);
      }
    };
    loadProvinces();
  }, []);

  const loadCities = async (provinceId) => {
    if (!provinceId) {
      setCities([]);
      return;
    }
    try {
      setIsLoadingLocations(true);
      const data = await fetchCities(provinceId);
      setCities(data);
    } catch (error) {
      console.error("Failed to load cities", error);
      setCities([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const loadSubdistricts = async (cityId) => {
    if (!cityId) {
      setSubdistricts([]);
      return;
    }
    try {
      setIsLoadingLocations(true);
      const data = await fetchSubdistricts(cityId);
      setSubdistricts(data);
    } catch (error) {
      console.error("Failed to load subdistricts", error);
      setSubdistricts([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const loadVillages = async (subdistrictId) => {
    if (!subdistrictId) {
      setVillages([]);
      return;
    }
    try {
      setIsLoadingLocations(true);
      const data = await fetchVillages(subdistrictId);
      setVillages(data);
    } catch (error) {
      console.error("Failed to load villages", error);
      setVillages([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const getLocationName = (id, type) => {
    let list = [];
    if (type === 'province') list = provinces;
    else if (type === 'city') list = cities;
    else if (type === 'subDistrict') list = subdistricts;
    else if (type === 'village') list = villages;
    
    const item = list.find(i => i.id === id);
    return item ? item.name : '';
  };

  return {
    provinces,
    cities,
    subdistricts,
    villages,
    isLoadingLocations,
    loadCities,
    loadSubdistricts,
    loadVillages,
    getLocationName
  };
};
