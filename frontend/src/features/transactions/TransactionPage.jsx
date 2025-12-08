import {
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, RefreshCcw } from "lucide-react";

// Custom Hooks
import { useLocationSelector } from "../../hooks/useLocationSelector";
import { useCart } from "../../hooks/useCart";
import { useShipping } from "../../hooks/useShipping";

import {
  createUnifiedOrder,
  handleMidtransPaymentEnhanced,
  openWhatsappReceipt,
} from "../../services/transactionService";

import ErrorBoundary from "../../components/common/ErrorBoundary";

// Constants
import {
  PRODUCT_DATA,
  SIZE_OPTIONS,
  PRODUCT_PRICE,
  PRODUCT_WEIGHT,
} from "./constants";

// Components
import DiscountBanner from "../../components/order/DiscountBanner";
import VariantSelector from "../../components/order/VariantSelector";
import ShippingForm from "../../components/order/ShippingForm";
import PaymentSection from "../../components/order/PaymentSection";
import OrderSummary from "../../components/order/OrderSummary";

const TransactionPage = () => {
  const [searchParams] = useSearchParams();
  // --- Hooks ---
  const {
    provinces,
    cities,
    subdistricts,
    villages,
    isLoadingLocations,
    loadCities,
    loadSubdistricts,
    loadVillages,
    getLocationName
  } = useLocationSelector();

  const {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    subtotal,
    discount
  } = useCart();

  const {
    shippingOptions,
    isLoadingShipping,
    shippingCost,
    checkShippingCost,
    selectShippingOption,
    resetShipping
  } = useShipping();

  // --- Local State ---
  const [currentProduct, setCurrentProduct] = useState({
    size: "",
    color: "",
    quantity: 1,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    telephone: "",
    province: "",
    city: "",
    subDistrict: "",
    village: "",
    completeAddress: "",
    shippingMethod: "",
    paymentMethod: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [productErrors, setProductErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Transaction State
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Refs
  const productFormRef = useRef(null);
  const successRef = useRef(null);

  // --- Effects ---

  // Location waterfall effects
  useEffect(() => {
      loadCities(formData.province);
      setFormData(prev => ({ ...prev, city: "", subDistrict: "", village: "", shippingMethod: "" }));
      resetShipping();
  }, [formData.province]);

  useEffect(() => {
      loadSubdistricts(formData.city);
      setFormData(prev => ({ ...prev, subDistrict: "", village: "", shippingMethod: "" }));
      resetShipping();
  }, [formData.city]);

  useEffect(() => {
      loadVillages(formData.subDistrict);
      setFormData(prev => ({ ...prev, village: "", shippingMethod: "" }));
      resetShipping();
  }, [formData.subDistrict]);

  // Shipping calculation
  useEffect(() => {
    if (formData.city && formData.subDistrict && cartItems.length > 0) {
      const totalWeight = cartItems.reduce((acc, item) => acc + (PRODUCT_WEIGHT * item.quantity), 0);
      checkShippingCost(formData.subDistrict, "subdistrict", totalWeight);
    }
  }, [formData.city, formData.subDistrict, cartItems, checkShippingCost]);

  // Polling logic 
  useEffect(() => {
    let polling;
    const fetchStatus = async () => {
         const orderId = searchParams.get("order_id") || orderDetails?.id || sessionStorage.getItem("lastOrderId");

         if (orderPlaced && orderId) {
             setIsCheckingStatus(true);
             try {
                 const res = await fetch(`/api/v1/orders/${orderId}/status`);
                 if(res.ok) {
                     const data = await res.json();
                     setPaymentStatus(data.payment_status);
                     if (data.payment_status === "lunas" || data.key === "lunas" || data.status === "paid" || data.status === "settlement") {
                        // Success handled by UI
                     } else if(data.payment_status === 'pending') {
                         polling = setTimeout(fetchStatus, 4000);
                     }
                 }
             } catch(e) { console.error(e); }
             finally { setIsCheckingStatus(false); }
         }
    };
    if (orderPlaced) fetchStatus();
    return () => clearTimeout(polling);
  }, [orderPlaced, orderDetails, searchParams]);

  // Derived State
  const handlingFee = 0;
  const total = subtotal - discount + shippingCost + handlingFee;

  const isFormValid = useMemo(() => {
      return (
          formData.fullName &&
          formData.telephone &&
          formData.province &&
          formData.city &&
          formData.subDistrict &&
          formData.village &&
          formData.completeAddress &&
          formData.shippingMethod &&
          formData.paymentMethod &&
          cartItems.length > 0
      );
  }, [formData, cartItems]);

  // --- Handlers ---
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
    if (productErrors[name]) setProductErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleQuantityChange = (type) => {
    setCurrentProduct(prev => ({
      ...prev,
      quantity: type === 'increment' ? prev.quantity + 1 : Math.max(1, prev.quantity - 1)
    }));
  };

  const handleAddToCart = () => {
    const errors = {};
    if (!currentProduct.size) errors.size = "Ukuran wajib dipilih";
    if (!currentProduct.color) errors.color = "Warna wajib dipilih";
    
    if (Object.keys(errors).length > 0) {
        setProductErrors(errors);
        return;
    }
    addToCart(currentProduct);
    setCurrentProduct(prev => ({ ...prev, quantity: 1 }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telephone') {
        const val = value.replace(/\D/g, "");
        setFormData(prev => ({ ...prev, telephone: val }));
        return;
    }

    if (name === 'shippingMethod') {
        selectShippingOption(value);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleBuy = async () => {
    if (!isFormValid) {
        const errors = {};
        if (!formData.fullName) errors.fullName = "Nama lengkap wajib diisi";
        if (!formData.telephone) errors.telephone = "Nomor telepon wajib diisi";
        if (!formData.province) errors.province = "Provinsi wajib dipilih";
        if (!formData.city) errors.city = "Kota wajib dipilih";
        if (!formData.subDistrict) errors.subDistrict = "Kecamatan wajib dipilih";
        if (!formData.village) errors.village = "Desa wajib dipilih";
        if (!formData.completeAddress) errors.completeAddress = "Alamat lengkap wajib diisi";
        if (!formData.shippingMethod) errors.shippingMethod = "Metode pengiriman wajib dipilih";
        if (!formData.paymentMethod) errors.paymentMethod = "Metode pembayaran wajib dipilih";
        setFormErrors(errors);
        alert("Mohon lengkapi semua data yang bertanda seru.");
        return;
    }

    setIsSubmitting(true);

    const provinceName = getLocationName(provinces, formData.province);
    const cityName = getLocationName(cities, formData.city);
    const subdistrictName = getLocationName(subdistricts, formData.subDistrict);
    const villageName = getLocationName(villages, formData.village);

    try {
        const paymentMethod = formData.paymentMethod.toLowerCase().includes('cod') ? 'COD' : 'Transfer';
        
        const orderPayload = {
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
             items: cartItems.map(item => ({
                 name: "Jas Hujan Extrime",
                 variant: `${item.color} - ${item.size}`,
                 color: item.color,
                 size: item.size,
                 quantity: item.quantity,
                 price: PRODUCT_PRICE,
                 product_weight: PRODUCT_WEIGHT,
             })),
             shipping_method: formData.shippingMethod,
             shipping_cost: shippingCost,
             payment_method: paymentMethod,
             subtotal: subtotal,
             discount: discount,
             total: total
        };

        const result = await createUnifiedOrder(orderPayload);
        
        if (result.status === "success" || result.order_id) {
            setOrderDetails(result);
            setOrderPlaced(true);
            
            if (result.snap_token) {
                 handleMidtransPaymentEnhanced(result.snap_token, result.redirect_url);
            } else if (paymentMethod === 'COD') {
                 const waPayload = {
                     ...orderPayload,
                     id: result.order_id,
                     order_id: result.order_id,
                     grand_total: total
                 };
                 openWhatsappReceipt(); 
            }
        }

    } catch (error) {
        console.error("Order failed:", error);
        alert(`Gagal memproses pesanan: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
      setOrderPlaced(false);
      setOrderDetails(null);
      clearCart();
      setFormData({
        fullName: "",
        telephone: "",
        province: "",
        city: "",
        subDistrict: "",
        village: "",
        completeAddress: "",
        shippingMethod: "",
        paymentMethod: "",
      });
      resetShipping();
      setFormErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Render ---

  if (orderPlaced) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div ref={successRef} className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Pesanan Berhasil!</h2>
                  <p className="text-gray-600">
                      Terima kasih telah berbelanja di Jas Hujan Extrime. Pesanan Anda <span className="font-bold">#{orderDetails?.id || orderDetails?.order_id}</span> sedang kami proses.
                  </p>
                  <button 
                    onClick={handleBackToForm}
                    className="w-full py-3 px-6 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2"
                  >
                      <RefreshCcw size={18} /> Belanja Lagi
                  </button>
              </div>
          </div>
      );
  }

  return (
    <ErrorBoundary>
    <div id="transaksi" className="w-full bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-12">
        
        {/* Header Section */}
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Formulir Pemesanan
            </h1>
            <p className="text-gray-600 text-lg">Lengkapi data diri Anda untuk pengiriman</p>
        </div>

        <div className="max-w-6xl mx-auto">
            {/* New Discount Banner */}
            <DiscountBanner />

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                
                {/* Left Column: Forms */}
                <div className="w-full lg:w-7/12 space-y-8">
                    
                    <VariantSelector 
                        productData={PRODUCT_DATA}
                        sizeOptions={SIZE_OPTIONS}
                        currentProduct={currentProduct}
                        onProductChange={handleProductChange}
                        onQuantityChange={handleQuantityChange}
                        onAddToCart={handleAddToCart}
                        errors={productErrors}
                        productFormRef={productFormRef}
                    />

                    <ShippingForm 
                        formData={formData}
                        errors={formErrors}
                        onChange={handleInputChange}
                        locations={{
                            provinces,
                            cities,
                            subdistricts,
                            villages
                        }}
                        isLoadingLocations={isLoadingLocations}
                    />

                    <PaymentSection 
                        formData={formData}
                        errors={formErrors}
                        onChange={handleInputChange}
                        shippingOptions={shippingOptions}
                        isLoadingShipping={isLoadingShipping}
                        shippingCost={shippingCost}
                    />
                    
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="w-full lg:w-5/12 lg:sticky lg:top-8">
                    <OrderSummary 
                        cartItems={cartItems}
                        removeFromCart={removeFromCart}
                        subtotal={subtotal}
                        discount={discount}
                        shippingCost={shippingCost}
                        total={total}
                        handleBuy={handleBuy}
                        isSubmitting={isSubmitting}
                    />
                </div>

            </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default TransactionPage;
