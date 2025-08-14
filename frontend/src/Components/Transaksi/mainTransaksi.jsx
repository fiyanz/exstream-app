import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CheckCircle, ShoppingBag, Plus, Minus, Trash2, AlertCircle, RefreshCcw } from 'lucide-react';
import Hijau from '../../assets/Extrime/Cewek/HijauSage/Cewe4.jpeg';
import Ungu from '../../assets/Extrime/Cewek/Violet/Cewe3.jpeg';
import Dusty from '../../assets/Extrime/Cewek/DustyPink/Cewe3.jpeg';
import './toast-animation.css';
import Pink from '../../assets/Extrime/Cewek/PInkMuda/Cewe3.jpeg';
import Bei from '../../assets/Extrime/Cowok/One3.jpeg';
import Nav from '../../assets/Extrime/Cowok/One1.jpeg';
import Blac from '../../assets/Extrime/Cowok/One.jpeg';
import arm from '../../assets/Extrime/Cowok/One2.jpeg';
import red from '../../assets/Extrime/Cowok/One4.jpeg';
import './Cont.css';
import './success-order.css'; // Import success order styles
import Testi from '../../assets/image/baju.png'; // Added Testi image import

// Data for products, options, and mock location data.
const productData = [
  { color: 'Hijau Sage', image: Hijau },
  { color: 'Ungu Violet', image: Ungu },
  { color: 'Dusty Pink', image: Dusty },
  { color: 'Pink Muda', image: Pink },
  { color: 'Beige / Khaki', image: Bei },
  { color: 'Navy Blue', image: Nav },
  { color: 'Black', image: Blac },
  { color: 'Army Green', image: arm },
  { color: 'Red', image: red },
];

const sizeOptions = ['L', 'XL', 'XXL', 'XXXL'];
const shippingMethods = [
  'J&T Express',
  'JNE',
  'SiCepat',
  'Standard Shipping',
  'Express Shipping',
  'Same Day Delivery',
];
const paymentMethods = [
  { name: 'transfer', label: 'Transfer Bank, E-Wallet, Virtual Account' },
  { name: 'cod', label: 'COD (Bayar Di Tempat)' },
];

// Mock location data.
// Placeholder arrays dan objek untuk data lokasi
const placeholderProvinces = [];
const placeholderCities = {};
const placeholderSubdistricts = {};
const placeholderVillages = {};

