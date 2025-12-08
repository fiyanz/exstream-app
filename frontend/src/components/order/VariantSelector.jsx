import { Package, Minus, Plus, ShoppingBag } from "lucide-react";
import SelectInput from "../common/form/SelectInput";

const VariantSelector = ({
  productData,
  sizeOptions,
  currentProduct,
  onProductChange,
  onQuantityChange,
  onAddToCart,
  errors,
  productFormRef
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4 mb-6">
        <Package className="text-indigo-600" /> Pilih Varian
      </h2>

      <div ref={productFormRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectInput
          name="color"
          value={currentProduct.color}
          options={productData.map((p) => ({ id: p.color, name: p.color }))}
          onChange={onProductChange}
          placeholder="Pilih Warna"
          label="Warna"
          required
          error={errors.color}
        />
        <SelectInput
          name="size"
          value={currentProduct.size}
          options={sizeOptions.map((s) => ({ id: s, name: s }))}
          onChange={onProductChange}
          placeholder="Pilih Ukuran"
          label="Ukuran"
          required
          error={errors.size}
        />
      </div>

      <div className="mt-8 flex items-end gap-6">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Jumlah
          </label>
          <div className="flex items-center w-max border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <button
              onClick={() => onQuantityChange("decrement")}
              className="p-3.5 hover:bg-gray-100 border-r border-gray-200 transition text-gray-600"
            >
              <Minus size={18} />
            </button>
            <span className="w-14 text-center font-bold text-gray-900 text-lg">
              {currentProduct.quantity}
            </span>
            <button
              onClick={() => onQuantityChange("increment")}
              className="p-3.5 hover:bg-gray-100 border-l border-gray-200 transition text-gray-600"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <button
          onClick={onAddToCart}
          className="flex-1 bg-slate-900 text-white py-4 px-6 rounded-xl font-bold hover:bg-black transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <ShoppingBag size={20} /> Tambahkan
        </button>
      </div>

      {currentProduct.color && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl flex items-center gap-5 animate-fade-in border border-gray-200/60">
          <img
            src={productData.find((p) => p.color === currentProduct.color)?.image}
            alt={currentProduct.color}
            className="w-24 h-24 object-cover rounded-lg shadow-sm bg-white"
          />
          <div>
            <h4 className="font-bold text-gray-900 text-lg">
              Jas Hujan Extrime - {currentProduct.color}
            </h4>
            <div className="flex items-center gap-2 mt-1">
               <span className="px-2.5 py-0.5 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-600">
                  {currentProduct.size || "Pilih Ukuran"}
               </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
