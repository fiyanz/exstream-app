import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, ShoppingBag, Plus, Minus } from 'lucide-react';
// The following image paths are for demonstration purposes.
// In a real-world application, you would ensure these assets are available.
import Women from '../../assets/Extrime/Cewek/HijauSage/Cewe.jpeg';
import Women1 from '../../assets/Extrime/Cewek/Violet/Cewe.jpeg';
import Women2 from '../../assets/Extrime/Cewek/DustyPink/Cewe.jpeg';
import Women3 from '../../assets/Extrime/Cewek/PInkMuda/Cewe.jpeg';
import men from '../../assets/Extrime/Cowok/One3.jpeg';
import men1 from '../../assets/Extrime/Cowok/One1.jpeg';
import men2 from '../../assets/Extrime/Cowok/One.jpeg';
import men3 from '../../assets/Extrime/Cowok/One2.jpeg';
import men4 from '../../assets/Extrime/Cowok/One4.jpeg';

// Data produk dan opsi.
const productData = [
  { color: 'Hijau Sage', image: Women },
  { color: 'Ungu Violet', image: Women1 },
  { color: 'Dusty Pink', image: Women2 },
  { color: 'Pink Muda', image: Women3 },
  { color: 'Beige / Khaki', image: men },
  { color: 'Navy Blue', image: men1 },
  { color: 'Black', image: men2 },
  { color: 'Army Green', image: men3 },
  { color: 'Red', image: men4 },
];

const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const shippingMethods = ['Standard Shipping', 'Express Shipping', 'Same Day Delivery'];
const paymentMethods = [
  { name: 'transfer', label: 'Transfer Bank, E-Wallet, Virtual Account' },
  { name: 'cod', label: 'COD (Bayar Di Tempat)' },
];

// These will be defined inside the component function

// Komponen Input Dropdown yang dapat digunakan kembali.
const SelectInput = ({ label, name, value, options, onChange, placeholder, required, disabled = false, error }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-gray-700 dark:text-gray-100 dark:disabled:bg-gray-800
        ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
      required={required}
      disabled={disabled}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    >
      <option value="" disabled>{placeholder}</option>
      {Array.isArray(options) ? options.map((option) => (
        <option 
          key={typeof option === 'object' ? option.id || option.value || JSON.stringify(option) : option} 
          value={typeof option === 'object' ? option.id || option.value || option.name : option}
        >
          {typeof option === 'object' ? option.name || option.label : option}
        </option>
      )) : null}
    </select>
    {error && (
      <span id={`${name}-error`} className="text-red-500 text-xs mt-1">{error}</span>
    )}
  </div>
);

// Komponen Input Teks yang dapat digunakan kembali.
const TextInput = ({ label, name, value, onChange, placeholder, type = 'text', required, error }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base transition-colors duration-200 dark:bg-gray-700 dark:text-gray-100
        ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
      required={required}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {error && <span id={`${name}-error`} className="text-red-500 text-xs mt-1">{error}</span>}
  </div>
);

