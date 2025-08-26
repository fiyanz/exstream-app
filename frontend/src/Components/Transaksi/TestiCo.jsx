import React, { useState, useCallback } from 'react';
import Select from 'react-select';
import { cities } from '../../Data/DataExtrime';
import './Tran.css'
import Testi from '../../assets/image/two.png'

const OrderForm = () => {
  const [products, setProducts] = useState([{ variant: '', quantity: 1 }]);
  const [recipient, setRecipient] = useState({
    name: '',
    whatsapp: '',
    address: '',
    city: null,
  });
  const [shipping, setShipping] = useState({
    carrier: null,
    service: { value: 'ez', label: 'EZ - Rp20.000', price: 20000 }
  });
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  const productVariants = [
    { value: 'black-l', label: 'Black - L', price: 149000 },
    { value: 'black-xl', label: 'Black - XL', price: 149000 },
    { value: 'black-xxl', label: 'Black - XXL', price: 149000 },
    { value: 'navy Blue-l', label: 'Navy Blue - L', price: 149000 },
    { value: 'navy Blue-xl', label: 'Navy Blue - XL', price: 149000 },
    { value: 'navy Blue-xxl', label: 'Navy Blue - XXL', price: 149000 },
    { value: 'army Green-l', label: 'Army Green - L', price: 149000 },
    { value: 'army Green-xl', label: 'Army Green - XL', price: 149000 },
    { value: 'army Green-xxl', label: 'Army Green - XXL', price: 149000 },
    { value: 'beige-l', label: 'Beige - L', price: 149000 },
    { value: 'beige-xl', label: 'Beige - XL', price: 149000 },
    { value: 'beige-xxl', label: 'Beige - XXL', price: 149000 },
    { value: 'dusty Pink-xl', label: 'Dusty Pink - L', price: 149000 },
    { value: 'dusty Pink-xxl', label: 'Dusty Pink - XL', price: 149000 },
    { value: 'dusty Pink-l', label: 'Dusty Pink - XXL', price: 149000 },
    { value: 'hijauSage-l', label: 'HijauSage - L', price: 149000 },
    { value: 'hijauSage-xl', label: 'HijauSage - XL', price: 149000 },
    { value: 'hijauSage-xxl', label: 'HijauSage - XXL', price: 149000 },
    { value: 'pinkMuda-l', label: 'PinkMuda - L', price: 149000 },
    { value: 'pinkMuda-xl', label: 'PinkMuda - XL', price: 149000 },
    { value: 'pinkMuda-xxl', label: 'PinkMuda - XXL', price: 149000 },
    { value: 'ungu Violet-l', label: 'Ungu Violet - L', price: 149000 },
    { value: 'ungu Violet-xl', label: 'Ungu Violet - XL', price: 149000 },
    { value: 'ungu Violet-xxl', label: 'Ungu Violet - XXL', price: 149000 },
    { value: 'red-l', label: 'Red - L', price: 149000 },
    { value: 'red-xl', label: 'Red - XL', price: 149000 },
    { value: 'red-xxl', label: 'Red - XXL', price: 149000 },
  ];

  const shippingCarriers = [
    { value: 'jnt', label: 'J&T Express' },
    { value: 'jne', label: 'JNE' },
    { value: 'sicepat', label: 'SiCepat' },
  ];
  const shippingServices = [
    { value: 'ez', label: 'EZ - Rp20.000', price: 20000 },
    { value: 'reg', label: 'Reguler - Rp25.000', price: 25000 },
  ];

  const paymentOptions = [
    { value: 'cod', label: 'COD (Bayar di Tempat)', fee: 0 },
    { value: 'bank_transfer', label: 'Bank Transfer', fee: 0 },
  ];

  const handleAddProduct = () => {
    setProducts([...products, { variant: '', quantity: 1 }]);
  };

  const handleRemoveProduct = (indexToRemove) => {
    setProducts(products.filter((_, index) => index !== indexToRemove));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleRecipientChange = (field, value) => {
    setRecipient({ ...recipient, [field]: value });
  };

  const handleCityChange = (selectedOption) => {
    handleRecipientChange('city', selectedOption);
  };

  const handleShippingChange = (field, value) => {
    setShipping({ ...shipping, [field]: value });
  };

  const handlePaymentChange = (selectedOption) => {
    setPaymentMethod(selectedOption);
  };

  const formatCityLabel = (option) => {
    if (!option) return null;
    return `${option.province}, ${option.type} ${option.city}, ${option.subdistrict}, ${option.village}`;
  };

  const calculateTotal = () => {
    const subtotal = products.reduce((acc, product) => {
      const variant = productVariants.find(v => v.value === product.variant);
      return acc + (variant ? variant.price * product.quantity : 0);
    }, 0);
    
    const shippingFee = shipping.service ? shipping.service.price : 0;
    const codFee = paymentMethod && paymentMethod.value === 'cod' ? 0 : 0;
    
    return {
      subtotal,
      shippingFee,
      codFee,
      total: subtotal + shippingFee + codFee
    };
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  const searchCities = useCallback(debounce((inputValue) => {
    if (inputValue.length < 3) {
      setCityOptions([]);
      return;
    }

    setIsCityLoading(true);
    setTimeout(() => {
      const filteredCities = cities.filter(city => {
        const searchString = inputValue.toLowerCase();
        return (
          city.village.toLowerCase().includes(searchString) ||
          city.subdistrict.toLowerCase().includes(searchString) ||
          city.city.toLowerCase().includes(searchString) ||
          city.province.toLowerCase().includes(searchString)
        );
      });
      setCityOptions(filteredCities);
      setIsCityLoading(false);
    }, 500);
  }, 500), []);

  const totals = calculateTotal();

  const formatPrice = (price) => {
    return `Rp${price.toLocaleString('id-ID')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process order data
    const orderData = {
      products,
      recipient,
      shipping,
      paymentMethod,
      totals,
    };

    setTimeout(() => {
      setIsOrderSuccess(true);
    }, 1000);
  };

  const handleBackToForm = () => {
    setIsOrderSuccess(false);
    setProducts([{ variant: '', quantity: 1 }]);
    setRecipient({ name: '', whatsapp: '', address: '', city: null });
    setShipping({ carrier: null, service: { value: 'ez', label: 'EZ - Rp20.000', price: 20000 } });
    setPaymentMethod(null);
  };

  // FUNGSI BARU: Logika validasi form
  const isFormValid = () => {
    const hasSelectedProducts = products.some(p => p.variant);
    const isRecipientValid = recipient.name && recipient.whatsapp && recipient.address && recipient.city;
    const isShippingValid = shipping.carrier && shipping.service;
    const isPaymentValid = paymentMethod;

    return hasSelectedProducts && isRecipientValid && isShippingValid && isPaymentValid;
  };

  if (isOrderSuccess) {
    return (
      <div className=" p-6 h-auto flex flex-col lg:flex-row items-center justify-center tra-1">
        {/* Left Side: Text and Button */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0 lg:w-1/2 gap-3">
          {/* Title */}
          <h1 className="text-6xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
            Pembelian <br />Berhasil!
          </h1>
          {/* Subtitle */}
          <p className="mt-4 text-gray-600 text-lg lg:text-xl max-w-sm">
            Terima kasih telah memilih 
            <br />
            Jas Hujan Extrime teman setia 
            <br />
            perjalanan Anda di segala cuaca!
          </p>
          {/* Button */}
          <button 
            onClick={handleBackToForm}
            className="mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 but-text">
            Belanja Lagi
          </button>  
        </div>

        <img src={Testi} alt="" className='img-test' />
      </div>
    );
  }

  {/* <button
    onClick={handleBackToForm}
    className="mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
  >
    Buat Pesanan Baru
  </button> */}
  
  // Cek apakah ada produk yang sudah dipilih
  const hasSelectedProducts = products.some(p => p.variant);

  return (
    <div className="flex items-center justify-center p-4 sm:p-8 Tes" id='Transaksi'>
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-[800px] Tes-0">

        <div className="space-y-6">
          {/* <h2 className="text-xl md:text-2xl font-semibold text-gray-700 Tes-1">Pilihan Produk</h2> */}
          {products.map((product, index) => (
            <div key={index} className="relative p-4 rounded-md flex flex-col md:flex-row gap-3 items-center space-y-4 md:space-y-0 md:space-x-4 Tes-3">
              <div className="w-full md:w-3/4">
                <label className="block text-sm font-medium text-gray-700 Text-0">Pilihan Produk</label>
                <Select
                  options={productVariants}
                  value={productVariants.find(option => option.value === product.variant)}
                  onChange={(option) => handleProductChange(index, 'variant', option.value)}
                  className="mt-1"
                  placeholder="Pilih varian..."
                />
              </div>
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 Text-0">Jumlah</label>
                <div className="flex items-center mt-1 border border-gray-300 rounded-md overflow-hidden Tes-2">
                  <button
                    type="button"
                    onClick={() => handleProductChange(index, 'quantity', Math.max(1, product.quantity - 1))}
                    className="p-2 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full text-center border-none focus:ring-0"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => handleProductChange(index, 'quantity', product.quantity + 1)}
                    className="p-2 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
              </div>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(index)}
                  className="absolute -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 Tex-0"
                  aria-label="Hapus produk"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddProduct}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-xl font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 Tex-1"
          >
            Tambah Jaket
          </button>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Data Penerima</h2>
          <div>

            <input
              type="text"
              id="name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 Tes-5"
              value={recipient.name}
              onChange={(e) => handleRecipientChange('name', e.target.value)}
              placeholder='Nama Anda'
            />
          </div>
          <div>
            
            <input
              type="tel"
              id="whatsapp"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 Tes-5"
              value={recipient.whatsapp}
              onChange={(e) => handleRecipientChange('whatsapp', e.target.value)}
              placeholder='No. Whatsapp'
            />
          </div>
          <div>
            {/* <label htmlFor="address" className="block text-sm font-medium text-gray-700 Tes-4">Alamat Lengkap</label> */}
            <textarea
              id="address"
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 Tes-5a"
              value={recipient.address}
              onChange={(e) => handleRecipientChange('address', e.target.value)}
              placeholder='Alamat Lengkap Anda'
            ></textarea>
          </div>
          <div>
            {/* <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 Tes-4">Kota/Kecamatan/Desa</label> */}
            <Select
              id="city-select"
              options={cityOptions}
              value={recipient.city}
              onChange={handleCityChange}
              onInputChange={(inputValue) => searchCities(inputValue)}
              getOptionLabel={option => `${option.village}, ${option.subdistrict}, ${option.type} ${option.city}, ${option.province}`}
              getOptionValue={option => `${option.village}-${option.subdistrict}-${option.city}-${option.province}`}
              className="mt-1 Tes-5a"
              placeholder="Ketik minimal 3 huruf..."
              isLoading={isCityLoading}
              loadingMessage={() => 'Sedang mencari...'}
              noOptionsMessage={({ inputValue }) => inputValue.length < 3 ? 'Ketik minimal 3 huruf' : 'Tidak ada hasil'}
              isSearchable
              components={{ DropdownIndicator: () => null }}
            />
            {recipient.city && (
              <p className="mt-2 text-sm text-gray-600">
                Lokasi terpilih: {formatCityLabel(recipient.city)}
              </p>
            )}
          </div>
        </div>


        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 Tes-5a">Pengiriman</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 Tes-5a">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 Tes-4">Ekspedisi</label>
              <Select
                options={shippingCarriers}
                value={shipping.carrier}
                onChange={(option) => handleShippingChange('carrier', option)}
                className="mt-1"
                placeholder="Pilih ekspedisi..."
              />
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 Tes-4">Layanan</label>
              <Select
                options={shippingServices}
                value={shipping.service}
                onChange={(option) => handleShippingChange('service', option)}
                className="mt-1"
                placeholder="Pilih layanan..."
              />
            </div>
          </div>
        </div>


        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 Tes-5a">Metode Pembayaran</h2>
          <Select
            options={paymentOptions}
            value={paymentMethod}
            onChange={handlePaymentChange}
            className="mt-1"
            placeholder="Pilih metode pembayaran..."
          />
        </div>

        <div className="my-8">
          <hr className="border-gray-300" />
        </div>

        {/* LOGIKA BARU: Tombol Pesan Sekarang kini dinonaktifkan jika form belum valid */}
        <button
          type="submit"
          disabled={!isFormValid()}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition-colors duration-200 But-tra
            ${isFormValid() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Pesan Sekarang
        </button>
        
        {/* LOGIKA LAMA: Tampilkan Rincian Pesanan hanya jika ada produk yang dipilih */}
        {hasSelectedProducts && (
          <div className="mt-8 space-y-4 p-6 rounded-lg">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 Tes-a">Rincian Pesanan</h2>
            
            <div className="space-y-2">
              {products.map((product, index) => {
                const variant = productVariants.find(v => v.value === product.variant);
                if (!variant) return null;
                return (
                  <div key={index} className="flex justify-between text-gray-700 Tes-a1">
                    <span className="text-sm md:text-base font-medium">{variant.label} (x{product.quantity})</span>
                    <span className="text-sm md:text-base font-medium">{formatPrice(variant.price * product.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className=" my-4 pt-4">
              <div className="flex justify-between text-gray-700 Tes-a1">
                <span className="text-sm md:text-base font-medium">Biaya Pengiriman</span>
                <span className="text-sm md:text-base font-medium">{formatPrice(totals.shippingFee)}</span>
              </div>
              
            </div>

            <div className="flex justify-between text-gray-700 Tes-a1">
              <span className="text-sm md:text-base font-medium">Biaya COD</span>
              <span className="text-sm md:text-base font-medium">{formatPrice(totals.codFee)}</span>
            </div>

            <div className="border-t-2 border-gray-400 my-4 pt-4">
              <div className="flex justify-between items-center text-2xl font-bold text-gray-800 Tes-a2">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrderForm;
