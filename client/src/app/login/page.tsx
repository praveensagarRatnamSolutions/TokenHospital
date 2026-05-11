'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import {
  setCredentials,
  setError as setAuthError,
  setLoading as setAuthLoading,
} from '@/store/slices/authSlice';
import { authApi, LoginRequest } from '@/services/authApi';
import { Eye, EyeOff, Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      dispatch(setAuthLoading(true));

      console.log('Sending login request with:', formData);
      const userData = await authApi.login(formData);
      console.log('Login response:', userData);

      // authApi already returns the data object directly
      if (!userData || !userData._id) {
        throw new Error('Invalid response from server');
      }

      // Store credentials in Redux
      dispatch(
        setCredentials({
          user: {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            doctorId: userData?.doctorId || null,
            hospitalId: userData.hospitalId,
          },
          accessToken: userData.token,
          refreshToken: userData.token,
        }),
      );

      // Redirect based on role
      const role = userData.role;

      console.log('Role:', role);
      if (role === 'SUPERADMIN') {
        router.push('/superadmin');
      } else if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'DOCTOR') {
        router.push('/doctor');
      } else {
        router.push('/kiosk');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/20 mb-4">
            <span className="text-3xl font-bold text-white">H</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hospital Token <span className="text-blue-500">SaaS</span></h1>
          <p className="text-slate-400 mt-2">Precision queue management for healthcare.</p>
        </div>

        {/* Main Card with Glassmorphism */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <div className="w-1 h-8 bg-red-500 rounded-full" />
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@hospital.com"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-offset-slate-900" />
                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Keep me signed in</span>
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader className="w-6 h-6 animate-spin" /> : 'Sign In to Portal'}
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-8 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <p className="text-[10px] uppercase tracking-widest font-bold text-blue-400 mb-3">Developer Sandbox</p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between text-slate-400"><span>SuperAdmin:</span> <span className="text-blue-300 font-mono">superadmin@system.com</span></div>
              <div className="flex justify-between text-slate-400"><span>Admin:</span> <span className="text-blue-300 font-mono">admin@anupama.com</span></div>
            </div>
          </div>

          {/* Secondary Action */}
          <div className="mt-8 text-center text-slate-400 text-sm">
            New hospital?{' '}
            <a
              href="/register"
              className="text-white font-bold hover:text-blue-400 transition-colors"
            >
              Create an account
            </a>
          </div>
        </div>

        {/* Brand Footer */}
        <p className="mt-10 text-center text-slate-500 text-xs tracking-wide">
          POWERED BY <span className="text-slate-300 font-bold">HOSPITAL TOKEN ENGINE</span> &copy; 2026
        </p>
      </div>
    </div>
  );
}
