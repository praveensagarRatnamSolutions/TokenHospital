'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, User, Lock, Eye, EyeOff, CheckCircle2, ImagePlus } from 'lucide-react';
import { authApi } from '@/services/authApi';
import { doctorApi } from '@/modules/admin/doctors/api/doctorApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { setCredentials } from '@/store/slices/authSlice';

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user, accessToken, refreshToken } = useAppSelector(
    (state: RootState) => state.auth,
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePic: '',
    currentPassword: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  type ProfileUpdatePayload = {
    name: string;
    email: string;
    profilePic?: string;
    currentPassword?: string;
    password?: string;
  };

  const getProfileImageUrl = (value: string) => {
    if (!value) return '';
    if (value.startsWith('http') || value.startsWith('blob:')) return value;
    const baseUrl =
      process.env.NEXT_PUBLIC_CLOUDFRONT_URL || 'https://d2rxrksscpnnty.cloudfront.net';
    return `${baseUrl}/${value}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFormData((prev) => ({ ...prev, profilePic: URL.createObjectURL(file) }));
  };

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<{ name: string; email: string; profilePic?: string }, any>({
    queryKey: ['authUser'],
    queryFn: authApi.getCurrentUser, 
  });

  useEffect(() => {
    if (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to load profile.');
    }
  }, [error]);

  useEffect(() => {
    if (!profile) return;
    setFormData((prev) => ({
      ...prev,
      name: profile.name || '',
      email: profile.email || '',
      profilePic: profile.profilePic || '',
    }));
  }, [profile]);

  const updateMutation = useMutation<unknown, any, ProfileUpdatePayload>({
    mutationFn: (payload: ProfileUpdatePayload) => authApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setSuccessMessage('Profile updated successfully.');
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['authUser'] });

      if (accessToken && refreshToken) {
        dispatch(
          setCredentials({
            user: updatedUser,
            accessToken,
            refreshToken,
          }),
        );
      }
    },
    onError: (error: any) => {
      setSuccessMessage(null);
      setErrorMessage(error?.response?.data?.message || 'Update failed.');
    },
  });

  useEffect(() => {
    if (successMessage) {
      const timeout = window.setTimeout(() => setSuccessMessage(null), 4000);
      return () => window.clearTimeout(timeout);
    }
  }, [successMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (formData.password && !formData.currentPassword) {
      setErrorMessage('Please enter your current password to update your password.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Name and email are required.');
      return;
    }

    let finalProfilePic = formData.profilePic;

    if (selectedFile) {
      try {
        setIsUploading(true);
        const result = await doctorApi.getUploadUrl(selectedFile.name, selectedFile.type);
        const { uploadUrl, key } = result.data;

        await fetch(uploadUrl, {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type,
          },
        });

        finalProfilePic = key;
      } catch (error) {
        console.error('Upload failed:', error);
        setErrorMessage('Failed to upload profile image.');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const payload: ProfileUpdatePayload = {
      name: formData.name,
      email: formData.email,
    };

    if (finalProfilePic) {
      payload.profilePic = finalProfilePic;
    }

    if (formData.password) {
      payload.password = formData.password;
      if (formData.currentPassword) {
        payload.currentPassword = formData.currentPassword;
      }
    }

    updateMutation.mutate(payload);
  };

  if (isLoading && !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-52 rounded-2xl bg-slate-200" />
            <div className="h-80 rounded-[2rem] bg-slate-200" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-24 rounded-3xl bg-slate-200" />
              <div className="h-24 rounded-3xl bg-slate-200" />
            </div>
            <div className="h-16 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-[2rem] bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-700 to-sky-600 p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] opacity-90">
                Admin Profile
              </p>
              <h1 className="text-4xl text-white tracking-tight">Account Details</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
              <User className="w-4 h-4" />
              Manage your account and security settings
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-bold">Profile Summary</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Keep your admin account information up to date and secure.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 p-6 flex flex-col items-center text-center bg-slate-50">
              <div className="relative w-28 h-28 rounded-3xl overflow-hidden bg-slate-200 shadow-inner mb-4">
                {formData.profilePic ? (
                  <img
                    src={getProfileImageUrl(formData.profilePic)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm hover:bg-slate-100 transition">
                <ImagePlus className="w-4 h-4 text-slate-500" />
                Upload avatar
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 mb-6">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-12 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    placeholder="Admin Name"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-12 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    placeholder="admin@hospital.com"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Security</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Update your password only when necessary.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                  <Lock className="w-3.5 h-3.5" />
                  Password
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-500"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-500"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                Password updates require your current password for safety.
              </div>
              <button
                type="submit"
                disabled={updateMutation.isPending || isUploading}
                className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploading
                  ? 'Uploading...'
                  : updateMutation.isPending
                    ? 'Saving...'
                    : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
