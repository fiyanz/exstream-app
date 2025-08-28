import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  CheckCircle,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import Hijau from "../../assets/Extrime/Cewek/HijauSage/Cewe4.jpeg";
import Ungu from "../../assets/Extrime/Cewek/Violet/Cewe3.jpeg";
import Dusty from "../../assets/Extrime/Cewek/DustyPink/Cewe3.jpeg";
import "./toast-animation.css";
import Pink from "../../assets/Extrime/Cewek/PInkMuda/Cewe3.jpeg";
import Bei from "../../assets/Extrime/Cowok/One3.jpeg";
import Nav from "../../assets/Extrime/Cowok/One1.jpeg";
import Blac from "../../assets/Extrime/Cowok/One.jpeg";
import arm from "../../assets/Extrime/Cowok/One2.jpeg";
import red from "../../assets/Extrime/Cowok/One4.jpeg";
import "./Cont.css";
import Testi from "../../assets/image/baju.png";

import {
  calculateShippingCost,
  formatShippingOptions,
} from "../../Data/hitungCostOngkir";
import {
  fetchProvinces,
  fetchCities,
  fetchSubdistricts,
  fetchVillages,
} from "../../Data/dataWilayah";
import {
  createTransaction,
  createStoreOrder,
  handleMidtransPaymentEnhanced,
  openWhatsappReceipt,
} from "../../Data/transactionService";

// Data for products, options, and mock location data.
const productData = [
  { color: "Hijau Sage", image: Hijau },
  { color: "Ungu Violet", image: Ungu },
  { color: "Dusty Pink", image: Dusty },
  { color: "Pink Muda", image: Pink },
  { color: "Beige / Khaki", image: Bei },
  { color: "Navy Blue", image: Nav },
  { color: "Black", image: Blac },
  { color: "Army Green", image: arm },
  { color: "Red", image: red },
];

const sizeOptions = ["L", "XL", "XXL", "XXXL"];

const paymentMethods = [
  { name: "transfer", label: "Transfer Bank, Virtual Account" },
  { name: "cod", label: "COD (Bayar Di Tempat)" },
];

// Product price configuration
const PRODUCT_PRICE = 299000;
const DISCOUNT_RATE = 0.5484; // 54.85% discount
const PRODUCT_WEIGHT = 1000;

// Reusable component for a Select dropdown.
const SelectInput = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  required,
  disabled = false,
  error,
}) => (
  <div className="flex flex-col">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-black on-1 mb-1.5"
    >
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
        <option value="" disabled>
          {placeholder}
        </option>
        {Array.isArray(options) &&
          options.map((option) => (
            <option
              key={
                typeof option === "object"
                  ? option.id || JSON.stringify(option)
                  : option
              }
              value={
                typeof option === "object"
                  ? option.id || option.value || option.name
                  : option
              }
            >
              {typeof option === "object"
                ? option.name || option.label
                : option}
            </option>
          ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {error && (
        <div className="flex items-center mt-1">
          <p className="text-xs text-gray-500" id={`${name}-error`}>
            {error}
          </p>
        </div>
      )}
    </div>
  </div>
);

// Reusable component for a Text input field.
const TextInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  error,
}) => (
  <div className="flex flex-col">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-black on-1 mb-1.5"
    >
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
          <p className="text-xs text-gray-500" id={`${name}-error`}>
            {error}
          </p>
        </div>
      )}
    </div>
  </div>
);

