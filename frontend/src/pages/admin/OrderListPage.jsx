import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, LogOut, Search, Filter, 
  ChevronLeft, ChevronRight, Eye, Truck, CheckCircle, Clock, X
} from 'lucide-react';
import { logout, getCurrentAdmin } from '../../services/authService';
import { getOrders, updateOrderStatus } from '../../services/adminService';
import toast, { Toaster } from 'react-hot-toast';

const OrderListPage = () => {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resi, setResi] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page !== 0) setPage(0);
      else fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders(page * limit, limit, search, statusFilter);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      if (err.message === "Unauthorized") {
        logout();
        navigate("/admin/login");
      } else {
        toast.error("Gagal memuat pesanan.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await updateOrderStatus(selectedOrder.id, newStatus, resi);
      toast.success("Status berhasil diperbarui!");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error("Gagal memperbarui status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s.includes('pending')) return <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1 w-max"><Clock size={12}/> {s.toUpperCase()}</span>;
    if (s === 'paid' || s === 'lunas') return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1 w-max"><CheckCircle size={12}/> LUNAS</span>;
    if (s === 'dikirim' || s === 'diproses') return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1 w-max"><Truck size={12}/> {s.toUpperCase()}</span>;
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{status.toUpperCase()}</span>;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Kelola Pesanan</h1>
              </div>
              <div className="hidden md:flex items-center gap-2 border-l pl-6 border-gray-200">
                <button onClick={() => navigate('/admin/dashboard')} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Dashboard</button>
                <span className="text-slate-300">/</span>
                <button className="text-sm font-medium text-indigo-600">Pesanan</button>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toolbar (Search & Filter) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari ID, Nama, atau No HP..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-medium text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="pending_cod">Pending COD</option>
              <option value="pending_payment">Pending Transfer</option>
              <option value="PAID">Lunas (Transfer)</option>
              <option value="diproses">Diproses</option>
              <option value="dikirim">Dikirim</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID / Waktu</th>
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Pembayaran</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Memuat data...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    Tidak ada pesanan yang ditemukan.
                  </td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-indigo-600 font-semibold">{order.id.substring(0, 8).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{order.nama_pengguna || '-'}</p>
                        <p className="text-xs text-slate-500">{order.no_telp}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold rounded-md">
                          {order.details?.payment_method || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        Rp {order.total?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setResi(order.details?.resi_pengiriman || '');
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-slate-50 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Menampilkan <span className="font-semibold text-slate-800">{page * limit + 1}</span> - <span className="font-semibold text-slate-800">{Math.min((page + 1) * limit, total)}</span> dari <span className="font-semibold text-slate-800">{total}</span>
              </span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} className="text-slate-600" />
                </button>
                <button 
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 border border-gray-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Detail Pesanan <span className="font-mono text-indigo-600">#{selectedOrder.id.substring(0, 8).toUpperCase()}</span></h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Pelanggan</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-semibold text-slate-700">Nama:</span> {selectedOrder.nama_pengguna}</p>
                    <p className="text-sm"><span className="font-semibold text-slate-700">No HP:</span> {selectedOrder.no_telp}</p>
                    <p className="text-sm"><span className="font-semibold text-slate-700">Alamat:</span> {selectedOrder.alamat}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Biaya</h3>
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold text-slate-800">Rp {(selectedOrder.details?.subtotal || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Ongkir ({selectedOrder.details?.shipping_method || 'Kurir'})</span>
                      <span className="font-semibold text-slate-800">Rp {(selectedOrder.details?.shipping_cost || 0).toLocaleString('id-ID')}</span>
                    </div>
                    {selectedOrder.details?.discount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Diskon</span>
                        <span className="font-semibold">-Rp {(selectedOrder.details?.discount || 0).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="font-bold text-indigo-600 text-lg">Rp {(selectedOrder.total || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Produk yang Dipesan</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  {selectedOrder.details?.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-slate-50">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Package size={20} className="text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500">Warna: {item.color} | Ukuran: {item.size}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800 text-sm">{item.quantity}x</p>
                        <p className="text-xs text-slate-500">@ Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  )) || <p className="p-4 text-sm text-slate-500">Tidak ada detail produk.</p>}
                </div>
              </div>

              {/* Status Update Form */}
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Truck size={16} /> Update Pengiriman
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-800 mb-1">Ubah Status</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="pending_cod">Pending COD</option>
                      <option value="pending_payment">Pending Transfer</option>
                      <option value="PAID">Lunas (Transfer)</option>
                      <option value="diproses">Diproses</option>
                      <option value="dikirim">Dikirim</option>
                      <option value="selesai">Selesai</option>
                      <option value="batal">Dibatalkan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-800 mb-1">Nomor Resi (Jika Dikirim)</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan resi pengiriman..."
                      value={resi}
                      onChange={(e) => setResi(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <button 
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderListPage;
