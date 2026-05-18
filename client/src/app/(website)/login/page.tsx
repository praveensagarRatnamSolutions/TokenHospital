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
import { Eye, EyeOff, Loader, Hospital, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Section */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 px-16 py-14 text-white xl:px-24">
          {/* Glow Effects */}
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="mb-16 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white p-2 ">
                <Link href="/" className="text-lg sm:text-xl font-bold">
                  <img
                    src="/logo.png" // 👉 replace with your real logo
                    className="h-10 w-25"
                    alt="Ratnam Solutions"
                  />
                </Link>
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Hospital Token
                </h1>

                <p className="mt-1 text-sm text-blue-100">Smart Queue Management</p>
              </div>
            </div>

            {/* Heading */}
            <div className="max-w-xl space-y-6">
              <h2 className="text-5xl font-bold leading-tight xl:text-6xl text-white">
                Streamline Patient Flow Efficiently
              </h2>

              <p className="text-lg leading-8 text-blue-100">
                Manage appointments, token queues, doctor schedules, billing, and patient
                flow seamlessly using a modern hospital management platform.
              </p>
            </div>

            {/* Features */}
            <div className="mt-16 space-y-5">
              {[
                'Real-time Token Tracking',
                'QR & POS Payment Integration',
                'Multi-Branch Hospital Support',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg">
                    ✓
                  </div>

                  <span className="text-base text-blue-50">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-25 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-10 text-center lg:hidden">
              <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-2xl text-white shadow-xl">
                🏥
              </div>

              <h1 className="text-3xl font-bold text-slate-900">Hospital Token</h1>

              <p className="mt-2 text-slate-500">Smart Queue Management System</p>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-500">
                Login to manage appointments, queues and hospital operations.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@hospital.com"
                  className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 pr-12 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600"
                  />

                  <span className="text-slate-600">Remember me</span>
                </label>

                <a href="#" className="font-medium text-blue-600 hover:text-blue-700">
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader className="h-5 w-5 animate-spin" />}

                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate-400">Demo Access</span>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <p className="mb-4 text-sm font-bold text-blue-900">Demo Credentials</p>

              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex justify-between gap-3">
                  <span>Super Admin</span>
                  <span className="font-medium">superadmin@system.com</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span>Hospital Admin</span>
                  <span className="font-medium">admin@anupama.com</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span>Doctor</span>
                  <span className="font-medium">smith@gmail.com</span>
                </div>
              </div>

              <p className="mt-5 text-xs text-blue-700">
                Password: <strong>password123</strong>
              </p>
            </div>

            {/* Signup */}
            <div className="mt-8 text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <a
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
