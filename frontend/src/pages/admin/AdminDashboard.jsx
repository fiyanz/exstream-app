import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, LogOut, 
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
      color: 'bg-[#1960a3]'
    },
    {
      title: 'Perlu Diproses',
      value: statsData?.pending_orders || '0',
      icon: AlertCircle,
      color: 'bg-[#ba1a1a]'
    },
    {
      title: 'Pesanan Selesai',
      value: statsData?.completed_orders || '0',
      icon: Package,
      color: 'bg-[#276749]'
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${(statsData?.total_revenue || 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-[#002045]'
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
      <div className="min-h-screen flex items-center justify-center bg-[#faf9fd]">
        <Activity className="w-10 h-10 text-[#1a365d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9fd] font-sans text-[#1a1c1e]">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b-2 border-[#c4c6cf] sticky top-0 z-50">
        <div className="max-w-[800px] xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1a365d] rounded-lg flex items-center justify-center border-2 border-[#002045]">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#002045] tracking-tight">Extrime Admin</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-lg font-bold text-[#1a1c1e]">{admin?.username || 'Admin'}</p>
                <p className="text-sm font-semibold text-[#43474e]">Administrator</p>
              </div>
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
      <div className="max-w-[800px] xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#1a1c1e] mb-2">
            Ringkasan Hari Ini
          </h2>
          <p className="text-[#43474e] text-lg">Pantau aktivitas penjualan dan operasional toko Anda dengan jelas.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border-2 border-[#c4c6cf] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.color} rounded-lg flex items-center justify-center border-2 border-[#1a1c1e]`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="text-[#43474e] text-lg font-semibold mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold text-[#1a1c1e]">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-[#c4c6cf] p-6">
              <h3 className="text-xl font-bold text-[#1a1c1e] mb-6">Navigasi Utama</h3>
              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                      item.active
                        ? 'border-[#1a365d] bg-[#d6e3ff] shadow-sm'
                        : 'border-[#c4c6cf] hover:border-[#1a365d] hover:bg-[#f4f3f7]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      item.active ? 'bg-[#1a365d]' : 'bg-[#e3e2e6]'
                    }`}>
                      <item.icon className={`w-6 h-6 ${item.active ? 'text-white' : 'text-[#1a1c1e]'}`} />
                    </div>
                    <span className={`font-bold text-lg ${item.active ? 'text-[#001b3c]' : 'text-[#1a1c1e]'}`}>
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Snippet */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border-2 border-[#c4c6cf] p-6">
              <div className="flex items-center justify-between mb-6 border-b-2 border-[#e3e2e6] pb-4">
                <h3 className="text-xl font-bold text-[#1a1c1e]">Pesanan Masuk Terbaru</h3>
                <button onClick={() => navigate('/admin/orders')} className="text-lg font-bold text-[#1a365d] hover:underline">
                  Kelola Semua &rarr;
                </button>
              </div>
              
              {statsData?.recent_orders?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#f4f3f7] border-b-2 border-[#c4c6cf]">
                      <tr>
                        <th className="px-4 py-4 text-sm font-bold text-[#43474e] uppercase">Order ID</th>
                        <th className="px-4 py-4 text-sm font-bold text-[#43474e] uppercase">Nama</th>
                        <th className="px-4 py-4 text-sm font-bold text-[#43474e] uppercase">Metode</th>
                        <th className="px-4 py-4 text-sm font-bold text-[#43474e] uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsData.recent_orders.map((o) => (
                        <tr key={o.id} className="border-b-2 border-[#e3e2e6] last:border-0 hover:bg-[#faf9fd] transition-colors">
                          <td className="px-4 py-4 font-mono text-base font-bold text-[#1a365d]">{o.id.substring(0, 8).toUpperCase()}</td>
                          <td className="px-4 py-4 text-lg font-semibold text-[#1a1c1e]">{o.nama_pengguna || '-'}</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 bg-[#e3e2e6] border-2 border-[#c4c6cf] text-[#1a1c1e] text-sm font-bold rounded-lg">
                              {o.payment_method}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 text-sm font-bold rounded-lg border-2 ${
                              o.status.includes('pending') ? 'bg-[#ffddba] text-[#633f0f] border-[#c6955e]' :
                              o.status === 'PAID' || o.status === 'lunas' ? 'bg-[#cee5da] text-[#0b1f18] border-[#52675e]' :
                              'bg-[#d6e3ff] text-[#001b3c] border-[#86a0cd]'
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
                <div className="text-center py-12 text-[#43474e]">
                  <Package className="w-16 h-16 text-[#c4c6cf] mx-auto mb-4" />
                  <p className="text-lg font-semibold">Belum ada pesanan terbaru.</p>
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
