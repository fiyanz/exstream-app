import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, ShoppingBag, Plus, Minus } from 'lucide-react';
// The following image paths are for demonstration purposes.
// In a real-world application, you would ensure these assets are available.
import Women from '../assets/Extrime/Cewek/HijauSage/Cewe.jpeg';
import Women1 from '../assets/Extrime/Cewek/Violet/Cewe.jpeg';
import Women2 from '../assets/Extrime/Cewek/DustyPink/Cewe.jpeg';
import Women3 from '../assets/Extrime/Cewek/PInkMuda/Cewe.jpeg';
import men from '../assets/Extrime/Cowok/One3.jpeg';
import men1 from '../assets/Extrime/Cowok/One1.jpeg';
import men2 from '../assets/Extrime/Cowok/One.jpeg';
import men3 from '../assets/Extrime/Cowok/One2.jpeg';
import men4 from '../assets/Extrime/Cowok/One4.jpeg';

// Data for products, options, and mock location data.
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

const sizeOptions = ['L', 'XL', 'XXL', 'XXXL'];
const shippingMethods = ['Standard Shipping', 'Express Shipping', 'Same Day Delivery'];
const paymentMethods = [
    { name: 'transfer', label: 'Transfer Bank, E-Wallet, Virtual Account' },
    { name: 'cod', label: 'COD (Bayar Di Tempat)' },
];

