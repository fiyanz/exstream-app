import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { CheckCircle, RefreshCcw, Loader2 } from "lucide-react";
import { useLocationSelector } from "../../hooks/useLocationSelector";
import { useShipping } from "../../hooks/useShipping";
import {
  createUnifiedOrder,
  handleMidtransPaymentEnhanced
} from "../../services/transactionService";

const PRODUCT_PRICE = 299000;
const DISCOUNT_AMOUNT = 164000;
const PRODUCT_WEIGHT = 1000;

const COLORS = [
  "Black", "Navy Blue", "Army Green", "Cream", "Red",
  "Dusty Pink", "Hijau Sage", "Pink Muda", "Ungu Violet"
];
const SIZES = ["L", "XL", "XXL"];

const TransactionPage = () => {
  const {
    provinces, cities, subdistricts, villages,
    isLoadingLocations, loadCities, loadSubdistricts, loadVillages,
  } = useLocationSelector();

  const {
    shippingOptions, isLoadingShipping, shippingCost,
    checkShippingCost, selectShippingOption, resetShipping
  } = useShipping();

  const [formData, setFormData] = useState({
    fullName: "", telephone: "",
    province: "", city: "", subDistrict: "", village: "",
    completeAddress: "", color: "", size: "",
    shippingMethod: "", paymentMethod: "COD",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Track which location field the user just changed to prevent cascade blink
  const lastChangedField = useRef(null);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "telephone") {
      setFormData(prev => ({ ...prev, telephone: value.replace(/\D/g, "") }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
      return;
    }

    if (name === "shippingMethod") {
      selectShippingOption(value);
    }

    lastChangedField.current = name;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, [selectShippingOption]);

  // Province changed → load cities, clear downstream
  useEffect(() => {
    if (lastChangedField.current !== "province") return;
    lastChangedField.current = null;

    if (formData.province) {
      loadCities(formData.province);
    }
    setFormData(prev => ({
      ...prev, city: "", subDistrict: "", village: "", shippingMethod: ""
    }));
    resetShipping();
  }, [formData.province]); // eslint-disable-line react-hooks/exhaustive-deps

  // City changed → load subdistricts, clear downstream
  useEffect(() => {
    if (lastChangedField.current !== "city") return;
    lastChangedField.current = null;

    if (formData.city) {
      loadSubdistricts(formData.city);
    }
    setFormData(prev => ({
      ...prev, subDistrict: "", village: "", shippingMethod: ""
    }));
    resetShipping();
  }, [formData.city]); // eslint-disable-line react-hooks/exhaustive-deps

  // SubDistrict changed → load villages, clear downstream
  useEffect(() => {
    if (lastChangedField.current !== "subDistrict") return;
    lastChangedField.current = null;

    if (formData.subDistrict) {
      loadVillages(formData.subDistrict);
    }
    setFormData(prev => ({
      ...prev, village: "", shippingMethod: ""
    }));
    resetShipping();
  }, [formData.subDistrict]); // eslint-disable-line react-hooks/exhaustive-deps

  // Village changed → fetch shipping rates
  useEffect(() => {
    if (formData.village) {
      checkShippingCost(formData.village);
    } else {
      resetShipping();
    }
  }, [formData.village]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived values
  const subtotal = PRODUCT_PRICE;
  const discount = DISCOUNT_AMOUNT;
  const total = subtotal - discount + shippingCost;

  const validateAll = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Nama lengkap wajib diisi";
    if (!formData.telephone.trim()) e.telephone = "Nomor telepon wajib diisi";
    if (!formData.color) e.color = "Warna produk wajib dipilih";
    if (!formData.size) e.size = "Ukuran produk wajib dipilih";
    if (!formData.province) e.province = "Provinsi wajib dipilih";
    if (!formData.city) e.city = "Kota/Kabupaten wajib dipilih";
    if (!formData.subDistrict) e.subDistrict = "Kecamatan wajib dipilih";
    if (!formData.village) e.village = "Desa/Kelurahan wajib dipilih";
    if (!formData.completeAddress.trim()) e.completeAddress = "Alamat lengkap wajib diisi";
    if (!formData.shippingMethod) e.shippingMethod = "Metode pengiriman wajib dipilih";
    if (!formData.paymentMethod) e.paymentMethod = "Metode pembayaran wajib dipilih";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildOrderPayload = () => {
    const provinceName = provinces.find(p => p.id === formData.province)?.name || "";
    const cityName = cities.find(c => c.id === formData.city)?.name || "";
    const subdistrictName = subdistricts.find(s => s.id === formData.subDistrict)?.name || "";
    const villageName = villages.find(v => v.id === formData.village)?.name || "";

    return {
      customer_name: formData.fullName,
      customer_phone: formData.telephone,
      customer_address: formData.completeAddress,
      province: formData.province,
      city: formData.city,
      subdistrict: formData.subDistrict,
      village: formData.village,
      province_name: provinceName,
      city_name: cityName,
      subdistrict_name: subdistrictName,
      village_name: villageName,
      items: [{
        name: "Jas Hujan Extrime",
        variant: `${formData.color} - ${formData.size}`,
        color: formData.color,
        size: formData.size,
        quantity: 1,
        price: PRODUCT_PRICE,
        product_weight: PRODUCT_WEIGHT,
      }],
      shipping_method: formData.shippingMethod,
      shipping_cost: shippingCost,
      payment_method: formData.paymentMethod === "COD" ? "COD" : "BANK TRANSFER",
      subtotal, discount, total,
      // For whatsapp receipt
      fullName: formData.fullName,
      telephone: formData.telephone,
      address: formData.completeAddress,
      shippingMethod: formData.shippingMethod,
      paymentMethod: formData.paymentMethod,
      shippingCost,
      totalAmount: total,
      villageName,
      subdistrictName,
      cityName,
      provinceName,
    };
  };

  const handleBuy = async () => {
    if (!validateAll()) {
      alert("Mohon lengkapi semua formulir yang bertanda merah.");
      return;
    }
    setIsSubmitting(true);
    const payload = buildOrderPayload();

    try {
      const result = await createUnifiedOrder(payload);
      if (result.status === "success" || result.order_id || result.id) {
        setOrderDetails(result);
        setOrderPlaced(true);
        if (result.snap_token || result.token) {
          handleMidtransPaymentEnhanced(result.snap_token || result.token, result.redirect_url);
        }
      }
    } catch (error) {
      console.error("Order failed:", error);
      alert(`Gagal memproses pesanan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppConfirmation = async () => {
    if (!validateAll()) {
      alert("Mohon lengkapi data pemesanan terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    const payload = buildOrderPayload();
    payload.payment_method = "COD"; // Force COD for direct WhatsApp

    try {
      const result = await createUnifiedOrder(payload);
      if (result.whatsapp_url) {
        window.location.href = result.whatsapp_url;
      }
    } catch (error) {
      console.error("WhatsApp confirmation failed:", error);
      alert(`Gagal: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setOrderPlaced(false);
    setOrderDetails(null);
    setFormData({
      fullName: "", telephone: "",
      province: "", city: "", subDistrict: "", village: "",
      completeAddress: "", color: "", size: "",
      shippingMethod: "", paymentMethod: "COD",
    });
    resetShipping();
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Helper: render a styled select ──
  const renderSelect = (name, value, options, placeholder, disabled = false) => (
    <select
      name={name}
      value={value}
      onChange={handleInputChange}
      disabled={disabled}
      className={`w-full bg-white border-2 ${
        errors[name] ? "border-red-500" : "border-outline"
      } rounded-lg p-4 text-[18px] focus:border-primary focus:ring-0 outline-none disabled:opacity-50 disabled:bg-gray-100 appearance-none`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.id || opt} value={opt.id || opt}>
          {opt.name || opt.label || opt}
        </option>
      ))}
    </select>
  );

  // ── Order Success Screen ──
  if (orderPlaced) {
    const isCOD = orderDetails?.payment_status === "pending_cod" || orderDetails?.whatsapp_url;
    
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Pesanan Berhasil Dibuat!</h2>
          
          <p className="text-gray-600 text-lg">
            Terima kasih telah berbelanja di Jas Hujan Extrime. Pesanan Anda{" "}
            <span className="font-bold">#{orderDetails?.order_no || orderDetails?.order_id || orderDetails?.id}</span>{" "}
            telah masuk ke sistem kami.
          </p>

          {isCOD && (
            <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl text-left">
              <p className="text-yellow-800 font-semibold mb-2">⚠️ PENTING: Langkah Terakhir!</p>
              <p className="text-yellow-700 text-sm mb-4">
                Untuk pesanan COD (Bayar di Tempat), mohon klik tombol di bawah ini untuk mengirimkan konfirmasi alamat Anda ke WhatsApp admin kami agar pesanan dapat segera diproses.
              </p>
              <a 
                href={orderDetails.whatsapp_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 px-6 bg-success-green text-on-primary rounded-xl font-bold hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                <span className="material-symbols-outlined">chat</span>
                Konfirmasi via WhatsApp
              </a>
            </div>
          )}

          <button onClick={handleBackToForm} className={`w-full py-4 px-6 ${isCOD ? 'bg-gray-100 text-gray-700' : 'bg-primary text-on-primary'} rounded-xl font-bold hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 text-lg cursor-pointer`}>
            <RefreshCcw size={20} /> {isCOD ? "Tutup & Kembali" : "Belanja Lagi"}
          </button>
        </div>
      </div>
    );
  }

  // ── Main Form ──
  return (
    <section id="transaksi" className="py-20" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h2 className="text-[32px] font-bold text-primary text-center mb-8">
        Formulir Pemesanan
      </h2>

      <div className="bg-surface-gray border-2 border-surface-variant rounded-xl p-8 space-y-10 shadow-sm">

        {/* ── Promo Banner ── */}
        <div className="text-center bg-white p-6 rounded-xl border border-surface-variant">
          <p className="text-[20px] text-error-red font-bold mb-2">Promo Khusus Hari Ini!</p>
          <p className="text-[24px] font-semibold line-through text-on-surface-variant mb-2">Rp. 299.000</p>
          <div className="inline-block bg-secondary text-on-secondary font-bold py-2 px-6 rounded-lg mb-4 text-xl shadow-sm">Diskon 55%</div>
          <p className="text-[48px] font-bold text-primary leading-tight">Rp. 135.000</p>
        </div>

        {/* ── 1. Pilih Produk ── */}
        <div className="space-y-6">
          <h3 className="text-[24px] font-semibold text-primary border-b-2 border-surface-variant pb-2">1. Pilih Produk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[18px] font-semibold text-on-surface mb-2">Pilih Warna <span className="text-error-red">*</span></label>
              {renderSelect("color", formData.color, COLORS.map(c => ({ id: c, name: c })), "Pilih Warna")}
              {errors.color && <p className="text-error-red text-sm mt-1">{errors.color}</p>}
            </div>
            <div>
              <label className="block text-[18px] font-semibold text-on-surface mb-2">Pilih Ukuran <span className="text-error-red">*</span></label>
              {renderSelect("size", formData.size, SIZES.map(s => ({ id: s, name: s })), "Pilih Ukuran")}
              {errors.size && <p className="text-error-red text-sm mt-1">{errors.size}</p>}
            </div>
          </div>
        </div>

        {/* ── 2. Detail Pengiriman ── */}
        <div className="space-y-6">
          <h3 className="text-[24px] font-semibold text-primary border-b-2 border-surface-variant pb-2">2. Detail Pengiriman</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[18px] font-semibold text-on-surface mb-2">Nama Lengkap <span className="text-error-red">*</span></label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Nama Lengkap Penerima"
                className={`w-full bg-white border-2 ${errors.fullName ? "border-red-500" : "border-outline"} rounded-lg p-4 text-[18px] focus:border-primary focus:ring-0 outline-none`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {errors.fullName && <p className="text-error-red text-sm mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-[18px] font-semibold text-on-surface mb-2">Nomor Telepon <span className="text-error-red">*</span></label>
              <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} placeholder="Contoh: 08123456789"
                className={`w-full bg-white border-2 ${errors.telephone ? "border-red-500" : "border-outline"} rounded-lg p-4 text-[18px] focus:border-primary focus:ring-0 outline-none`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {errors.telephone && <p className="text-error-red text-sm mt-1">{errors.telephone}</p>}
            </div>
          </div>

          {/* Location Waterfall */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[18px] font-semibold text-on-surface mb-2">Provinsi <span className="text-error-red">*</span></label>
              {renderSelect("province", formData.province, provinces, isLoadingLocations && !provinces.length ? "Memuat..." : "Pilih Provinsi")}
              {errors.province && <p className="text-error-red text-sm mt-1">{errors.province}</p>}
            </div>
            <div>
              <label className="block text-[18px] font-semibold text-on-surface mb-2">Kota/Kabupaten <span className="text-error-red">*</span></label>
              {renderSelect("city", formData.city, cities, "Pilih Kota/Kabupaten", !formData.province)}
              {errors.city && <p className="text-error-red text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-[18px] font-semibold text-on-surface mb-2">Kecamatan <span className="text-error-red">*</span></label>
              {renderSelect("subDistrict", formData.subDistrict, subdistricts, "Pilih Kecamatan", !formData.city)}
              {errors.subDistrict && <p className="text-error-red text-sm mt-1">{errors.subDistrict}</p>}
            </div>
            <div>
              <label className="block text-[18px] font-semibold text-on-surface mb-2">Desa/Kelurahan <span className="text-error-red">*</span></label>
              {renderSelect("village", formData.village, villages, "Pilih Desa/Kelurahan", !formData.subDistrict)}
              {errors.village && <p className="text-error-red text-sm mt-1">{errors.village}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[18px] font-semibold text-on-surface mb-2">Alamat Lengkap <span className="text-error-red">*</span></label>
            <textarea name="completeAddress" value={formData.completeAddress} onChange={handleInputChange} rows="3" placeholder="Nama Jalan, RT/RW, No. Rumah, dll."
              className={`w-full bg-white border-2 ${errors.completeAddress ? "border-red-500" : "border-outline"} rounded-lg p-4 text-[18px] focus:border-primary focus:ring-0 outline-none resize-none`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            {errors.completeAddress && <p className="text-error-red text-sm mt-1">{errors.completeAddress}</p>}
          </div>

          {/* Courier */}
          <div>
            <label className="block text-[18px] font-semibold text-on-surface mb-2">Pilih Layanan Kurir <span className="text-error-red">*</span></label>
            {renderSelect(
              "shippingMethod", formData.shippingMethod,
              shippingOptions.map(o => ({ id: o.id, name: o.label })),
              isLoadingShipping ? "Sedang menghitung ongkir..." : !formData.subDistrict ? "Pilih Kecamatan terlebih dahulu" : !shippingOptions.length ? "Tidak ada layanan kurir" : "Pilih Metode Pengiriman",
              !shippingOptions.length
            )}
            {errors.shippingMethod && <p className="text-error-red text-sm mt-1">{errors.shippingMethod}</p>}
          </div>
        </div>

        {/* ── 3. Metode Pembayaran ── */}
        <div className="space-y-6">
          <h3 className="text-[24px] font-semibold text-primary border-b-2 border-surface-variant pb-2">3. Metode Pembayaran</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer bg-white ${formData.paymentMethod === "COD" ? "border-primary bg-blue-50" : "border-outline"}`}>
              <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === "COD"} onChange={handleInputChange} className="w-6 h-6 text-primary focus:ring-0 accent-primary" />
              <span className="ml-4 text-[18px] font-semibold text-on-surface">COD (Bayar di Tempat)</span>
            </label>
            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer bg-white ${formData.paymentMethod === "Transfer" ? "border-primary bg-blue-50" : "border-outline"}`}>
              <input type="radio" name="paymentMethod" value="Transfer" checked={formData.paymentMethod === "Transfer"} onChange={handleInputChange} className="w-6 h-6 text-primary focus:ring-0 accent-primary" />
              <span className="ml-4 text-[18px] font-semibold text-on-surface">Transfer Bank / QRIS</span>
            </label>
          </div>
        </div>

        {/* ── Price Summary ── */}
        <div className="bg-surface-container-high rounded-xl p-6 space-y-4 border border-surface-variant">
          <div className="flex justify-between text-[20px]">
            <span>Subtotal:</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-[20px] text-error-red font-semibold">
            <span>Diskon (55%):</span>
            <span>- Rp {discount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-[20px]">
            <span>Ongkos Kirim:</span>
            <span>{shippingCost > 0 ? `Rp ${shippingCost.toLocaleString("id-ID")}` : "Sesuai Kurir"}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t-2 border-outline-variant">
            <span className="font-bold text-[24px]">Total Bayar:</span>
            <span className="font-bold text-[32px] text-primary">Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="space-y-4 pt-4">
          <button type="button" onClick={handleBuy} disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-bold text-[20px] py-5 px-6 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {isSubmitting && <Loader2 className="animate-spin" size={24} />}
            {isSubmitting ? "MEMPROSES PESANAN..." : "PESAN SEKARANG"}
          </button>
          <button type="button" onClick={handleWhatsAppConfirmation}
            className="w-full bg-success-green text-on-primary font-bold text-[20px] py-5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all cursor-pointer">
            <span className="material-symbols-outlined">chat</span>
            KONFIRMASI VIA WHATSAPP
          </button>
        </div>
      </div>
    </section>
  );
};

export default TransactionPage;
