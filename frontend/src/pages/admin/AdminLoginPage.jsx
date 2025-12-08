import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Loader2, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { login } from '../../services/authService';
import toast, { Toaster } from 'react-hot-toast';
import TextInput from '../../components/common/form/TextInput';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Login Berhasil!</p>
                <p className="mt-1 text-sm text-gray-500">Mengalihkan ke dashboard...</p>
              </div>
            </div>
          </div>
        </div>
      ));
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.detail || 'Login gagal. Cek kembali kredensial Anda.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-50 flex items-center justify-center p-8 font-sans text-gray-800">
      <Toaster position="top-center" />
      
      {/* Lebar card ditambah agar lebih proporsional dengan padding baru */}
      <div className="max-w-[480px] w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden transition-all duration-300">
        
        {/* Header Section - Menggunakan Flexbox untuk centering sempurna & Padding diperbesar */}
        <div className="flex flex-col items-center justify-center pt-14 pb-8 px-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-8 shadow-lg shadow-blue-200 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <Shield className="text-white w-10 h-10" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Halo, Admin! 👋</h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm">
            Silakan masuk untuk mengelola <br/> <span className="font-semibold text-blue-600">Exstream App</span>
          </p>
        </div>

        {/* Form Section - Padding diperbesar agar tidak mepet */}
        <div className="px-12 pb-14">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <TextInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="admin_user"
              icon={User}
              required
            />

            {/* Password Field */}
            <div className="relative">
              <TextInput
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                required
              />
               <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute bottom-3 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none z-10"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Lupa Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 flex justify-center items-center px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Sedang Masuk...
                </>
              ) : (
                'Masuk Dashboard'
              )}
            </button>
          </form>
        </div>
        
        {/* Footer Minimalis */}
        <div className="bg-gray-50/50 py-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            SECURE ADMIN ACCESS • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;