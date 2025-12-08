
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Package,
  TrendingUp,
  LogOut,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { logout, getCurrentAdmin } from '../../services/authService';
import { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
    }
  };

  const stats = [
    {
      title: 'Total Pesanan',
      value: '0',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pesanan Pending',
      value: '0',
      icon: Package,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Pesanan Selesai',
      value: '0',
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Pendapatan',
      value: 'Rp 0',
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{admin?.email || ''}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang, {admin?.username}! 👋
          </h2>
          <p className="text-gray-600">Berikut adalah ringkasan pesanan Anda hari ini</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                  item.active
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  item.active ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <item.icon className={`w-6 h-6 ${item.active ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span className={`font-semibold ${item.active ? 'text-blue-600' : 'text-gray-700'}`}>
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Sistem Admin Dashboard</h3>
          <p className="text-blue-100 mb-6">
            Kelola semua pesanan, lacak paket, dan lihat laporan transaksi dalam satu tempat.
          </p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition"
          >
            Lihat Semua Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
