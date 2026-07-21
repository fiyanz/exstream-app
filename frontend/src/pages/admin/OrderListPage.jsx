import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, LogOut, Search, Filter, 
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
    if (s.includes('pending')) return <span className="px-3 py-1.5 bg-[#ffddba] border-2 border-[#c6955e] text-[#633f0f] text-sm font-bold rounded-lg flex items-center gap-2 w-max"><Clock size={16}/> {s.toUpperCase()}</span>;
    if (s === 'paid' || s === 'lunas') return <span className="px-3 py-1.5 bg-[#cee5da] border-2 border-[#52675e] text-[#0b1f18] text-sm font-bold rounded-lg flex items-center gap-2 w-max"><CheckCircle size={16}/> LUNAS</span>;
    if (s === 'dikirim' || s === 'diproses') return <span className="px-3 py-1.5 bg-[#d6e3ff] border-2 border-[#86a0cd] text-[#001b3c] text-sm font-bold rounded-lg flex items-center gap-2 w-max"><Truck size={16}/> {s.toUpperCase()}</span>;
    return <span className="px-3 py-1.5 bg-[#e3e2e6] border-2 border-[#c4c6cf] text-[#1a1c1e] text-sm font-bold rounded-lg">{status.toUpperCase()}</span>;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#faf9fd] font-sans text-[#1a1c1e]">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b-2 border-[#c4c6cf] sticky top-0 z-40">
        <div className="max-w-[800px] xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1a365d] rounded-lg flex items-center justify-center border-2 border-[#002045]">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#002045] tracking-tight">Kelola Pesanan</h1>
              </div>
              <div className="hidden md:flex items-center gap-3 border-l-2 pl-6 border-[#e3e2e6]">
                <button onClick={() => navigate('/admin/dashboard')} className="text-lg font-semibold text-[#43474e] hover:text-[#1a365d]">Dashboard</button>
                <span className="text-[#c4c6cf] font-bold">/</span>
                <button className="text-lg font-bold text-[#1a365d]">Pesanan</button>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 text-lg font-bold text-[#ba1a1a] hover:bg-[#ffdad6] border-2 border-transparent hover:border-[#ba1a1a] rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Toolbar (Search & Filter) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#74777f]" />
            <input 
              type="text" 
              placeholder="Cari ID, Nama, atau No HP..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#c4c6cf] rounded-lg focus:outline-none focus:border-[#1a365d] text-lg font-semibold text-[#1a1c1e]"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-6 h-6 text-[#74777f]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto px-4 py-4 bg-white border-2 border-[#c4c6cf] rounded-lg focus:outline-none focus:border-[#1a365d] text-lg font-bold text-[#1a1c1e]"
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
        <div className="bg-white border-2 border-[#c4c6cf] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f4f3f7] border-b-2 border-[#c4c6cf]">
                <tr>
                  <th className="px-6 py-5 text-sm font-bold text-[#43474e] uppercase">Order ID</th>
                  <th className="px-6 py-5 text-sm font-bold text-[#43474e] uppercase">Pelanggan</th>
                  <th className="px-6 py-5 text-sm font-bold text-[#43474e] uppercase">Pembayaran</th>
                  <th className="px-6 py-5 text-sm font-bold text-[#43474e] uppercase">Total</th>
                  <th className="px-6 py-5 text-sm font-bold text-[#43474e] uppercase">Status</th>
                  <th className="px-6 py-5 text-sm font-bold text-[#43474e] uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-xl font-bold text-[#74777f]">Memuat data...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-16 text-center text-[#74777f]">
                    <Package className="w-16 h-16 text-[#c4c6cf] mx-auto mb-4" />
                    <span className="text-xl font-bold">Tidak ada pesanan yang ditemukan.</span>
                  </td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b-2 border-[#e3e2e6] last:border-0 hover:bg-[#faf9fd] transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-mono text-lg text-[#1a365d] font-bold">{order.id.substring(0, 8).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-lg font-bold text-[#1a1c1e]">{order.nama_pengguna || '-'}</p>
                        <p className="text-base font-semibold text-[#43474e]">{order.no_telp}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 bg-[#f4f3f7] border-2 border-[#c4c6cf] text-[#1a1c1e] text-sm font-bold rounded-lg">
                          {order.details?.payment_method || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-lg font-bold text-[#1a1c1e]">
                        Rp {order.total?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setResi(order.details?.resi_pengiriman || '');
                          }}
                          className="px-4 py-2 border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white font-bold rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                          <Eye size={20} /> Lihat
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
            <div className="px-6 py-5 border-t-2 border-[#c4c6cf] bg-[#f4f3f7] flex items-center justify-between">
              <span className="text-lg text-[#43474e] font-semibold">
                Menampilkan <span className="font-bold text-[#1a1c1e]">{page * limit + 1}</span> - <span className="font-bold text-[#1a1c1e]">{Math.min((page + 1) * limit, total)}</span> dari <span className="font-bold text-[#1a1c1e]">{total}</span>
              </span>
              <div className="flex gap-4">
                <button 
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-3 border-2 border-[#c4c6cf] bg-white rounded-lg hover:border-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={24} className="text-[#1a1c1e]" />
                </button>
                <button 
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="p-3 border-2 border-[#c4c6cf] bg-white rounded-lg hover:border-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={24} className="text-[#1a1c1e]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1c1e]/80 backdrop-blur-sm">
          <div className="bg-white border-2 border-[#c4c6cf] rounded-lg shadow-xl w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-8 py-6 border-b-2 border-[#c4c6cf] flex justify-between items-center bg-[#f4f3f7]">
              <h2 className="text-2xl font-bold text-[#1a1c1e]">Detail Pesanan <span className="font-mono text-[#1a365d]">#{selectedOrder.id.substring(0, 8).toUpperCase()}</span></h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 border-2 border-transparent hover:border-[#ba1a1a] hover:text-[#ba1a1a] rounded-lg text-[#43474e] transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h3 className="text-sm font-bold text-[#74777f] uppercase tracking-wider mb-4 border-b-2 border-[#e3e2e6] pb-2">Informasi Pelanggan</h3>
                  <div className="space-y-4">
                    <p className="text-lg"><span className="font-bold text-[#43474e] block text-sm">Nama Lengkap</span> <span className="font-bold text-[#1a1c1e]">{selectedOrder.nama_pengguna}</span></p>
                    <p className="text-lg"><span className="font-bold text-[#43474e] block text-sm">Nomor Telepon</span> <span className="font-bold text-[#1a1c1e]">{selectedOrder.no_telp}</span></p>
                    <p className="text-lg"><span className="font-bold text-[#43474e] block text-sm">Alamat Pengiriman</span> <span className="font-bold text-[#1a1c1e]">{selectedOrder.alamat}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#74777f] uppercase tracking-wider mb-4 border-b-2 border-[#e3e2e6] pb-2">Ringkasan Biaya</h3>
                  <div className="space-y-3 bg-[#f4f3f7] p-6 rounded-lg border-2 border-[#c4c6cf]">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-[#43474e]">Subtotal</span>
                      <span className="text-[#1a1c1e]">Rp {(selectedOrder.details?.subtotal || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-[#43474e]">Ongkir ({selectedOrder.details?.shipping_method || 'Kurir'})</span>
                      <span className="text-[#1a1c1e]">Rp {(selectedOrder.details?.shipping_cost || 0).toLocaleString('id-ID')}</span>
                    </div>
                    {selectedOrder.details?.discount > 0 && (
                      <div className="flex justify-between text-lg font-semibold text-[#276749]">
                        <span>Diskon</span>
                        <span>-Rp {(selectedOrder.details?.discount || 0).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="pt-4 mt-4 border-t-2 border-[#c4c6cf] flex justify-between items-center">
                      <span className="font-bold text-[#1a1c1e] text-xl">Total</span>
                      <span className="font-bold text-[#1a365d] text-2xl">Rp {(selectedOrder.total || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-sm font-bold text-[#74777f] uppercase tracking-wider mb-4 border-b-2 border-[#e3e2e6] pb-2">Produk yang Dipesan</h3>
                <div className="border-2 border-[#c4c6cf] rounded-lg overflow-hidden">
                  {selectedOrder.details?.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 p-6 border-b-2 border-[#e3e2e6] last:border-0 hover:bg-[#f4f3f7]">
                      <div className="w-16 h-16 bg-[#e3e2e6] rounded-lg border-2 border-[#c4c6cf] flex-shrink-0 flex items-center justify-center">
                        <Package size={28} className="text-[#74777f]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-[#1a1c1e] text-xl mb-1">{item.name}</p>
                        <p className="text-base font-semibold text-[#43474e]">Warna: {item.color} &nbsp;|&nbsp; Ukuran: {item.size}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1a1c1e] text-xl mb-1">{item.quantity}x</p>
                        <p className="text-base font-semibold text-[#43474e]">@ Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  )) || <p className="p-6 text-lg font-semibold text-[#74777f]">Tidak ada detail produk.</p>}
                </div>
              </div>

              {/* Status Update Form */}
              <div className="bg-[#d6e3ff] rounded-lg p-6 border-2 border-[#1a365d]">
                <h3 className="text-lg font-bold text-[#001b3c] mb-6 flex items-center gap-3">
                  <Truck size={24} /> Update Pengiriman
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase">Ubah Status</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-[#1a365d] rounded-lg focus:outline-none focus:ring-4 focus:ring-[#adc7f7] text-lg font-bold text-[#1a1c1e]"
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
                    <label className="block text-sm font-bold text-[#1a365d] mb-2 uppercase">Nomor Resi (Jika Dikirim)</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan resi..."
                      value={resi}
                      onChange={(e) => setResi(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-[#1a365d] rounded-lg focus:outline-none focus:ring-4 focus:ring-[#adc7f7] text-lg font-bold text-[#1a1c1e]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-[#f4f3f7] border-t-2 border-[#c4c6cf] flex justify-end gap-4">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 text-lg font-bold text-[#1a1c1e] bg-white border-2 border-[#c4c6cf] hover:border-[#1a1c1e] hover:bg-[#e3e2e6] rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button 
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-8 py-3 bg-[#1a365d] hover:bg-[#002045] text-white text-lg font-bold rounded-lg border-2 border-[#002045] transition-all disabled:opacity-70 flex items-center gap-2"
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
