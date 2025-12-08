import { Truck, CreditCard } from "lucide-react";
import SelectInput from "../common/form/SelectInput";
import { PAYMENT_METHODS } from "../../features/transactions/constants";

const PaymentSection = ({
  formData,
  errors,
  onChange,
  shippingOptions,
  isLoadingShipping,
  shippingCost,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4">
          <Truck className="text-blue-500" /> Pengiriman
        </h2>
        
        <SelectInput
          name="shippingMethod"
          value={formData.shippingMethod}
          options={shippingOptions.map((o) => ({
            id: o.id,
            name: `${o.label} - ${o.etd ? `(${o.etd} Hari)` : ""}`,
          }))}
          onChange={onChange}
          placeholder={isLoadingShipping ? "Sedang memuat..." : "Pilih Layanan"}
          disabled={!shippingOptions.length}
          icon={Truck}
          required
          error={errors.shippingMethod}
        />
        
        {shippingOptions.length > 0 && formData.shippingMethod && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center text-blue-800 animate-fade-in">
            <span className="text-sm font-medium">Estimasi Biaya:</span>
            <span className="font-bold">Rp {shippingCost.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4">
          <CreditCard className="text-purple-500" /> Pembayaran
        </h2>
        
        <SelectInput
          name="paymentMethod"
          value={formData.paymentMethod}
          options={PAYMENT_METHODS}
          onChange={onChange}
          placeholder="Pilih Pembayaran"
          icon={CreditCard}
          required
          error={errors.paymentMethod}
        />
        
        <p className="pt-2 text-xs text-gray-500 flex items-start gap-1.5">
          <span className="text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">i</span> 
          <span>Pastikan data penerima sudah valid sebelum melanjutkan pembayaran.</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentSection;
