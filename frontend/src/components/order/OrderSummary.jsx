import { ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { PRODUCT_DATA, PRODUCT_PRICE } from "../../features/transactions/constants";

const OrderSummary = ({
  cartItems,
  removeFromCart,
  subtotal,
  discount,
  shippingCost,
  total,
  handleBuy,
  isSubmitting,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
      <div className="p-6 md:p-8 bg-slate-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <h2 className="text-2xl font-bold flex items-center gap-3 relative z-10">
          <ShoppingBag size={24} className="text-indigo-400" /> Ringkasan
        </h2>
        <p className="text-slate-400 text-sm mt-1 relative z-10">
          Total {cartItems.length} item di keranjang
        </p>
      </div>

      <div className="p-6 md:p-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            Keranjang belanja kosong
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map((item, index) => (
              <div
                key={`${item.color}-${item.size}-${index}`}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 items-start relative group transition hover:shadow-sm hover:border-gray-200 hover:bg-white"
              >
                <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                  <img
                    src={PRODUCT_DATA.find((p) => p.color === item.color)?.image || "https://placehold.co/100"}
                    className="w-full h-full object-cover"
                    alt="item"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate text-sm">
                    Jas Hujan Extrime
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] uppercase tracking-wide text-gray-600 font-bold">
                      {item.color}
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] uppercase tracking-wide text-gray-600 font-bold">
                      {item.size}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-gray-700">
                    {item.quantity} x{" "}
                    <span className="text-indigo-600">
                      Rp {PRODUCT_PRICE.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-3 pt-6 border-t-[3px] border-gray-100 border-dashed">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">Rp {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-indigo-600 text-sm">
            <span>Diskon</span>
            <span className="font-bold">- Rp {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Ongkos Kirim</span>
            <span className="font-medium text-gray-900">
              {shippingCost === 0 ? "Gratis / Belum" : `Rp ${shippingCost.toLocaleString()}`}
            </span>
          </div>

          <div className="flex justify-between items-end pt-6 mt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Bayar</span>
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-800">
              Rp {total.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleBuy}
            disabled={isSubmitting || cartItems.length === 0}
            className="w-full mt-6 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-2 text-lg"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ShoppingBag size={22} />
            )}
            {isSubmitting ? "Memproses..." : "Buat Pesanan Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
