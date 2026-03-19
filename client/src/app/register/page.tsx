'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, setError as setAuthError, setLoading as setAuthLoading } from '@/store/slices/authSlice';
import { authApi, RegisterRequest } from '@/services/authApi';
import { Eye, EyeOff, Loader } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    hospitalId: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      dispatch(setAuthLoading(true));

      // Validate hospitalId for non-superadmin roles
      if (formData.role !== 'superadmin' && !formData.hospitalId) {
        setError('Hospital ID is required for admin and doctor roles');
        setLoading(false);
        dispatch(setAuthLoading(false));
        return;
      }

      console.log('Sending register request with:', formData);
      const userData = await authApi.register(formData);
      console.log('Register response:', userData);
      
      // authApi already returns the data object directly
      if (!userData || !userData._id) {
        throw new Error('Invalid response from server');
      }
      
      // Store credentials in Redux
      dispatch(setCredentials({
        user: {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          hospitalId: userData.hospitalId,
        },
        accessToken: userData.token,
        refreshToken: userData.token,
      }));

      // Redirect based on role
      const role = userData.role;
      if (role === 'superadmin') {
        router.push('/superadmin');
      } else if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'doctor') {
        router.push('/doctor');
      } else {
        router.push('/kiosk');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join the Hospital Token System</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
              >
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {/* Hospital ID Field (conditional) */}
            {formData.role !== 'superadmin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital ID *
                </label>
                <input
                  type="text"
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  placeholder="Hospital ID"
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-red-50 text-gray-900 placeholder-gray-600"
                />
                <p className="text-xs text-red-600 mt-1">Required for {formData.role} users</p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12 text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="mt-1 rounded border-gray-300" required />
              <span className="text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms and Conditions
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in here
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>&copy; 2026 Hospital Token System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