// Custom Error Boundary component to catch rendering errors gracefully
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(_error, _errorInfo) {
    // no-op in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-500 bg-red-100 border border-red-300 rounded-xl m-8">
          <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
          <p>
            We're sorry, but there was an error loading this component. Please
            try again later.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main Application Component.
const App = () => {
  // State for the product selection form (to add to cart)
  const [currentProduct, setCurrentProduct] = useState({
    size: "",
    color: "",
    quantity: 1,
  });

  // State for the list of products in the cart
  const [cartItems, setCartItems] = useState([]);

  // State for the main checkout form
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
    shippingCost: 0,
    taxCost: 0,
  });

  // State for validation errors
  const [formErrors, setFormErrors] = useState({});
  const [productErrors, setProductErrors] = useState({});

  // State for location data from API
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  // State for shipping options
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // State for loading and submission state
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Create refs for various form sections
  const productFormRef = useRef(null);
  const successRef = useRef(null);
  const cartRef = useRef(null);

  // Calculate prices dynamically based on state with useMemo for better performance.
  const { subtotal, discount, handlingFee, total } = useMemo(() => {
    const subtotalValue = cartItems.reduce(
      (acc, item) => acc + PRODUCT_PRICE * item.quantity,
      0
    );
    const discountValue = subtotalValue * DISCOUNT_RATE;
    const handlingFeeValue = 0; // Assuming no handling fee for now
    const totalValue =
      subtotalValue -
      discountValue +
      formData.shippingCost +
      formData.taxCost +
      handlingFeeValue;

    return {
      subtotal: subtotalValue,
      discount: discountValue,
      handlingFee: handlingFeeValue,
      total: totalValue,
    };
  }, [cartItems, formData.shippingCost, formData.taxCost]);

  // Function to format currency to IDR.
  const formatRupiah = useCallback((amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setIsLoadingLocations(true);
        const provincesData = await fetchProvinces();
        setProvinces(provincesData);
      } catch {
        /* no-op */
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    const loadCities = async () => {
      if (!formData.province) {
        setCities([]);
        return;
      }

      try {
        setIsLoadingLocations(true);
        const citiesData = await fetchCities(formData.province);
        setCities(citiesData);
        // Reset dependent fields
        setFormData((prev) => ({
          ...prev,
          city: "",
          subDistrict: "",
          village: "",
        }));
      } catch {
        /* no-op */
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadCities();
  }, [formData.province]);

  // Load subdistricts when city changes
  useEffect(() => {
    const loadSubdistricts = async () => {
      if (!formData.city) {
        setSubdistricts([]);
        return;
      }

      try {
        setIsLoadingLocations(true);
        const subdistrictsData = await fetchSubdistricts(formData.city);
        setSubdistricts(subdistrictsData);
        // Reset dependent fields
        setFormData((prev) => ({
          ...prev,
          subDistrict: "",
          village: "",
        }));
      } catch {
        /* no-op */
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadSubdistricts();
  }, [formData.city]);

  // Load villages when subdistrict changes
  useEffect(() => {
    const loadVillages = async () => {
      if (!formData.subDistrict) {
        setVillages([]);
        return;
      }

      try {
        setIsLoadingLocations(true);
        const villagesData = await fetchVillages(formData.subDistrict);
        setVillages(villagesData);
        // Reset dependent fields
        setFormData((prev) => ({
          ...prev,
          village: "",
        }));
      } catch {
        /* no-op */
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadVillages();
  }, [formData.subDistrict]);

  // Calculate shipping cost when all location fields are filled
  useEffect(() => {
    const calculateShipping = async () => {
      // Check if all location fields are filled
      if (
        !formData.province ||
        !formData.city ||
        !formData.subDistrict ||
        !formData.village
      ) {
        setShippingOptions([]);
        setFormData((prev) => ({
          ...prev,
          shippingMethod: "",
          shippingCost: 0,
          taxCost: 0,
        }));
        return;
      }

      try {
        setIsLoadingShipping(true);

        // Use the actual village ID for shipping calculation
        const shippingData = await calculateShippingCost({
          receiver_destination_id: formData.village,
          weight: PRODUCT_WEIGHT,
        });

        if (shippingData.success) {
          const options = formatShippingOptions(shippingData);
          setShippingOptions(options);
        } else {
          setShippingOptions([]);
        }
      } catch {
        setShippingOptions([]);
      } finally {
        setIsLoadingShipping(false);
      }
    };

    calculateShipping();
  }, [
    formData.province,
    formData.city,
    formData.subDistrict,
    formData.village,
    subtotal,
    formData.paymentMethod,
  ]);

  // Handler for the product selection form input changes with validation
  const handleProductSelectionChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setCurrentProduct((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field when it's being edited
      if (productErrors[name]) {
        setProductErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [productErrors]
  );

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
      errors.size = "Ukuran wajib dipilih";
    }

    if (!currentProduct.color) {
      errors.color = "Warna wajib dipilih";
    }

    if (currentProduct.quantity < 1) {
      errors.quantity = "Jumlah minimal 1";
    }

    setProductErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentProduct]);

  // Handler for adding the current product selection to the cart
  const handleAddProduct = useCallback(() => {
    const isValid = validateProductSelection();

    if (isValid) {
      setCartItems((prevItems) => [
        ...prevItems,
        { ...currentProduct, id: Date.now() },
      ]);
      // Reset the product selection form
      setCurrentProduct({
        size: "",
        color: "",
        quantity: 1,
      });

      // Scroll to cart if it exists
      // if (cartRef.current) {
      //   setTimeout(() => {
      //     cartRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      //   }, 100);
      // }
    }
  }, [currentProduct, validateProductSelection]);

  // Handler for removing an item from the cart with animation
  const handleRemoveItem = useCallback((id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  // Handler for main checkout form input changes with improved validation.
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Handle special case for telephone: ensure it starts with 8 and contains only numbers
      if (name === "telephone") {
        // Remove non-numeric characters
        const numericValue = value.replace(/\D/g, "");

        // Ensure it starts with 8
        const formattedValue =
          numericValue.startsWith("0") || numericValue.startsWith("62")
            ? numericValue.replace(/^(0|62)/, "0") // Replace leading 0 or 62 with 8
            : numericValue.startsWith("0")
            ? numericValue
            : numericValue
            ? `0${numericValue}`
            : "";

        setFormData((prevData) => ({
          ...prevData,
          [name]: formattedValue,
        }));

        return;
      }

      // Handle all other fields
      setFormData((prevData) => {
        let newFormData = { ...prevData, [name]: value };

        // Clear dependent location fields when a higher-level field changes.
        if (name === "province") {
          newFormData = {
            ...newFormData,
            city: "",
            subDistrict: "",
            village: "",
          };
        } else if (name === "city") {
          newFormData = { ...newFormData, subDistrict: "", village: "" };
        } else if (name === "subDistrict") {
          newFormData = { ...newFormData, village: "" };
        }

        // Logic to set shipping and tax costs based on the selected shipping method.
        if (name === "shippingMethod") {
          const selectedShipping = shippingOptions.find(
            (option) => option.id === value
          );
          if (selectedShipping) {
            newFormData.shippingCost = selectedShipping.cost;
            newFormData.taxCost = 0; // Tax is included in shipping cost from API
          } else {
            newFormData.shippingCost = 0;
            newFormData.taxCost = 0;
          }
        }

        // Clear error for this field when it's being edited
        if (formErrors[name]) {
          setFormErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }

        return newFormData;
      });
    },
    [formErrors, shippingOptions]
  );

  // Function to validate form with specific error messages
  const validateForm = useCallback(() => {
    const errors = {};
    const requiredFields = [
      "fullName",
      "telephone",
      "province",
      "city",
      "subDistrict",
      "village",
      "completeAddress",
      "shippingMethod",
      "paymentMethod",
    ];

    // Check for empty required fields
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "Bidang ini wajib diisi";
      }
    });

    // Tidak ada validasi khusus untuk nomor telepon

    // Validate cart has items
    if (cartItems.length === 0) {
      errors.cart = "Keranjang belanja tidak boleh kosong";
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
      successRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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

        // Helper function to get location name by ID
        const getLocationNameById = (id, locationList) => {
          const location = locationList.find((loc) => loc.id === id);
          return location ? location.name : "";
        };

        // Get location names
        const provinceName = getLocationNameById(formData.province, provinces);
        const cityName = getLocationNameById(formData.city, cities);
        const subdistrictName = getLocationNameById(
          formData.subDistrict,
          subdistricts
        );
        const villageName = getLocationNameById(formData.village, villages);

        // Common data preparation with proper location names
        const address = `${formData.completeAddress}${
          villageName ? `, ${villageName}` : ""
        }${subdistrictName ? `, Kec. ${subdistrictName}` : ""}${
          cityName ? `, ${cityName}` : ""
        }${provinceName ? `, ${provinceName}` : ""}`;
        const destination_id =
          formData.village || formData.subDistrict || formData.city;
        const paymentMethod = formData.paymentMethod
          .toLowerCase()
          .includes("cod")
          ? "COD"
          : "Transfer";

        // Data for COD orders (direct to store_order)
        const orderData = {
          // Customer information
          fullName: formData.fullName,
          telephone: formData.telephone,
          address: address,
          destination_id: destination_id,
          province: formData.province,
          city: formData.city,
          // Add location names for better address display
          province_name: provinceName,
          city_name: cityName,
          subdistrict_name: subdistrictName,
          village_name: villageName,
          // Add resolved locations object for transaction service
          resolved_locations: {
            province_name: provinceName,
            city_name: cityName,
            subdistrict_name: subdistrictName,
            village_name: villageName,
          },

          // Order items
          items: cartItems.map((item) => ({
            name: "Jas Hujan Extrime",
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            price: PRODUCT_PRICE,
            product_weight: PRODUCT_WEIGHT, // Berat dalam gram
            variant: `${item.color} - ${item.size}`,
          })),

          // Shipping and payment
          shippingMethod: formData.shippingMethod,
          shippingCost: formData.shippingCost,
          paymentMethod: paymentMethod,

          // Pricing
          totalAmount: total,
        };

        // Handle different paths based on payment method
        let transactionResult;

        if (formData.paymentMethod.toLowerCase().includes("cod")) {
          // For COD, send order data; service will format and auto-redirect to WhatsApp
          transactionResult = await createStoreOrder(orderData);

          // Ensure we have necessary data for the success page
          if (transactionResult && transactionResult.data) {
            // Add direct access to common fields from the Komerce response
            transactionResult.id =
              transactionResult.data.order_id ||
              transactionResult.id ||
              "COD-" + Date.now();
            transactionResult.total = total;
            transactionResult.grand_total = total;
          }
        } else {
          // For transfers/non-COD, create transaction with Midtrans integration

          // Format data for enhanced transaction API
          const enhancedOrderData = {
            customer_name: formData.fullName,
            customer_phone: formData.telephone,
            customer_address: formData.completeAddress,
            province: formData.province,
            city: formData.city,
            subdistrict: formData.subDistrict,
            village: formData.village,
            // Add location names for better address display
            province_name: provinceName,
            city_name: cityName,
            subdistrict_name: subdistrictName,
            village_name: villageName,
            // Add resolved locations object for transaction service
            resolved_locations: {
              province_name: provinceName,
              city_name: cityName,
              subdistrict_name: subdistrictName,
              village_name: villageName,
            },
            items: cartItems.map((item) => ({
              name: "Jas Hujan Extrime",
              color: item.color,
              size: item.size,
              quantity: item.quantity,
              price: PRODUCT_PRICE,
              variant: `${item.color} - ${item.size}`,
              product_weight: PRODUCT_WEIGHT,
            })),
            shipping_method: formData.shippingMethod,
            payment_method: "Transfer", // Explicitly set as Transfer
            shipping_cost: formData.shippingCost,
            subtotal: subtotal,
            discount: discount,
            total: total,
          };

          transactionResult = await createTransaction(enhancedOrderData);
        }

        // Log transaction details

        // Make sure we have a valid transaction result before proceeding
        if (
          transactionResult &&
          (transactionResult.data || transactionResult.id)
        ) {
          // Store the order details for the success page
          setOrderDetails(transactionResult);
          setOrderPlaced(true);
          // console.log('Order placed successfully:', transactionResult);
        } else {
          console.error("Invalid transaction result:", transactionResult);
          throw new Error(
            "Respons dari server tidak valid. Silakan coba lagi."
          );
        }
        // Handle response based on payment method
        if (formData.paymentMethod.toLowerCase().includes("cod")) {
          // COD - Direct success
        } else {
          // Non-COD - Check for Midtrans payment details

          // Handle Midtrans payment
          if (transactionResult.redirect_url) {
            // If we have redirect_url but no token, use redirect directly
            handleMidtransPaymentEnhanced(
              transactionResult.token || null,
              transactionResult.redirect_url
            );
          }
        }
      } catch {
        /* no-op */
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Scroll to the first error field
      const errorFieldNames = Object.keys(formErrors);
      if (errorFieldNames.length > 0) {
        const firstErrorField = errorFieldNames[0];

        // Find element by ID or name attribute
        const errorElement = document.querySelector(
          `[name="${firstErrorField}"], #${firstErrorField}`
        );
        if (errorElement) {
          // Scroll to error element with some offset to make it visible
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          errorElement.focus();
        } else if (firstErrorField === "cart") {
          // If cart is empty, scroll to the product selection form
          if (productFormRef.current) {
            productFormRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      }
    }
  }, [
    validateForm,
    formErrors,
    formData,
    cartItems,
    subtotal,
    discount,
    total,
  ]);

  // Handler to reset the state for "Belanja Lagi" button
  const handleBackToForm = useCallback(() => {
    // Reset all state
    setOrderPlaced(false);
    setOrderDetails(null);
    setCartItems([]);
    setFormErrors({});
    setProductErrors({});

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
      shippingCost: 0,
      taxCost: 0,
    });

    setCurrentProduct({
      size: "",
      color: "",
      quantity: 1,
    });

    // Scroll back to the top of the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Get the image URL for the currently selected product, memoized for performance
  const getProductImage = useMemo(() => {
    const selectedProduct = productData.find(
      (p) => p.color === currentProduct.color
    );
    return selectedProduct
      ? selectedProduct.image
      : "https://placehold.co/220x250/D2E1C9/4A5746?text=Pilih+Warna";
  }, [currentProduct.color]);

  // Render the main form and the optional success message.
  return (
    <ErrorBoundary>
      <div className="rounded-xl font-sans on-a">
        {orderPlaced ? (
          <div
            ref={successRef}
            className="success-message-container animate__animated animate__fadeIn suces"
          >
            <div className="flex flex-col lg:flex-row items-center justify-center ">
              <div className="flex flex-col items-center text-center lg:text-left lg:w-1/2 gap-7">
                <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-2 animate__animated animate__pulse ">
                  <CheckCircle size={50} className="text-green-600" />
                </div>

                <div className="bg-green-50 text-green-800 px-4 py-1 rounded-full text-sm font-medium inline-flex items-center">
                  <span>
                    Order #
                    {orderDetails?.id ||
                      `ES${Math.floor(Math.random() * 100000)}`}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight ">
                  Pembelian Berhasil!
                </h1>

                <p className="text-gray-600 text-lg ">
                  {formData.paymentMethod.toLowerCase().includes("cod") ? (
                    <>
                      Terima kasih telah memilih Jas Hujan Extrime!
                      <br />
                      Pesanan COD Anda telah dibuat. Pembayaran dilakukan saat
                      barang diterima.
                    </>
                  ) : (
                    <>
                      Terima kasih telah memilih Jas Hujan Extrime!
                      <br />
                      Silakan lakukan pembayaran untuk menyelesaikan pesanan
                      Anda.
                    </>
                  )}
                </p>

                <div className="w-full">
                  <h3 className="font-semibold text-gray-800 mb-4 text-lg inf-1">
                    Informasi Pesanan
                  </h3>
                  <ul className="border-t flex flex-col gap-3 ul-su">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium text-gray-900">
                        {formData.fullName}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">
                        {formatRupiah(subtotal)}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Diskon:</span>
                      <span className="font-medium text-gray-900">
                        -{formatRupiah(discount)}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Ongkir:</span>
                      <span className="font-medium text-gray-900">
                        {formatRupiah(formData.shippingCost)}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Total Bayar:</span>
                      <span className="font-bold text-2xl text-green-500">
                        {formatRupiah(
                          orderDetails?.total ||
                            orderDetails?.grand_total ||
                            total
                        )}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Metode:</span>
                      <span className="font-semibold text-gray-900">
                        {formData.paymentMethod}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Pengiriman:</span>
                      <span className="font-medium text-gray-900">
                        {formData.shippingMethod}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-gray-900">
                        {formData.paymentMethod.toLowerCase().includes("cod")
                          ? "Menunggu Pengiriman (COD)"
                          : "Menunggu Pembayaran"}
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleBackToForm}
                  className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600  text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300 but-text flex items-center justify-center buu-su"
                >
                  <div className="flex items-center justify-center gap-3">
                    <RefreshCcw size={20} />
                    <span>Belanja Lagi</span>
                  </div>
                </button>
              </div>
              <div className="relative lg:w-1/2 flex flex-col justify-center items-center mt-10 lg:mt-0">
                <div className="bg-gradient-to-br from-green-100 to-blue-100 p-1 rounded-2xl shadow-lg">
                  <div className="absolute -top-5 -left-5 z-10 bg-yellow-400 rounded-full w-16 h-16 flex items-center justify-center rotate-12 shadow-lg">
                    <span className="font-bold text-white text-lg">New!</span>
                  </div>
                  <img
                    src={Testi}
                    alt="Successful purchase confirmation"
                    className="img-test rounded-xl shadow-md border-2 border-white transform transition-transform duration-300 hover:scale-110 object-cover w-full h-full max-w-xs"
                  />
                </div>
                <div className="flex justify-center w-full mt-6">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openWhatsappReceipt();
                    }}
                    className="text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300 flex items-center gap-1 cek-sta"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    Cek status pesanan
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="gap-8 lg:gap-16 mt-8">
            {/* Left Section: Product Selection and Shipping Form */}
            <div className="space-y-10">
              {/* Product Selection Card */}
              <div className="Pil-Ap" ref={productFormRef}>
                <h2 className="text-2xl font-bold mb-6 text-black li-on text-center">
                  Pilih Produk
                </h2>
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-8 on-a1">
                  <div className="w-full md:w-auto flex justify-center md:justify-start">
                    <img
                      src={getProductImage}
                      alt={
                        currentProduct.color
                          ? `Jas Hujan ${currentProduct.color}`
                          : "Pilih Warna Jas Hujan"
                      }
                      className="w-[220px] h-[250px] rounded-lg object-cover shadow-md flex-shrink-0 ig-1 transition-all duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/150x200/A0D8B3/333?text=Product+Image";
                        e.target.alt = "Placeholder Image";
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
                        <p className="mt-1 text-xs text-gray-500">
                          {productErrors.quantity}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleAddProduct}
                      type="button"
                      className={`w-full h-12 py-4 px-6 font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center text-lg
                                  ${
                                    currentProduct.size && currentProduct.color
                                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  }`}
                      style={{
                        boxShadow:
                          currentProduct.size && currentProduct.color
                            ? "0 4px 14px rgba(79, 70, 229, 0.3)"
                            : "none",
                      }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <ShoppingBag size={22} />
                        <span>TambahKan Pesanan</span>
                      </div>
                    </button>
                    <p className="text-center text-sm ">
                      Pastikan Klik Dulu sebelum Pemesanan
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Details Form Card */}
              <div className="mt-8 det-ap">
                <h2 className="text-2xl font-bold text-black on-a4 text-center">
                  Detail Pengiriman
                </h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Pilih lokasi dari dropdown untuk menghitung ongkos kirim
                  secara otomatis
                </p>
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
                      placeholder="087712345678"
                      required
                      error={formErrors.telephone}
                    />
                    {!formErrors.telephone && (
                      <p className="text-xs text-gray-500 mt-1">
                        Contoh: 081234567890 (tanpa awalan 0 atau +62)
                      </p>
                    )}
                  </div>
                  <SelectInput
                    label="Provinsi"
                    name="province"
                    value={formData.province}
                    options={provinces.map((p) => ({ id: p.id, name: p.name }))}
                    onChange={handleInputChange}
                    placeholder={
                      isLoadingLocations ? "Memuat..." : "Pilih Provinsi"
                    }
                    required
                    disabled={isLoadingLocations}
                    error={formErrors.province}
                  />
                  <SelectInput
                    label="Kota/Kabupaten"
                    name="city"
                    value={formData.city}
                    options={cities.map((c) => ({ id: c.id, name: c.name }))}
                    onChange={handleInputChange}
                    placeholder={
                      !formData.province
                        ? "Pilih provinsi dulu"
                        : isLoadingLocations
                        ? "Memuat..."
                        : "Pilih Kota/Kabupaten"
                    }
                    required
                    disabled={!formData.province || isLoadingLocations}
                    error={formErrors.city}
                  />
                  <SelectInput
                    label="Kecamatan"
                    name="subDistrict"
                    value={formData.subDistrict}
                    options={subdistricts.map((s) => ({
                      id: s.id,
                      name: s.name,
                    }))}
                    onChange={handleInputChange}
                    placeholder={
                      !formData.city
                        ? "Pilih kota dulu"
                        : isLoadingLocations
                        ? "Memuat..."
                        : "Pilih Kecamatan"
                    }
                    required
                    disabled={!formData.city || isLoadingLocations}
                    error={formErrors.subDistrict}
                  />
                  <SelectInput
                    label="Desa"
                    name="village"
                    value={formData.village}
                    options={villages.map((v) => ({ id: v.id, name: v.name }))}
                    onChange={handleInputChange}
                    placeholder={
                      !formData.subDistrict
                        ? "Pilih kecamatan dulu"
                        : isLoadingLocations
                        ? "Memuat..."
                        : "Pilih Desa"
                    }
                    required
                    disabled={!formData.subDistrict || isLoadingLocations}
                    error={formErrors.village}
                  />
                </div>
                <div className="mt-6 on-10">
                  <div className="flex flex-col">
                    <label
                      htmlFor="completeAddress"
                      className="block text-sm font-medium text-black al-1 mb-1.5"
                    >
                      Alamat Lengkap{" "}
                      {formErrors.completeAddress && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      id="completeAddress"
                      name="completeAddress"
                      rows="3"
                      value={formData.completeAddress}
                      onChange={handleInputChange}
                      placeholder="Jl. Kenanga No. 23 RT 02 RW 05, (Depan Toko Sembako Makmur, Belakang Klinik Sehat Sentosa)"
                      className={`w-full h-[160px] p-3 border ${
                        formErrors.completeAddress
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base text-black al-11`}
                      required
                      aria-invalid={
                        formErrors.completeAddress ? "true" : "false"
                      }
                      aria-describedby={
                        formErrors.completeAddress
                          ? "completeAddress-error"
                          : undefined
                      }
                    ></textarea>
                    {formErrors.completeAddress && (
                      <p
                        id="completeAddress-error"
                        className="mt-1 text-xs text-red-500"
                      >
                        {formErrors.completeAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping and Payment Methods Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 met-ap on-10">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    Metode Pengiriman
                  </h2>
                  <SelectInput
                    label=""
                    name="shippingMethod"
                    value={formData.shippingMethod}
                    options={shippingOptions.map((option) => ({
                      id: option.id,
                      name: option.label,
                    }))}
                    onChange={handleInputChange}
                    placeholder={
                      isLoadingShipping
                        ? "Menghitung ongkir..."
                        : "Pilih Metode Pengiriman"
                    }
                    required
                    disabled={isLoadingShipping || shippingOptions.length === 0}
                    error={formErrors.shippingMethod}
                  />
                  {formData.shippingMethod && (
                    <div className="mt-3 text-sm">
                      <p className="text-gray-600">
                        Biaya: {formatRupiah(formData.shippingCost)}
                      </p>
                      {shippingOptions.find(
                        (opt) => opt.id === formData.shippingMethod
                      )?.etd && (
                        <p className="text-gray-600">
                          Estimasi:{" "}
                          {
                            shippingOptions.find(
                              (opt) => opt.id === formData.shippingMethod
                            )?.etd
                          }
                        </p>
                      )}
                    </div>
                  )}
                  {isLoadingShipping && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menghitung ongkos kirim...</span>
                    </div>
                  )}
                  {!isLoadingShipping &&
                    shippingOptions.length === 0 &&
                    formData.province &&
                    formData.city &&
                    formData.subDistrict &&
                    formData.village && (
                      <div className="mt-3 text-sm text-gray-500">
                        <p>
                          Menunggu pemilihan lokasi lengkap untuk menghitung
                          ongkos kirim
                        </p>
                      </div>
                    )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    Metode Pembayaran
                  </h2>
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
                      <p className="text-gray-600">
                        {formData.paymentMethod.includes("COD")
                          ? "Pembayaran dilakukan saat barang diterima"
                          : "Lakukan pembayaran setelah checkout"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section: Order Summary Card */}
            <div className="lg:self-start lg:sticky lg:top-8">
              <h2 className="text-2xl font-bold text-black text-center mb-6 on-bo">
                Ringkasan Pesanan
              </h2>
              <div className="rounded-xl shadow-lg on-b">
                {/* Cart Items List */}
                <div className="pb-10 border-b on-b1" ref={cartRef}>
                  {cartItems.length > 0 ? (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-row items-center gap-4 p-4 rounded-lg shadow-sm on-b2 transition-all duration-200 hover:shadow-md"
                        >
                          <img
                            src={
                              productData.find((p) => p.color === item.color)
                                ?.image ||
                              "https://placehold.co/100x120/A0D8B3/333?text=Item"
                            }
                            alt={`Jas Hujan ${item.color}`}
                            className="w-24 h-auto rounded-lg object-cover on-b21"
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/100x120/A0D8B3/333?text=Item";
                              e.target.alt = "Placeholder Image";
                            }}
                          />
                          <div className="flex-1 on-b22 text-left">
                            <h4 className="font-semibold text-white text-lg h4">
                              Jas Hujan
                            </h4>
                            <p className="text-white text-sm p">
                              Warna: {item.color}
                            </p>
                            <p className="text-white text-sm p">
                              Ukuran: {item.size}
                            </p>
                            <p className="text-white text-sm p">
                              Jumlah: {item.quantity}
                            </p>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end">
                            <span className="font-bold text-white pu">
                              {formatRupiah(PRODUCT_PRICE * item.quantity)}
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
                            onClick={() =>
                              productFormRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              })
                            }
                            className="w-full h-12 mt-3 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                            type="button"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
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
                    <span className="line-through">
                      {formatRupiah(discount)}
                    </span>
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
                    <span>
                      {formData.taxCost > 0
                        ? formatRupiah(formData.taxCost)
                        : "N/A"}
                    </span>
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
                                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
