
import { Package } from 'lucide-react';

const OrderListPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Halaman kelola pesanan sedang dalam pengembangan...</p>
          <p className="text-sm text-gray-400 mt-2">Fitur lengkap akan segera tersedia</p>
        </div>
      </div>
    </div>
  );
};

export default OrderListPage;