// Reusable component for a Select dropdown.
const SelectInput = ({ label, name, value, options, onChange, placeholder, required, disabled = false, error }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="block text-sm font-medium text-black on-1 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base disabled:cursor-not-allowed disabled:bg-gray-100 transition-colors duration-200 on-11 appearance-none`}
        required={required}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="" disabled>{placeholder}</option>
        {Array.isArray(options) && options.map((option) => (
          <option 
            key={typeof option === 'object' ? option.id || JSON.stringify(option) : option} 
            value={typeof option === 'object' ? option.id || option.value || option.name : option}
          >
            {typeof option === 'object' ? option.name || option.label : option}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      {error && (
        <div className="flex items-center mt-1">
          <p className="text-xs text-gray-500" id={`${name}-error`}>{error}</p>
        </div>
      )}
    </div>
  </div>
);

// Reusable component for a Text input field.
const TextInput = ({ label, name, value, onChange, placeholder, type = 'text', required, error }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="block text-sm font-medium text-black on-1 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base transition-colors duration-200 on-11`}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <div className="flex items-center mt-1">
          <p className="text-xs text-gray-500" id={`${name}-error`}>{error}</p>
        </div>
      )}
    </div>
  </div>
);

// AutocompleteInput for location selection
const AutocompleteInput = ({ label, name, value, onChange, onSelect, options, placeholder, required, disabled = false, error, isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Filter options when query changes
  useEffect(() => {
    if (!options || !Array.isArray(options)) {
      setFilteredOptions([]);
      return;
    }
    
    if (!searchQuery.trim()) {
      setFilteredOptions(options);
      return;
    }
    
    const filtered = options.filter(option => {
      const optionName = typeof option === 'object' ? option.name || '' : option;
      return optionName.toLowerCase().includes(searchQuery.toLowerCase());
    }).slice(0, 5); // Limit to 5 suggestions
    
    setFilteredOptions(filtered);
  }, [searchQuery, options]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
    
    // Call the original onChange to update form state
    const mockEvent = {
      target: {
        name,
        value: newValue
      }
    };
    onChange(mockEvent);
  };
  
  const handleOptionSelect = (option) => {
    const optionName = typeof option === 'object' ? option.name || '' : option;
    const optionId = typeof option === 'object' ? option.id || option : option;
    
    setSearchQuery(optionName);
    setIsOpen(false);
    
    // Call the original onSelect to update form state with ID
    const mockEvent = {
      target: {
        name,
        value: optionId
      }
    };
    onChange(mockEvent);
    
    if (onSelect) {
      onSelect(option);
    }
  };
  
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium text-black on-1 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            id={name}
            name={name}
            value={searchQuery}
            onChange={handleInputChange}
            onClick={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`mt-1 block w-full px-3 py-2.5 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base transition-colors duration-200 on-11 ${isLoading ? 'bg-gray-50' : ''}`}
            required={required}
            disabled={disabled || isLoading}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${name}-error` : undefined}
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700"></div>
            </div>
          )}
        </div>
        
        {isOpen && options && options.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-700"></div>
                <span className="ml-2 text-sm text-gray-500">Memuat data...</span>
              </div>
            ) : filteredOptions.length > 0 ? (
              <ul className="py-1">
                {filteredOptions.map((option, index) => {
                  const optionName = typeof option === 'object' ? option.name || '' : option;
                  const optionId = typeof option === 'object' ? option.id || option : option;
                  
                  return (
                    <li 
                      key={optionId || index} 
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleOptionSelect(option)}
                    >
                      {optionName}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">
                Tidak ada hasil yang cocok
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="flex items-center mt-1">
            <p className="text-xs text-gray-500" id={`${name}-error`}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Error Boundary component to catch rendering errors gracefully
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-500 bg-red-100 border border-red-300 rounded-xl m-8">
          <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
          <p>We're sorry, but there was an error loading this component. Please try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main Application Component.
const App = () => {
  // Hardcoded product price for demonstration.
  const productPrice = 299000;
  const discountRate = 0.5; // 50% discount

  // State for the product selection form (to add to cart)
  const [currentProduct, setCurrentProduct] = useState({
    size: '',
    color: '',
    quantity: 1,
  });

  // State for the list of products in the cart
  const [cartItems, setCartItems] = useState([]);

  // State for the main checkout form
  const [formData, setFormData] = useState({
    fullName: '',
    telephone: '',
    province: '',
    city: '',
    subDistrict: '',
    village: '',
    completeAddress: '',
    shippingMethod: '',
    paymentMethod: '',
    shippingCost: 0,
    taxCost: 0,
  });

  // State untuk data dari API wilayah
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState({});
  const [subdistricts, setSubdistricts] = useState({});
  const [villages, setVillages] = useState({});
  
  // State untuk menyimpan nilai tampilan untuk input autocomplete
  const [locationLabels, setLocationLabels] = useState({
    province: '',
    city: '',
    subDistrict: '',
    village: ''
  });
  
  // State untuk loading status API dan koneksi
  const [apiLoadingStatus, setApiLoadingStatus] = useState({
    provinces: false,
    cities: false,
    subdistricts: false,
    villages: false
  });
  // Removed API connection status tracking

  // State for validation errors
  const [formErrors, setFormErrors] = useState({});
  const [productErrors, setProductErrors] = useState({});
  
  // Create refs for various form sections
  const productFormRef = useRef(null);
  
  // State for loading and submission state
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Create a ref to scroll to the success message section.
  const successRef = useRef(null);
  const cartRef = useRef(null);
  
  // URL API endpoint - mudah untuk diubah jika perlu
  const API_ENDPOINTS = {
    PRODUCTION: 'http://service.jashujanextrime.my.id',
    LOCAL: 'http://localhost:8000',
    TEST: 'http://localhost:8000',
    // Tambahkan endpoint lainnya jika perlu
  };
  
  // Membuat base API URL dinamis untuk mengatasi masalah port forwarding
  const getApiBaseUrl = () => {
    // Deteksi development environment untuk menggunakan local API secara default
    if (window.location.hostname === 'localhost') {
      // Gunakan local API untuk development
      console.log('Development environment detected, using local API by default');
      const LOCAL_API_URL = API_ENDPOINTS.LOCAL;
      
      // Gunakan URL API dari sessionStorage jika ada
      const storedApiUrl = window.sessionStorage.getItem('API_BASE_URL');
      if (storedApiUrl) {
        console.log('Using stored API URL:', storedApiUrl);
        return storedApiUrl;
      }
      
      return LOCAL_API_URL;
    }
    
    // Production environment - default ke production API
    const DEFAULT_API_URL = API_ENDPOINTS.PRODUCTION;
    
    // Deteksi berdasarkan URL parameter (untuk debugging dan pengujian)
    const urlParams = new URLSearchParams(window.location.search);
    const apiUrlParam = urlParams.get('api_url');
    if (apiUrlParam) {
      console.log('Using API URL from query parameter:', apiUrlParam);
      return apiUrlParam;
    }
    
    // Gunakan URL API dari sessionStorage jika ada
    const storedApiUrl = window.sessionStorage.getItem('API_BASE_URL');
    if (storedApiUrl) {
      console.log('Using stored API URL:', storedApiUrl);
      return storedApiUrl;
    }
    
    // Default menggunakan URL yang sudah ditentukan
    console.log('Using default API URL:', DEFAULT_API_URL);
    return DEFAULT_API_URL;
    
    // Cek apakah sedang mengakses dari domain produksi
    if (window.location.hostname.includes('jashujanextrime.my.id')) {
      console.log('Accessing from production domain, using production API URL');
      return productionApiUrl;
    }
    
    // Jika mengakses dari localhost, gunakan localhost:8000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Ketika testing, kita ingin tetap menggunakan server produksi
      return 'http://localhost:8000';
    }
    
    // Jika mengakses melalui port forwarding dari ngrok, cloudflared, dll
    if (window.location.hostname.includes('ngrok.io') || 
        window.location.hostname.includes('trycloudflare.com') ||
        window.location.hostname.includes('serveo.net')) {
      // Untuk layanan tunnel seperti ngrok, gunakan URL yang sama
      // karena biasanya forwarding sudah diatur
      return window.location.origin;
    }
    
    // Port forwarding melalui SSH (biasanya menggunakan port yang berbeda)
    // Coba deteksi port backend dari URL saat ini
    const currentPort = window.location.port;
    if (currentPort && currentPort !== '80' && currentPort !== '443') {
      // Jika sudah menggunakan port non-standar, mungkin ada port forwarding aktif
      // Coba akses backend di port yang sama
      return window.location.origin;
    }
    
    // Default fallback ke API produksi
    console.log('No specific match found, defaulting to production API URL');
    return productionApiUrl;
  };
  
  const API_BASE_URL = getApiBaseUrl();
  
  // Log untuk debugging
  console.log('Current hostname:', window.location.hostname);
  console.log('Current origin:', window.location.origin);
  console.log('API Base URL being used:', API_BASE_URL);
  
  // Fungsi untuk fetch data provinsi
  const fetchProvinces = async () => {
    try {
      setApiLoadingStatus(prev => ({ ...prev, provinces: true }));
      console.log(`Fetching provinces from: ${API_BASE_URL}/api/v1/wilayah/provinsi`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/wilayah/provinsi`, {
        // Tambahkan headers untuk membantu menangani CORS
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Mode untuk handling CORS - omit untuk lebih baik dengan server produksi
        // yang tidak memerlukan credential
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Provinces data received:', data.length, 'provinces');
      
      setProvinces(data.map(province => ({
        id: province.id,
        name: province.name
      })));
      
      // Koneksi berhasil
      console.log('API connection successful');
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Tambahkan pesan error yang lebih informatif
      if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        console.error('Network error - Possible CORS issue or server not accessible');
        console.error('Current hostname:', window.location.hostname);
        console.error('API Base URL being used:', API_BASE_URL);
        
        console.error('Network error - Tidak dapat terhubung ke API.');
        
        // Tampilkan error sederhana
        alert('Tidak dapat terhubung ke server. Mohon periksa koneksi internet Anda.');
      } else {
        console.error('API error:', error.message);
      }
    } finally {
      setApiLoadingStatus(prev => ({ ...prev, provinces: false }));
    }
  };

  // Fungsi untuk fetch data kota berdasarkan provinsi
  const fetchCities = async (provinsiId) => {
    if (!provinsiId) return;
    
    try {
      setApiLoadingStatus(prev => ({ ...prev, cities: true }));
      console.log(`Fetching cities for province ID: ${provinsiId} from: ${API_BASE_URL}/api/v1/wilayah/kota?provinsi_id=${provinsiId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/wilayah/kota?provinsi_id=${provinsiId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Cities data received:', data.length, 'cities for province ID', provinsiId);
      
      setCities(prevCities => ({
        ...prevCities,
        [provinsiId]: data.map(city => ({
          id: city.id,
          name: city.name
        }))
      }));
    } catch (error) {
      console.error('Error fetching cities:', error);
      
      if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        console.error('Network error - Possible CORS issue or server not accessible');
        console.error('Current hostname:', window.location.hostname);
        console.error('API Base URL being used:', API_BASE_URL);
        console.error('Province ID being used:', provinsiId);
      }
    } finally {
      setApiLoadingStatus(prev => ({ ...prev, cities: false }));
    }
  };

  // Fungsi untuk fetch data kecamatan berdasarkan kota
  const fetchSubdistricts = async (kotaId) => {
    if (!kotaId) return;
    
    try {
      setApiLoadingStatus(prev => ({ ...prev, subdistricts: true }));
      console.log(`Fetching subdistricts for city ID: ${kotaId} from: ${API_BASE_URL}/api/v1/wilayah/kecamatan?kota_id=${kotaId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/wilayah/kecamatan?kota_id=${kotaId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Subdistricts data received:', data.length, 'subdistricts for city ID', kotaId);
      
      setSubdistricts(prevSubdistricts => ({
        ...prevSubdistricts,
        [kotaId]: data.map(subdistrict => ({
          id: subdistrict.id,
          name: subdistrict.name
        }))
      }));
    } catch (error) {
      console.error('Error fetching subdistricts:', error);
      
      if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        console.error('Network error - Possible CORS issue or server not accessible');
        console.error('Current hostname:', window.location.hostname);
        console.error('API Base URL being used:', API_BASE_URL);
        console.error('City ID being used:', kotaId);
      }
    } finally {
      setApiLoadingStatus(prev => ({ ...prev, subdistricts: false }));
    }
  };

  // Fungsi untuk fetch data desa berdasarkan kecamatan
  const fetchVillages = async (kecamatanId) => {
    if (!kecamatanId) return;
    
    try {
      setApiLoadingStatus(prev => ({ ...prev, villages: true }));
      console.log(`Fetching villages for subdistrict ID: ${kecamatanId} from: ${API_BASE_URL}/api/v1/wilayah/desa?kecamatan_id=${kecamatanId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/wilayah/desa?kecamatan_id=${kecamatanId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Villages data received:', data.length, 'villages for subdistrict ID', kecamatanId);
      
      setVillages(prevVillages => ({
        ...prevVillages,
        [kecamatanId]: data.map(village => ({
          id: village.id,
          name: village.name
        }))
      }));
    } catch (error) {
      console.error('Error fetching villages:', error);
      
      if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        console.error('Network error - Possible CORS issue or server not accessible');
        console.error('Current hostname:', window.location.hostname);
        console.error('API Base URL being used:', API_BASE_URL);
        console.error('Subdistrict ID being used:', kecamatanId);
      }
    } finally {
      setApiLoadingStatus(prev => ({ ...prev, villages: false }));
    }
  };
  
  // Function to set API URL manually (untuk development/debugging)
  const changeApiUrl = (url) => {
    // Simpan URL API di sessionStorage
    window.sessionStorage.setItem('API_BASE_URL', url);
    console.log('API URL changed to:', url);
    
    // Reload halaman untuk menerapkan perubahan
    window.location.reload();
  };
  
  // Fetch provinces on component mount
  useEffect(() => {
    // Tampilkan API URL yang sedang digunakan di console (debugging)
    console.log('Current API URL:', API_BASE_URL);
    
    fetchProvinces();
    
    // Implementasi fallback jika API pertama gagal
    const fallbackTimer = setTimeout(() => {
      console.log('Checking API connection...');
      
      // Coba alternatif URL jika koneksi awal gagal
      const tryFallbackUrls = async () => {
        // Array dari URL fallback yang akan dicoba secara berurutan
        const fallbackUrls = [
          // 1. Coba dengan URL produksi (prioritas tertinggi)
          'http://service.jashujanextrime.my.id',
          // 2. Coba dengan URL tanpa protokol (untuk fleksibilitas)
          `//${window.location.hostname}/api/v1`,
          // 3. Coba dengan URL tanpa port
          `${window.location.protocol}//${window.location.hostname}`,
          // 4. Coba dengan URL origin (jika ada port)
          window.location.origin
        ];
        
        for (const fallbackUrl of fallbackUrls) {
          try {
            console.log('Trying fallback URL:', fallbackUrl);
            
            const response = await fetch(`${fallbackUrl}/api/v1/wilayah/provinsi`, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              mode: 'cors',
              cache: 'no-cache',
              // Timeout lebih singkat untuk fallback
              signal: AbortSignal.timeout(5000) 
            });
            
            if (response.ok) {
              console.log('Fallback URL successful!', fallbackUrl);
              // Update API base URL dengan yang berhasil
              window.sessionStorage.setItem('API_BASE_URL', fallbackUrl);
              window.location.reload(); // Reload untuk menggunakan URL baru
              return; // Keluar dari loop jika berhasil
            }
          } catch (error) {
            console.error(`Fallback attempt failed for ${fallbackUrl}:`, error);
            // Lanjutkan ke URL berikutnya
          }
        }
        
        console.error('All fallback attempts failed');
      };
      
      // Cek koneksi API dan gunakan fallback jika perlu
      fetch(`${API_BASE_URL}/api/v1/wilayah/provinsi`)
        .then(response => {
          if (response.ok) {
            console.log('API connection working correctly');
          } else {
            console.log('API connection failed with status:', response.status);
            tryFallbackUrls();
          }
        })
        .catch(error => {
          console.log('API connection failed:', error);
          tryFallbackUrls();
        });
        
    }, 3000); // Tunggu 3 detik sebelum mencoba fallback
    
    return () => clearTimeout(fallbackTimer);
  }, []); // No dependencies needed
  
  // Fetch cities when province changes
  useEffect(() => {
    if (formData.province) {
      fetchCities(formData.province);
    }
  }, [formData.province]);
  
  // Fetch subdistricts when city changes
  useEffect(() => {
    if (formData.city) {
      fetchSubdistricts(formData.city);
    }
  }, [formData.city]);
  
  // Fetch villages when subdistrict changes
  useEffect(() => {
    if (formData.subDistrict) {
      fetchVillages(formData.subDistrict);
    }
  }, [formData.subDistrict]);

  // Calculate prices dynamically based on state with useMemo for better performance.
  const { subtotal, discount, handlingFee, total } = useMemo(() => {
    const subtotalValue = cartItems.reduce((acc, item) => acc + productPrice * item.quantity, 0);
    const discountValue = subtotalValue * discountRate;
    const handlingFeeValue = 0; // Assuming no handling fee for now
    const totalValue = subtotalValue - discountValue + formData.shippingCost + formData.taxCost + handlingFeeValue;
    
    return {
      subtotal: subtotalValue,
      discount: discountValue,
      handlingFee: handlingFeeValue,
      total: totalValue
    };
  }, [cartItems, productPrice, discountRate, formData.shippingCost, formData.taxCost]);

  // Function to format currency to IDR.
  const formatRupiah = useCallback((amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);
  
  // Function to get location label from ID
  const getLocationLabel = useCallback((type, id) => {
    if (!id) return '';
    
    switch (type) {
      case 'province':
        const province = provinces.find(p => p.id === id);
        return province ? province.name : '';
      case 'city':
        if (!formData.province || !cities[formData.province]) return '';
        const city = cities[formData.province].find(c => c.id === id);
        return city ? city.name : '';
      case 'subDistrict':
        if (!formData.city || !subdistricts[formData.city]) return '';
        const subDistrict = subdistricts[formData.city].find(sd => sd.id === id);
        return subDistrict ? subDistrict.name : '';
      case 'village':
        if (!formData.subDistrict || !villages[formData.subDistrict]) return '';
        const village = villages[formData.subDistrict].find(v => v.id === id);
        return village ? village.name : '';
      default:
        return '';
    }
  }, [provinces, cities, subdistricts, villages, formData.province, formData.city, formData.subDistrict]);

  // Handler for the product selection form input changes with validation
  const handleProductSelectionChange = useCallback((e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when it's being edited
    if (productErrors[name]) {
      setProductErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [productErrors]);

  // Handler for the quantity change on the current product
  const handleQuantityChange = useCallback((change) => {
    setCurrentProduct((prev) => ({
      ...prev,
      quantity: Math.max(1, Math.min(99, prev.quantity + change)), // Add max limit to prevent unreasonably large quantities
    }));
  }, []);

  // Validate product selection before adding to cart
  const validateProductSelection = useCallback(() => {
    const errors = {};
    
    if (!currentProduct.size) {
      errors.size = 'Ukuran wajib dipilih';
    }
    
    if (!currentProduct.color) {
      errors.color = 'Warna wajib dipilih';
    }
    
    if (currentProduct.quantity < 1) {
      errors.quantity = 'Jumlah minimal 1';
    }
    
    setProductErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentProduct]);

  // Function to display toast notifications
  const showToast = useCallback((message, type = 'error') => {
    const toast = document.createElement('div');
    
    // Set base classes with proper styling
    const baseClasses = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 py-3 px-6 rounded-md shadow-lg flex items-center gap-3 transition-all duration-300 animate-fade-in max-w-md';
    
    // Set color based on type
    const typeClasses = 
      type === 'error' ? 'bg-white border-l-4 border-red-500 text-gray-700' : 
      type === 'success' ? 'bg-white border-l-4 border-green-500 text-gray-700' : 
      'bg-white border-l-4 border-blue-500 text-gray-700';
    
    toast.className = `${baseClasses} ${typeClasses}`;
    
    // Icon based on type
    const icon = type === 'error' 
      ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>'
      : type === 'success' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';
    
    toast.innerHTML = `
      ${icon}
      <p class="font-medium">${message}</p>
    `;
    
    document.body.appendChild(toast);
    
    // Fade in effect
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }, []);

  // Handler for adding the current product selection to the cart
  const handleAddProduct = useCallback(() => {
    const isValid = validateProductSelection();
    
    if (isValid) {
      setCartItems((prevItems) => [...prevItems, { ...currentProduct, id: Date.now() }]);
      // Reset the product selection form
      setCurrentProduct({
        size: '',
        color: '',
        quantity: 1,
      });
      
      // Show success message
      showToast('Produk berhasil ditambahkan ke keranjang', 'success');
      
      // Scroll to cart if it exists
      if (cartRef.current) {
        setTimeout(() => {
          cartRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [currentProduct, validateProductSelection, showToast]);

  // Handler for removing an item from the cart with animation
  const handleRemoveItem = useCallback((id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  // Handler for main checkout form input changes with improved validation.
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Handle special case for telephone: ensure it starts with 08 and contains only numbers
    if (name === 'telephone') {
      // Remove non-numeric characters
      const numericValue = value.replace(/\D/g, '');
      
      // Ensure it starts with 08
      let formattedValue;
      if (numericValue.startsWith('62')) {
        formattedValue = '0' + numericValue.substring(2); // Convert 62xxx to 0xxx
      } else if (!numericValue.startsWith('0') && numericValue !== '') {
        formattedValue = '0' + numericValue; // Add leading 0 if not present
      } else {
        formattedValue = numericValue; // Keep as is if already starts with 0 or empty
      }
      
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedValue
      }));
      
      return;
    }
    
    // Handle all other fields
    setFormData((prevData) => {
      let newFormData = { ...prevData, [name]: value };

      // Logic to set shipping and tax costs based on the selected shipping method.
      if (name === 'shippingMethod') {
        if (['J&T Express', 'JNE', 'SiCepat'].includes(value)) {
          newFormData.shippingCost = 19000;
          newFormData.taxCost = 5000;
        } else if (value === 'Express Shipping') {
          newFormData.shippingCost = 35000;
          newFormData.taxCost = 8000;
        } else if (value === 'Same Day Delivery') {
          newFormData.shippingCost = 50000;
          newFormData.taxCost = 10000;
        } else {
          newFormData.shippingCost = 0;
          newFormData.taxCost = 0;
        }
      }

      // Clear dependent location fields when a higher-level field changes.
      if (name === 'province') {
        newFormData = { ...newFormData, city: '', subDistrict: '', village: '' };
        
        // Update location label for province and reset other location labels
        setLocationLabels(prev => ({
          ...prev,
          province: getLocationLabel('province', value),
          city: '',
          subDistrict: '',
          village: ''
        }));
        
        // Fetch cities for the selected province
        if (value) {
          fetchCities(value);
        }
      } else if (name === 'city') {
        newFormData = { ...newFormData, subDistrict: '', village: '' };
        
        // Update location label for city and reset dependent fields
        setLocationLabels(prev => ({
          ...prev,
          city: getLocationLabel('city', value),
          subDistrict: '',
          village: ''
        }));
        
        // Fetch subdistricts for the selected city
        if (value) {
          fetchSubdistricts(value);
        }
      } else if (name === 'subDistrict') {
        newFormData = { ...newFormData, village: '' };
        
        // Update location label for subDistrict and reset village
        setLocationLabels(prev => ({
          ...prev,
          subDistrict: getLocationLabel('subDistrict', value),
          village: ''
        }));
        
        // Fetch villages for the selected subdistrict
        if (value) {
          fetchVillages(value);
        }
      } else if (name === 'village') {
        // Update location label for village
        setLocationLabels(prev => ({
          ...prev,
          village: getLocationLabel('village', value)
        }));
      }
      
      // Clear error for this field when it's being edited
      if (formErrors[name]) {
        setFormErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[name];
          return newErrors;
        });
      }
      
      return newFormData;
    });
  }, [formErrors]);

  // Function to validate form with specific error messages
  const validateForm = useCallback(() => {
    const errors = {};
    const requiredFields = [
      'fullName',
      'telephone',
      'province',
      'city',
      'subDistrict',
      'village',
      'completeAddress',
      'shippingMethod',
      'paymentMethod',
    ];
    
    // Check for empty required fields
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'Bidang ini wajib diisi';
      }
    });

    // Validate phone number format (starts with 08 as requested)
    if (formData.telephone && !/^08[0-9]{0,12}$/.test(formData.telephone.replace(/\s+/g, ''))) {
      errors.telephone = 'Format nomor telepon tidak valid (harus dimulai dengan angka 08)';
    }
    
    // Validate cart has items
    if (cartItems.length === 0) {
      errors.cart = 'Keranjang belanja tidak boleh kosong';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, cartItems]);

  // Effect to validate the form and enable/disable the button.
  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [formData, cartItems, validateForm]);

  // Effect to scroll to the success message after the order is placed.
  useEffect(() => {
    if (orderPlaced && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [orderPlaced]);
  
  // Effect to prepare focus management for accessibility
  useEffect(() => {
    return () => {
      // Cleanup function if needed
    };
  }, []);

  // Handle buy button click with loading state and validation.
  const handleBuy = useCallback(async () => {
    // Force validation to show any errors
    const isValid = validateForm();
    
    if (isValid) {
      try {
        setIsSubmitting(true);
        
        // Simulate API call - in real implementation, this would be an API request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Order success
        setOrderPlaced(true);
      } catch (error) {
        console.error('Error processing order:', error);
        alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Scroll to the first error field
      const errorFieldNames = Object.keys(formErrors);
      if (errorFieldNames.length > 0) {
        const firstErrorField = errorFieldNames[0];
        
        // Find element by ID or name attribute
        const errorElement = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`);
        if (errorElement) {
          // Scroll to error element with some offset to make it visible
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
          
          // Show toast notification
          const fieldName = firstErrorField.replace(/([A-Z])/g, ' $1').toLowerCase();
          showToast(`Harap lengkapi bidang "${fieldName}" yang masih kosong`, 'error');
        } else if (firstErrorField === 'cart') {
          // If cart is empty, scroll to the product selection form
          if (productFormRef.current) {
            productFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showToast('Silakan pilih produk terlebih dahulu', 'info');
          }
        }
      }
    }
  }, [validateForm, formErrors]);

  // Handler to reset the state for "Belanja Lagi" button
  const handleBackToForm = useCallback(() => {
    // Reset all state
    setOrderPlaced(false);
    setCartItems([]);
    setFormErrors({});
    setProductErrors({});
    
    setFormData({
      fullName: '',
      telephone: '',
      province: '',
      city: '',
      subDistrict: '',
      village: '',
      completeAddress: '',
      shippingMethod: '',
      paymentMethod: '',
      shippingCost: 0,
      taxCost: 0,
    });
    
    setCurrentProduct({
      size: '',
      color: '',
      quantity: 1,
    });
    
    // Scroll back to the top of the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Get the image URL for the currently selected product, memoized for performance
  const getProductImage = useMemo(() => {
    const selectedProduct = productData.find((p) => p.color === currentProduct.color);
    return selectedProduct ? selectedProduct.image : 'https://placehold.co/220x250/D2E1C9/4A5746?text=Pilih+Warna';
  }, [currentProduct.color]);

  // Render the main form and the optional success message.
  return (
    <ErrorBoundary>
      <div className="rounded-xl font-sans on-a">
        {orderPlaced ? (
          <div ref={successRef} className="success-message-container animate__animated animate__fadeIn w-full mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Success Icon */}
            <div className="success-header flex items-center justify-center">
              <div className="success-icon w-16 h-16 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
                  <path d="m9.707 11.293-2-2-1.414 1.414L9.707 14.121l8.014-8.016-1.414-1.414z"></path>
                </svg>
              </div>
            </div>

            {/* Order Number */}
            <div className="text-center pt-4 px-6">
              <p className="text-gray-800 font-medium text-sm">Order #ES{Math.floor(Math.random() * 100000)}</p>
            </div>

            {/* Main Heading */}
            <div className="text-center px-6 pb-2">
              <h1 className="text-3xl font-bold text-gray-800">
                Pembelian Berhasil!
              </h1>
            </div>

            {/* Subheading */}
            <div className="text-center px-6 pb-5">
              <p className="text-gray-600 text-sm">
                Terima kasih telah memilih Jas Hujan Extrime, teman setia perjalanan Anda di segala cuaca!
              </p>
            </div>

            {/* Order Details Card */}
            <div className="px-6">
              <div className="success-order-details py-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Informasi Pesanan</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1.5 text-gray-600">Nama:</td>
                      <td className="py-1.5 text-right font-medium text-gray-800">{formData.fullName}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-gray-600">Total Harga:</td>
                      <td className="py-1.5 text-right font-bold text-green-600">{formatRupiah(total)}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-gray-600">Metode Pembayaran:</td>
                      <td className="py-1.5 text-right font-medium text-gray-800">Transfer Bank, E-Wallet, Virtual Account</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-gray-600">Pengiriman:</td>
                      <td className="py-1.5 text-right font-medium text-gray-800">J&T Express</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative mx-auto px-6 py-5">
              <div className="new-badge absolute top-2 left-2 z-10 rounded-full flex items-center justify-center shadow-md">
                <span className="font-bold text-white text-sm">New!</span>
              </div>
              <div className="w-full relative overflow-hidden rounded-lg">
                <img 
                  src={Testi} 
                  alt="Product" 
                  className="success-product-image" 
                />
              </div>
            </div>

            {/* Shop Again Button */}
            <div className="px-6 pb-6">
              <button
                onClick={handleBackToForm}
                className="success-button w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} />
                <span>Belanja Lagi</span>
              </button>
            </div>
            
            {/* Footer with link */}
            <div className="flex justify-center w-full p-3 border-t border-gray-100 bg-gray-50">
              <a 
                href="#" 
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Cek status pesanan
              </a>
            </div>
          </div>
        ) : (
          <div className="gap-8 lg:gap-16 mt-8">
            {/* Left Section: Product Selection and Shipping Form */}
            <div className="space-y-10">
              {/* Product Selection Card */}
              <div className="Pil-Ap" ref={productFormRef}>
                <h2 className="text-2xl font-bold mb-6 text-black li-on text-center">Pilih Produk</h2>
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-8 on-a1">
                  <div className="w-full md:w-auto flex justify-center md:justify-start">
                    <img
                      src={getProductImage}
                      alt={currentProduct.color ? `Jas Hujan ${currentProduct.color}` : "Pilih Warna Jas Hujan"}
                      className="w-[220px] h-[250px] rounded-lg object-cover shadow-md flex-shrink-0 ig-1 transition-all duration-300 on-v"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/150x200/A0D8B3/333?text=Product+Image';
                        e.target.alt = 'Placeholder Image';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-4 w-full on-9">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectInput
                        label="Size"
                        name="size"
                        value={currentProduct.size}
                        options={sizeOptions}
                        onChange={handleProductSelectionChange}
                        placeholder="Pilih Ukuran"
                        required
                        error={productErrors.size}
                      />
                      <SelectInput
                        label="Warna"
                        name="color"
                        value={currentProduct.color}
                        options={productData.map((p) => p.color)}
                        onChange={handleProductSelectionChange}
                        placeholder="Pilih Warna"
                        required
                        error={productErrors.color}
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-medium text-black mb-1.5 on-a2">
                        Jumlah
                      </label>
                      <div className="flex items-center gap-2 on-a3">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="p-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          aria-label="Kurangi jumlah"
                          disabled={currentProduct.quantity <= 1}
                          type="button"
                        >
                          <Minus size={20} />
                        </button>
                        <span className="text-lg font-semibold min-w-[40px] text-center text-black">
                          {currentProduct.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="p-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
                          aria-label="Tambah jumlah"
                          type="button"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      {productErrors.quantity && (
                        <p className="mt-1 text-xs text-gray-500">{productErrors.quantity}</p>
                      )}
                    </div>
                    <button
                      onClick={handleAddProduct}
                      type="button"
                      className={`w-full h-12 py-4 px-6 font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center text-lg
                                  ${
                                    currentProduct.size && currentProduct.color
                                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                      style={{
                        boxShadow: currentProduct.size && currentProduct.color ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none'
                      }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <ShoppingBag size={22} />
                        <span>Tambah ke Keranjang</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping Details Form Card */}
              <div className="mt-8 det-ap">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-bold text-black on-a4 text-center">Detail Pengiriman</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 on-10">
                  <TextInput
                    label="Nama Lengkap"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                    error={formErrors.fullName}
                  />
                  <div>
                    <TextInput
                      label="Nomor Telepon"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      placeholder="081234567890"
                      required
                      error={formErrors.telephone}
                    />
                    {!formErrors.telephone && (
                      <p className="text-xs text-gray-500 mt-1">Contoh: 081234567890 (harus dimulai dengan 08)</p>
                    )}
                  </div>
                  <AutocompleteInput
                    label="Provinsi"
                    name="province"
                    value={locationLabels.province || getLocationLabel('province', formData.province)}
                    options={provinces}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama provinsi"
                    required
                    error={formErrors.province}
                    isLoading={apiLoadingStatus.provinces}
                  />
                  <AutocompleteInput
                    label="Kota/Kabupaten"
                    name="city"
                    value={locationLabels.city || getLocationLabel('city', formData.city)}
                    options={formData.province ? cities[formData.province] || [] : []}
                    onChange={handleInputChange}
                    placeholder={!formData.province ? "Isi provinsi dulu" : "Masukkan nama kota/kabupaten"}
                    required
                    disabled={!formData.province}
                    error={formErrors.city}
                    isLoading={apiLoadingStatus.cities}
                  />
                  <AutocompleteInput
                    label="Kecamatan"
                    name="subDistrict"
                    value={locationLabels.subDistrict || getLocationLabel('subDistrict', formData.subDistrict)}
                    options={formData.city ? subdistricts[formData.city] || [] : []}
                    onChange={handleInputChange}
                    placeholder={!formData.city ? "Isi kota dulu" : "Masukkan nama kecamatan"}
                    required
                    disabled={!formData.city}
                    error={formErrors.subDistrict}
                    isLoading={apiLoadingStatus.subdistricts}
                  />
                  <AutocompleteInput
                    label="Desa/Kelurahan"
                    name="village"
                    value={locationLabels.village || getLocationLabel('village', formData.village)}
                    options={formData.subDistrict ? villages[formData.subDistrict] || [] : []}
                    onChange={handleInputChange}
                    placeholder={!formData.subDistrict ? "Isi kecamatan dulu" : "Masukkan nama desa/kelurahan"}
                    required
                    disabled={!formData.subDistrict}
                    error={formErrors.village}
                    isLoading={apiLoadingStatus.villages}
                  />
                </div>
                <div className="mt-6 on-10">
                  <div className="flex flex-col">
                    <label htmlFor="completeAddress" className="block text-sm font-medium text-black al-1 mb-1.5">
                      Alamat Lengkap {formErrors.completeAddress && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      id="completeAddress"
                      name="completeAddress"
                      rows="3"
                      value={formData.completeAddress}
                      onChange={handleInputChange}
                      placeholder="Jl. Contoh No. 123 atau Gang Bunga 123"
                      className={`w-full h-[160px] p-3 border ${formErrors.completeAddress ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base text-black al-11`}
                      required
                      aria-invalid={formErrors.completeAddress ? "true" : "false"}
                      aria-describedby={formErrors.completeAddress ? "completeAddress-error" : undefined}
                    ></textarea>
                    {formErrors.completeAddress && (
                      <p id="completeAddress-error" className="mt-1 text-xs text-red-500">{formErrors.completeAddress}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping and Payment Methods Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 met-ap on-10">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-black">Metode Pengiriman</h2>
                  <SelectInput
                    label=""
                    name="shippingMethod"
                    value={formData.shippingMethod}
                    options={shippingMethods}
                    onChange={handleInputChange}
                    placeholder="Pilih Metode Pengiriman"
                    required
                    error={formErrors.shippingMethod}
                  />
                  {formData.shippingMethod && (
                    <div className="mt-3 text-sm">
                      <p className="text-gray-600">Biaya: {formatRupiah(formData.shippingCost)}</p>
                      <p className="text-gray-600">Estimasi: {
                        formData.shippingMethod === 'Same Day Delivery' ? '1 hari' :
                        formData.shippingMethod === 'Express Shipping' ? '2-3 hari' : '3-7 hari'
                      }</p>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-black">Metode Pembayaran</h2>
                  <SelectInput
                    label=""
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    options={paymentMethods.map((method) => method.label)}
                    onChange={handleInputChange}
                    placeholder="Pilih Metode Pembayaran"
                    required
                    error={formErrors.paymentMethod}
                  />
                  {formData.paymentMethod && (
                    <div className="mt-3 text-sm">
                      <p className="text-gray-600">{
                        formData.paymentMethod.includes('COD') ? 
                        'Pembayaran dilakukan saat barang diterima' : 
                        'Lakukan pembayaran setelah checkout'
                      }</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section: Order Summary Card */}
            <div className="lg:self-start lg:sticky lg:top-8">
              <h2 className="text-2xl font-bold text-black text-center mb-6 on-bo">Ringkasan Pesanan</h2>
              <div className="rounded-xl shadow-lg on-b">
                {/* Cart Items List */}
                <div className="pb-10 border-b on-b1" ref={cartRef}>
                  {cartItems.length > 0 ? (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg shadow-sm on-b2 transition-all duration-200 hover:shadow-md">
                          <img
                            src={
                              productData.find((p) => p.color === item.color)?.image ||
                              'https://placehold.co/100x120/A0D8B3/333?text=Item'
                            }
                            alt={`Jas Hujan ${item.color}`}
                            className="w-24 h-auto rounded-lg object-cover on-b21"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/100x120/A0D8B3/333?text=Item';
                              e.target.alt = 'Placeholder Image';
                            }}
                          />
                          <div className="flex-1 on-b22 sm:text-left">
                            <h4 className="font-semibold text-white text-lg h4">Jas Hujan</h4>
                            <p className="text-white text-sm p">Warna: {item.color}</p>
                            <p className="text-white text-sm p">Ukuran: {item.size}</p>
                            <p className="text-white text-sm p">Jumlah: {item.quantity}</p>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end">
                            <span className="font-bold text-white">
                              {formatRupiah(productPrice * item.quantity)}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 mt-2 p-1 rounded-full hover:bg-red-100 transition-colors flex items-center justify-center"
                              aria-label="Hapus item"
                              type="button"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg on-b6 transition-colors duration-300">
                      <p className="text-black italic mb-2">
                        Keranjang belanja Anda kosong. Tambahkan produk di atas.
                      </p>
                      {formErrors.cart && (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center text-gray-600 gap-1 mt-2 bg-gray-100 px-4 py-2 rounded-lg">
                            <p>{formErrors.cart}</p>
                          </div>
                          <button 
                            onClick={() => productFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="w-full h-12 mt-3 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                            type="button"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span>Pilih Produk</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 my-6">
                  <div className="flex justify-between text-lg text-black on-b3">
                    <span className="text-1xl">Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg text-red-500 on-b3">
                    <span className="text-1xl">Diskon</span>
                    <span className="line-through">{formatRupiah(discount)}</span>
                  </div>
                  <div className="flex justify-between text-lg text-black on-b3">
                    <span className="text-1xl">Biaya Pengiriman</span>
                    <span>{formatRupiah(formData.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-lg text-black on-b3">
                    <span className="text-1xl">Biaya Penanganan</span>
                    <span>{formatRupiah(handlingFee)}</span>
                  </div>
                  <div className="flex justify-between text-lg text-black on-b3">
                    <span className="text-1xl">Pajak</span>
                    <span>{formData.taxCost > 0 ? formatRupiah(formData.taxCost) : 'N/A'}</span>
                  </div>
                </div>

                {/* Total price */}
                <div className="flex justify-between items-center pt-4 on-b4">
                  <span className="text-2xl font-bold text-black">Total</span>
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {formatRupiah(total)}
                  </span>
                </div>

                {/* Buy Now button */}
                <button
                  onClick={handleBuy}
                  disabled={!isFormValid || isSubmitting}
                  className={`mt-6 w-full py-4 font-bold text-lg md:text-xl rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 on-b5 focus:outline-none focus:ring-2 focus:ring-emerald-400
                                  ${
                                    isFormValid && !isSubmitting
                                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <ShoppingBag size={24} />
                      <span>Beli Pesanan</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;