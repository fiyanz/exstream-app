import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, TrendingUp, LogOut, 
  ShoppingCart, DollarSign, Activity, AlertCircle 
} from 'lucide-react';
import { logout, getCurrentAdmin } from '../../services/authService';
import { getDashboardStats } from '../../services/adminService';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStatsData(data);
    } catch (err) {
      if (err.message === "Unauthorized") {
        logout();
        navigate("/admin/login");
      } else {
        toast.error("Gagal memuat statistik dasbor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const stats = [
    {
      title: 'Total Pesanan',
      value: statsData?.total_orders || '0',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      shadow: 'shadow-blue-100'
    },
    {
      title: 'Perlu Diproses',
      value: statsData?.pending_orders || '0',
      icon: AlertCircle,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      shadow: 'shadow-amber-100'
    },
    {
      title: 'Pesanan Selesai',
      value: statsData?.completed_orders || '0',
      icon: Package,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      shadow: 'shadow-emerald-100'
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${(statsData?.total_revenue || 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      shadow: 'shadow-indigo-100'
    }
  ];

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      active: true
    },
    {
      title: 'Kelola Pesanan',
      icon: Package,
      path: '/admin/orders',
      active: false
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Extrime Admin</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-800">{admin?.username || 'Admin'}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            Ringkasan Hari Ini
          </h2>
          <p className="text-slate-500 text-sm">Pantau aktivitas penjualan dan operasional toko Anda.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg ${stat.shadow}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.title}</h3>
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Akses Cepat</h3>
              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      item.active
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                        : 'border-gray-100 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.active ? 'bg-indigo-600' : 'bg-slate-100'
                    }`}>
                      <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <span className={`font-semibold text-sm ${item.active ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Snippet */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Pesanan Masuk Terbaru</h3>
                <button onClick={() => navigate('/admin/orders')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Lihat Semua &rarr;
                </button>
              </div>
              
              {statsData?.recent_orders?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 rounded-lg">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Metode</th>
                        <th className="px-4 py-3 rounded-r-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.recent_orders.map((o) => (
                        <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{o.id.substring(0, 8).toUpperCase()}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{o.nama_pengguna || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                              {o.payment_method}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              o.status.includes('pending') ? 'bg-amber-100 text-amber-700' :
                              o.status === 'PAID' || o.status === 'lunas' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {o.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>Belum ada pesanan terbaru.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