// Mock location data.
const provinces = ['Jawa Barat', 'Jawa Tengah', 'Yogyakarta', 'Jawa Timur', 'Banten', 'Bali'];
const cities = {
    'Jawa Barat': ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cimahi'],
    'Jawa Tengah': ['Surakarta', 'Semarang', 'Magelang', 'Tegal', 'Pekalongan', 'Purwokerto'],
    'Yogyakarta': ['Yogyakarta', 'Bantul', 'Sleman', 'Gunung Kidul', 'Kulon Progo'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Kediri', 'Blitar', 'Madiun', 'Pasuruan'],
    'Bali': ['Denpasar', 'Gianyar', 'Tabanan', 'Badung', 'Buleleng', 'Karangasem'],
};
const subdistricts = {
    'Bandung': ['Coblong'],
    'Bogor': ['Bogor Tengah'],
    'Bekasi': ['Bekasi Timur'],
    'Depok': ['Beji'],
    'Cimahi': ['Cimahi Tengah'],
    'Surakarta': ['Banjarsari'],
    'Semarang': ['Candisari'],
    'Magelang': ['Magelang Selatan'],
    'Tegal': ['Tegal Barat'],
    'Pekalongan': ['Pekalongan Timur'],
    'Purwokerto': ['Purwokerto Selatan'],
    'Yogyakarta': ['Umbul Harjo', 'Kraton'],
    'Bantul': ['Banguntapan'],
    'Sleman': ['Depok'],
    'Gunung Kidul': ['Wonosari'],
    'Kulon Progo': ['Wates'],
    'Surabaya': ['Tegal Sari'],
    'Malang': ['Klojen'],
    'Kediri': ['Mojoroto'],
    'Blitar': ['Sanan Wetan'],
    'Madiun': ['Kartoharjo'],
    'Pasuruan': ['Bugul Kidul'],
    'Denpasar': ['Denpasar Selatan'],
    'Gianyar': ['Ubud'],
    'Tabanan': ['Tabanan'],
    'Badung': ['Kuta'],
    'Buleleng': ['Singaraja'],
    'Karangasem': ['Karangasem'],
};
const villages = {
    'Coblong': ['Dago', 'Lebak Gede'],
    'Bekasi Timur': ['Aren Jaya'],
    'Bogor Tengah': ['Pabaton'],
    'Beji': ['Kemiri Muka'],
    'Cimahi Tengah': ['Baros'],
    'Banjasari': ['Manahan'],
    'Candisari': ['Jatingaleh'],
    'Magelang Selatan': ['Tidar'],
    'Tegal Barat': ['Panggung'],
    'Pekalongan Timur': ['Kauman'],
    'Purwokerto Selatan': ['Berkoh'],
    'Umbul Harjo': ['Muja Muju'],
    'Banguntapan': ['Wirokerten'],
    'Depok': ['Caturtunggal'],
    'Wonosari': ['Kepek'],
    'Wates': ['Wates'],
    'Tegal Sari': ['Tegal Sari'],
    'Klojen': ['Kasin'],
    'Mojoroto': ['Tamanan'],
    'Sanan Wetan': ['Gedog'],
    'Kartoharjo': ['Pandean'],
    'Bugul Kidul': ['Pekuncen'],
    'Denpasar Selatan': ['Sanur'],
    'Ubud': ['Petulu'],
    'Tabanan': ['Delod Peken'],
    'Kuta': ['Legian'],
    'Singaraja': ['Kampung Baru'],
    'Karangasem': ['Subagan'],
};

// Reusable component for a Select dropdown.
const SelectInput = ({ label, name, value, options, onChange, placeholder, required, disabled = false }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className=" text-black la-con">
            {label} {required && <span className="text-red-500"></span>}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1  border rounded-lg shadow-sm focus:outline-none  text-sm md:text-base disabled:cursor-not-allowed transition-colors duration-200 se-con"
            required={required}
            disabled={disabled}
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

// Reusable component for a Text input field.
const TextInput = ({ label, name, value, onChange, placeholder, type = 'text', required }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className=" text-black la-con">
            {label} {required && <span className="text-red-500"></span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="mt-1 block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none text-sm md:text-base transition-colors duration-200 in-con"
            required={required}
        />
    </div>
);

// Main Application Component.
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

    const [productImage, setProductImage] = useState(
        'https://placehold.co/150x200/d2e1c9/4a5746?text=Select+Color'
    );
    const [isFormValid, setIsFormValid] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Create a ref to scroll to the success message section.
    const successRef = useRef(null);

    // Calculate prices dynamically based on state.
    const subtotal = 299000 * formData.quantity;
    const discount = subtotal * 0.5;
    const total = subtotal - discount + formData.shippingCost + formData.taxCost;
    const handlingFee = 'N/A';

    // Function to format currency to IDR.
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Handler for form input changes.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            let newFormData = { ...prevData, [name]: value };

            // Logic to set shipping and tax costs based on the selected shipping method.
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

            // Clear dependent location fields when a higher-level field changes.
            if (name === 'province') {
                newFormData = { ...newFormData, city: '', subDistrict: '', village: '' };
            } else if (name === 'city') {
                newFormData = { ...newFormData, subDistrict: '', village: '' };
            } else if (name === 'subDistrict') {
                newFormData = { ...newFormData, village: '' };
            }
            return newFormData;
        });
    };

    // Handler for quantity changes.
    const handleQuantityChange = (change) => {
        setFormData(prev => ({
            ...prev,
            quantity: Math.max(1, prev.quantity + change)
        }));
    };

    // Effect to update the product image based on selected color.
    useEffect(() => {
        const selectedProduct = productData.find(p => p.color === formData.color);
        if (selectedProduct) {
            setProductImage(selectedProduct.image || 'https://placehold.co/150x200/A0D8B3/333?text=Product+Image');
        } else {
            setProductImage('https://placehold.co/150x200/A0D8B3/333?text=Select+Color');
        }
    }, [formData.color]);

    // Effect to validate the form and enable/disable the button.
    useEffect(() => {
        const requiredFields = [
            'size', 'color', 'fullName', 'telephone', 'province', 'city',
            'subDistrict', 'village', 'completeAddress', 'shippingMethod', 'paymentMethod'
        ];
        const isValid = requiredFields.every(field => formData[field] !== '' && formData.quantity >= 1);
        setIsFormValid(isValid);
    }, [formData]);

    // Effect to scroll to the success message after the order is placed.
    useEffect(() => {
        if (orderPlaced && successRef.current) {
            successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [orderPlaced]);

    // Handle buy button click.
    const handleBuy = () => {
        if (isFormValid) {
            setOrderPlaced(true);
        }
    };

    // Render the main form and the optional success message.
    return (
        <div className="con-0">
            {/* <h1 className="text-3xl md:text-4xl font-extrabold text-black text-center h1-con">Checkout</h1> */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                {/* Left Section: Product Options and Shipping Form */}
                <div className="space-y-8 self-1">
                    {/* Header */}
                    

                    {/* Product Options Card */}
                    <div className="">
                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-black h2-con">Product Options</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {/* Size Dropdown */}
                            <SelectInput
                                label="Size"
                                name="size"
                                value={formData.size}
                                options={sizeOptions}
                                onChange={handleInputChange}
                                placeholder="Pilih Ukuran"
                                required
                            />

                            {/* Color Dropdown */}
                            <SelectInput
                                label="Warna"
                                name="color"
                                value={formData.color}
                                options={productData.map(p => p.color)}
                                onChange={handleInputChange}
                                placeholder="Pilih Warna"
                                required
                            />

                            {/* Quantity Selector */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-black mb-1">Jumlah</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="p-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="text-lg font-semibold w-10 text-black">{formData.quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="p-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Details Form Card */}
                    <div className="">
                        <h2 className="text-xl md:text-2xl font-bold de-con">Detail Pengiriman</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextInput
                                label="Nama Lengkap"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Masukkan nama lengkap Anda"
                                required
                            />
                            <TextInput
                                label="Nomor Telepon"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleInputChange}
                                placeholder="+62 8XX XXXX XXXX"
                                required
                            />
                            <SelectInput
                                label="Provinsi"
                                name="province"
                                value={formData.province}
                                options={provinces}
                                onChange={handleInputChange}
                                placeholder="Pilih Provinsi"
                                required
                            />
                            <SelectInput
                                label="Kota/Kabupaten"
                                name="city"
                                value={formData.city}
                                options={cities[formData.province] || []}
                                onChange={handleInputChange}
                                placeholder="Pilih Kota/Kabupaten"
                                required
                                disabled={!formData.province}
                            />
                            <SelectInput
                                label="Kecamatan"
                                name="subDistrict"
                                value={formData.subDistrict}
                                options={subdistricts[formData.city] || []}
                                onChange={handleInputChange}
                                placeholder="Pilih Kecamatan"
                                required
                                disabled={!formData.city}
                            />
                            <SelectInput
                                label="Desa"
                                name="village"
                                value={formData.village}
                                options={villages[formData.subDistrict] || []}
                                onChange={handleInputChange}
                                placeholder="Pilih Desa"
                                required
                                disabled={!formData.subDistrict}
                            />
                        </div>
                        <div className="mt-6">
                            <label htmlFor="completeAddress" className="block text-sm font-medium al-con">Alamat Lengkap</label>
                            <textarea
                                id="completeAddress"
                                name="completeAddress"
                                rows="3"
                                value={formData.completeAddress}
                                onChange={handleInputChange}
                                placeholder="Jl. Contoh No. 123 atau Gang Bunga 123"
                                className="w-full p-3 border rounded-lg shadow-sm focus:outline-nonetext-sm md:text-base text-black"
                                required
                            ></textarea>
                        </div>
                    </div>

                    {/* Shipping and Payment Methods Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="">
                            <h2 className="text-xl md:text-2xl font-bold mb-6 text-black peg-con">Metode Pengiriman</h2>
                            <SelectInput
                                label=""
                                name="shippingMethod"
                                value={formData.shippingMethod}
                                options={shippingMethods}
                                onChange={handleInputChange}
                                placeholder="Pilih Metode Pengiriman"
                                required
                            />
                        </div>
                        <div className="">
                            <h2 className="text-xl md:text-2xl font-bold mb-6 text-black peg-con">Metode Pembayaran</h2>
                            <SelectInput
                                label=""
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                options={paymentMethods.map(method => method.label)}
                                onChange={handleInputChange}
                                placeholder="Pilih Metode Pembayaran"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section: Order Summary Card */}
                <div className="self-start">
                    <div className="">
                        <h2 className="text-2xl font-bold text-black rin-con">Ringkasan Pesanan</h2>

                        {/* Product info */}
                        <div className="flex items-start gap-6 pb-4 ha1-con">
                            <img
                                src={productImage}
                                alt="Raincoat"
                                className="w-[200px] h-[240px] rounded-lg object-cover shadow im-con"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/150x200/A0D8B3/333?text=Product+Image';
                                    e.target.alt = 'Placeholder Image';
                                }}
                            />
                            <div className="flex-1">
                                <h3 className="text-4xl font-bold text-black h3-con">Premium Extreme <br /> Jas Hujan</h3>
                                <p className="text-black flex justify-between items-center tes-con">Ukuran: <span className="font-medium">{formData.size || ' - '}</span></p>
                                <p className="text-black flex justify-between items-center tes-con">Warna: <span className="font-medium">{formData.color || ' - '}</span></p>
                                <p className="text-black flex justify-between items-center tes-con">Jumlah: <span className="font-medium">{formData.quantity}</span></p>
                            </div>
                        </div>

                        {/* Price breakdown */}
                        <div className="space-y-3 mb-6 on-con flex flex-col gap-3">
                            <div className="flex justify-between text-black">
                                <span className='text-xl'>Subtotal</span>
                                <span className='text-xl'>{formatRupiah(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                                <span className='text-xl'>Diskon <span className="text-xs bg-red-100 rounded-full px-2 py-0.5 ml-2 font-semibold"></span></span>
                                <span className="line-through text-xl">{formatRupiah(discount)}</span>
                            </div>
                            <div className="flex justify-between text-black">
                                <span className='text-xl'>Biaya Pengiriman</span>
                                <span className='text-xl'>{formatRupiah(formData.shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span className='text-xl'>Biaya Penanganan</span>
                                <span className='text-xl'>{handlingFee}</span>
                            </div>
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span className='text-xl'>Pajak</span>
                                <span className='text-xl'>{formData.taxCost > 0 ? formatRupiah(formData.taxCost) : 'N/A'}</span>
                            </div>
                        </div>

                        {/* Total price */}
                        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                            <span className="text-2xl font-bold qw-con">Total</span>
                            <span className="text-2xl font-extrabold text-emerald-500 qw-con">{formatRupiah(total)}</span>
                        </div>

                        {/* Buy Now button */}
                        <button
                            onClick={handleBuy}
                            disabled={!isFormValid}
                            className={`mt-6 w-full font-bold text-2xl rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 buto-con 
                                    ${isFormValid
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <ShoppingBag size={24} />
                            Beli Pesanan
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Message Section - Conditionally rendered */}
            {orderPlaced && (
                <div ref={successRef} className="su-con flex flex-col justify-center items-center text-center">
                    <CheckCircle className="text-emerald-500 ico-con" size={80} />
                    <h2 className="text-3xl font-bold text-black mb-4">Order Sukses!</h2>
                    <p className="text-black text-lg">
                        Terima kasih, {formData.fullName}. Pesanan Anda telah berhasil dibuat. <br />Anda akan menerima notifikasi Whatsapp setelah pesanan dikirim. <br /> Pastikan nomer yang anda masukkan sesuai dengan Nomer Whatsapp Anda
                    </p>
                    <div className="text-left du-con">
                        <p className="font-semibold text-xl text-black text-center">Detail Pesanan Anda:</p>
                        <ul className="dq-con">
                            <li className='flex flex-col text-center'><span className="text-1xl font-bold">Produk:</span> Premium Extreme Jas Hujan</li>
                            <li className='flex flex-col text-center'><span className="text-1xl font-bold">Warna:</span> {formData.color}</li>
                            <li className='flex flex-col text-center'><span className="text-1xl font-bold">Ukuran:</span> {formData.size}</li>
                            <li className='flex flex-col text-center'><span className="text-1xl font-bold">Jumlah:</span> {formData.quantity}</li>
                            <li className='flex flex-col text-center'><span className="text-1xl font-bold">Total Harga:</span> {formatRupiah(total)}</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