// Komponen utama aplikasi.
const App = () => {
  const [formData, setFormData] = useState({
    size: '',
    color: '',
    quantity: 1,
    fullName: '',
    telephone: '',
    email: '',
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

  const [formErrors, setFormErrors] = useState({});
  const [productImage, setProductImage] = useState(
    'https://placehold.co/150x200/d2e1c9/4a5746?text=Pilih+Warna'
  );
  const [isFormValid, setIsFormValid] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State untuk menyimpan data lokasi dari API
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Perhitungan harga menggunakan useMemo untuk optimasi performa.
  const { subtotal, discount, total } = useMemo(() => {
    const subtotalValue = 299000 * formData.quantity;
    const discountValue = subtotalValue * 0.5;
    const totalValue = subtotalValue - discountValue + formData.shippingCost + formData.taxCost;
    return { subtotal: subtotalValue, discount: discountValue, total: totalValue };
  }, [formData.quantity, formData.shippingCost, formData.taxCost]);
  
  const handlingFee = 'N/A'; // Sesuai permintaan.
  
  // Fungsi untuk mengambil data provinsi dari API backend.
  const fetchProvinces = useCallback(async () => {
    try {
      setLoadingLocation(true);
      const response = await fetch('http://localhost:8000/api/v1/wilayah/provinsi', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Gagal memuat data provinsi: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setProvinces(data);
      setLoadingLocation(false);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setLoadingLocation(false);
    }
  }, []);

  // Fungsi untuk mengambil data kota berdasarkan provinsi dari API backend.
  const fetchCities = useCallback(async (provinceId) => {
    if (!provinceId) return;
    try {
      setLoadingLocation(true);
      console.log(`Fetching cities for provinceId: ${provinceId}...`);
      const response = await fetch(`http://localhost:8000/api/v1/wilayah/kota?provinsi_id=${provinceId}`);
      console.log('City API response:', response);
      
      if (!response.ok) {
        throw new Error(`Gagal memuat data kota: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Cities data received:', data);
      setCities(data);
      setLoadingLocation(false);
    } catch (error) {
      console.error('Error fetching cities:', error);
      alert(`Gagal memuat data kota: ${error.message}`);
      setLoadingLocation(false);
    }
  }, []);

  // Fungsi untuk mengambil data kecamatan berdasarkan kota dari API backend.
  const fetchSubdistricts = useCallback(async (cityId) => {
    if (!cityId) return;
    try {
      setLoadingLocation(true);
      console.log(`Fetching districts for cityId: ${cityId}...`);
      const response = await fetch(`http://localhost:8000/api/v1/wilayah/kecamatan?kota_id=${cityId}`);
      console.log('District API response:', response);
      
      if (!response.ok) {
        throw new Error(`Gagal memuat data kecamatan: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Districts data received:', data);
      setSubdistricts(data);
      setLoadingLocation(false);
    } catch (error) {
      console.error('Error fetching subdistricts:', error);
      alert(`Gagal memuat data kecamatan: ${error.message}`);
      setLoadingLocation(false);
    }
  }, []);

  // Fungsi untuk mengambil data desa/kelurahan berdasarkan kecamatan dari API backend.
  const fetchVillages = useCallback(async (subdistrictId) => {
    if (!subdistrictId) return;
    try {
      setLoadingLocation(true);
      console.log(`Fetching villages for districtId: ${subdistrictId}...`);
      const response = await fetch(`http://localhost:8000/api/v1/wilayah/desa?kecamatan_id=${subdistrictId}`);
      console.log('Village API response:', response);
      
      if (!response.ok) {
        throw new Error(`Gagal memuat data desa/kelurahan: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Villages data received:', data);
      setVillages(data);
      setLoadingLocation(false);
    } catch (error) {
      console.error('Error fetching villages:', error);
      alert(`Gagal memuat data desa/kelurahan: ${error.message}`);
      setLoadingLocation(false);
    }
  }, []);

  // Fungsi untuk memformat mata uang.
  const formatRupiah = useCallback((amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Validasi form yang lebih komprehensif
  const validateForm = useCallback(() => {
    const errors = {};
    const requiredFields = [
      'size', 'color', 'fullName', 'telephone', 'province', 'city',
      'subDistrict', 'village', 'completeAddress', 'shippingMethod', 'paymentMethod'
    ];
    
    // Validasi field yang wajib diisi
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'Bidang ini wajib diisi';
      }
    });
    
    // Validasi email jika diisi
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Dummy function that returns the phone number as-is (for backward compatibility)
  const standardizePhoneNumber = useCallback((phoneNumber) => {
    return phoneNumber || '';
  }, []);
  
  // Dummy function that returns the phone input as-is (for backward compatibility)
  const formatPhoneInput = useCallback((phone) => {
    return phone;
  }, []);

  // Handler untuk perubahan input form menggunakan useCallback untuk optimasi.
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData((prevData) => {
      let newFormData = {...prevData};
      
      // Tidak ada validasi khusus untuk nomor telepon
      newFormData[name] = value;
      
      // Logika untuk shipping method
      if (name === 'shippingMethod') {
        if (value === 'Standard Shipping') {
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

      // Mengatur ulang pilihan lokasi yang bergantung pada pilihan sebelumnya.
      if (name === 'province') {
        newFormData.city = '';
        newFormData.subDistrict = '';
        newFormData.village = '';
        // Fetch kota/kabupaten berdasarkan provinsi yang dipilih
        if (value) {
          console.log('Selected province ID:', value);
          fetchCities(value);
        } else {
          setCities([]);
        }
      } else if (name === 'city') {
        newFormData.subDistrict = '';
        newFormData.village = '';
        // Fetch kecamatan berdasarkan kota/kabupaten yang dipilih
        if (value) {
          console.log('Selected city ID:', value);
          fetchSubdistricts(value);
        } else {
          setSubdistricts([]);
        }
      } else if (name === 'subDistrict') {
        newFormData.village = '';
        // Fetch desa/kelurahan berdasarkan kecamatan yang dipilih
        if (value) {
          console.log('Selected district ID:', value);
          fetchVillages(value);
        } else {
          setVillages([]);
        }
      }
      
      return newFormData;
    });
    
    // Clear the error for this field when it's being edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [formErrors, fetchCities, fetchSubdistricts, fetchVillages]);

  // Handler untuk perubahan kuantitas dengan useCallback.
  const handleQuantityChange = useCallback((change) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + change)
    }));
  }, []);

  // Efek untuk memuat data provinsi ketika komponen pertama kali dimuat
  useEffect(() => {
    console.log('Component mounted, fetching provinces...');
    fetchProvinces();
  }, [fetchProvinces]);

  // Efek untuk memperbarui gambar produk berdasarkan warna yang dipilih.
  useEffect(() => {
    const selectedProduct = productData.find(p => p.color === formData.color);
    if (selectedProduct) {
      setProductImage(selectedProduct.image || 'https://placehold.co/150x200/A0D8B3/333?text=Product+Image');
    } else {
      setProductImage('https://placehold.co/150x200/A0D8B3/333?text=Pilih+Warna');
    }
  }, [formData.color]);

  // Handler untuk error gambar
  const handleImageError = useCallback((e) => {
    e.target.src = 'https://placehold.co/150x200/A0D8B3/333?text=Product+Image';
    e.target.alt = 'Placeholder Image';
  }, []);

  // Efek untuk validasi form yang lebih komprehensif.
  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [formData, validateForm]);

  // Handle klik tombol "Beli Pesanan" dengan integrasi API.
  const handleBuy = async () => {
    if (!isFormValid) return;
    
    try {
      setLoading(true);
      
      // Validasi form sekali lagi sebelum submit
      const isValid = validateForm();
      if (!isValid) {
        setLoading(false);
        return;
      }
      
      // Log data pesanan yang akan dikirim ke backend
      console.log('Mengirimkan data pesanan ke backend...');
      
      try {
        // Tidak perlu standarisasi nomor telepon lagi
        
        // Kirim data ke backend API
        const response = await fetch('http://localhost:8000/api/v1/transaksi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nama_pengguna: formData.fullName,
            no_telp: formData.telephone,
            alamat: `${formData.completeAddress}, ${formData.village}, ${formData.subDistrict}, ${formData.city}, ${formData.province}`,
            nama_barang: `Premium Extreme Jas Hujan - ${formData.color} (${formData.size})`,
            jumlah_barang: formData.quantity,
            total: total,
            detail_barang: JSON.stringify({
              size: formData.size,
              color: formData.color,
              quantity: formData.quantity,
              price: 299000,
              discount: discount,
              shipping_cost: formData.shippingCost,
              tax: formData.taxCost,
              shipping_method: formData.shippingMethod,
              payment_method: formData.paymentMethod,
              email: formData.email || "" // Add email as part of the detailed information
            })
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Server error:', errorData);
          throw new Error(`Gagal membuat pesanan: ${errorData.detail || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Respons dari backend:', data);
        
        // Jika menggunakan Midtrans Snap, redirect ke halaman pembayaran
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        } else if (data.snap_token) {
          // Jika ingin membuka Snap dalam popup
          window.snap.pay(data.snap_token);
        } else {
          // Tampilkan halaman sukses
          setOrderPlaced(true);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        throw apiError; // Re-throw untuk ditangkap oleh catch di luar
      }
      
    } catch (error) {
      console.error('Error saat membuat pesanan:', error);
      alert('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  // Jika pesanan berhasil, tampilkan pesan konfirmasi.
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-inter p-4 sm:p-6">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <CheckCircle className="text-emerald-500 mx-auto mb-4" size={56} />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Order Sukses!</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
            Terima kasih atas pembelian Anda. Pesanan Anda akan segera kami proses.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
            <p className="font-semibold text-base sm:text-lg dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-600 pb-2">Detail Pesanan:</p>
            <ul className="text-left text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Produk:</span> 
                <span>Premium Extreme Jas Hujan</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Warna:</span>
                <span>{formData.color}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Ukuran:</span>
                <span>{formData.size}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Jumlah:</span>
                <span>{formData.quantity}</span>
              </li>
              <li className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 font-bold">
                <span className="text-gray-800 dark:text-gray-200">Total Harga:</span>
                <span className="text-emerald-500">{formatRupiah(total)}</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Bagian Kiri: Opsi Produk dan Form Pengiriman */}
        <div className="space-y-6 md:space-y-8">
          {/* Header */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-800 dark:text-gray-200">Checkout</h1>

          {/* Kartu Opsi Produk */}
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">Opsi Produk</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 items-end">
              <SelectInput
                label="Size"
                name="size"
                value={formData.size}
                options={sizeOptions}
                onChange={handleInputChange}
                placeholder="Pilih Ukuran"
                required
                error={formErrors.size}
              />
              <SelectInput
                label="Warna"
                name="color"
                value={formData.color}
                options={productData.map(p => p.color)}
                onChange={handleInputChange}
                placeholder="Pilih Warna"
                required
                error={formErrors.color}
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    aria-label="Kurangi jumlah"
                    className="p-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <Minus size={18} aria-hidden="true" />
                  </button>
                  <span className="text-base md:text-lg font-semibold w-10 text-center dark:text-gray-100">{formData.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Tambah jumlah"
                    className="p-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <Plus size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Kartu Detail Pengiriman */}
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">Detail Pengiriman</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <TextInput
                label="Nama Lengkap"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap Anda"
                required
                error={formErrors.fullName}
              />
              <TextInput
                label="Nomor Telepon"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="Masukkan nomor telepon Anda"
                required
                error={formErrors.telephone}
              />
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput
                  label="Provinsi"
                  name="province"
                  value={formData.province}
                  options={provinces}
                  onChange={handleInputChange}
                  placeholder={loadingLocation ? "Loading..." : "Pilih Provinsi"}
                  required
                  disabled={loadingLocation}
                  error={formErrors.province}
                />
                <SelectInput
                  label="Kota/Kabupaten"
                  name="city"
                  value={formData.city}
                  options={cities}
                  onChange={handleInputChange}
                  placeholder={loadingLocation ? "Loading..." : "Pilih Kota/Kabupaten"}
                  required
                  disabled={!formData.province || loadingLocation}
                  error={formErrors.city}
                />
              </div>
              <SelectInput
                label="Kecamatan"
                name="subDistrict"
                value={formData.subDistrict}
                options={subdistricts}
                onChange={handleInputChange}
                placeholder={loadingLocation ? "Loading..." : "Pilih Kecamatan"}
                required
                disabled={!formData.city || loadingLocation}
                error={formErrors.subDistrict}
              />
              <SelectInput
                label="Desa"
                name="village"
                value={formData.village}
                options={villages}
                onChange={handleInputChange}
                placeholder={loadingLocation ? "Loading..." : "Pilih Desa"}
                required
                disabled={!formData.subDistrict || loadingLocation}
                error={formErrors.village}
              />
            </div>
            <div className="mt-4 md:mt-6">
              <label 
                htmlFor="completeAddress" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Alamat Lengkap <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="completeAddress"
                name="completeAddress"
                rows="3"
                value={formData.completeAddress}
                onChange={handleInputChange}
                placeholder="Jl. Contoh No. 123 atau Gang Bunga 123"
                className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base transition-colors duration-200 dark:bg-gray-700 dark:text-gray-100
                  ${formErrors.completeAddress ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                required
                aria-invalid={formErrors.completeAddress ? 'true' : 'false'}
                aria-describedby={formErrors.completeAddress ? 'completeAddress-error' : undefined}
              ></textarea>
              {formErrors.completeAddress && (
                <span id="completeAddress-error" className="text-red-500 text-xs mt-1">{formErrors.completeAddress}</span>
              )}
            </div>
          </div>
          
          {/* Kartu Metode Pengiriman dan Pembayaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">Metode Pengiriman</h2>
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
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">Metode Pembayaran</h2>
              <SelectInput
                label=""
                name="paymentMethod"
                value={formData.paymentMethod}
                options={paymentMethods.map(method => method.label)}
                onChange={handleInputChange}
                placeholder="Pilih Metode Pembayaran"
                required
                error={formErrors.paymentMethod}
              />
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Ringkasan Pesanan */}
        <div className="mt-6 lg:mt-0 lg:sticky lg:top-8 self-start">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">Ringkasan Pesanan</h2>
            
            {/* Info Produk */}
            <div className="flex items-start gap-3 md:gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <img
                src={productImage}
                alt="Jas Hujan"
                className="w-16 md:w-20 h-auto rounded-lg object-cover shadow"
                onError={handleImageError}
              />
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-200">Premium Extreme Jas Hujan</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Ukuran: <span className="font-medium">{formData.size || ' - '}</span></p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Warna: <span className="font-medium">{formData.color || ' - '}</span></p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Jumlah: <span className="font-medium">{formData.quantity}</span></p>
              </div>
            </div>
            
            {/* Rincian Harga */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 text-sm md:text-base">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-red-500">
                <span>Diskon <span className="text-xs bg-red-100 dark:bg-red-900 rounded-full px-2 py-0.5 ml-1 font-semibold">50%</span></span>
                <span className="line-through">{formatRupiah(discount)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Biaya Pengiriman</span>
                <span>{formatRupiah(formData.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Biaya Penanganan</span>
                <span>{handlingFee}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Pajak</span>
                <span>{formData.taxCost > 0 ? formatRupiah(formData.taxCost) : 'N/A'}</span>
              </div>
            </div>
            
            {/* Total Harga */}
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
              <span className="text-lg md:text-xl font-bold">Total</span>
              <span className="text-lg md:text-xl font-extrabold text-emerald-500">{formatRupiah(total)}</span>
            </div>
            
            {/* Tombol "Beli Pesanan" */}
            <button
              onClick={handleBuy}
              disabled={!isFormValid || loading}
              className={`mt-4 md:mt-6 w-full py-3 md:py-4 px-4 font-bold text-base md:text-lg rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                ${isFormValid && !loading
                  ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              aria-busy={loading}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                <>
                  <ShoppingBag size={20} className="md:size-24" />
                  Beli Pesanan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
