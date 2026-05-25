'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/authApi';
import { doctorApi } from '@/modules/admin/doctors/api/doctorApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { setCredentials } from '@/store/slices/authSlice';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, ImagePlus } from 'lucide-react';

export default function DoctorProfilePage() {
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
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: authApi.getCurrentUser,
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
        profilePic: profile.profilePic || '',
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (isError && queryError) {
      setErrorMessage((queryError as any)?.response?.data?.message || 'Unable to load profile');
    }
  }, [isError, queryError]);

  const updateMutation = useMutation<any, any, ProfileUpdatePayload>({
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
      setErrorMessage('Please enter your current password to update the password.');
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
        <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 shadow-xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-52 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-96 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-16 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          <div className="rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-8 text-white ">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] opacity-90">
                    Profile
                  </p>
                  <h1 className="text-4xl text-white tracking-tight">Doctor Profile</h1>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-700/20">
                  <User className="w-4 h-4" />
                  Manage your name, email, profile photo and password
                </div>
              </div>
            </div>

            <div className="p-8 ">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-6">
                    <h2 className="text-xl font-bold dark:text-white">Profile Details</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Update your public name, email address, and avatar.
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-800/50">
                  <div className="relative w-28 h-28 rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-inner mb-4">
                    {formData.profilePic ? (
                      <img
                        src={getProfileImageUrl(formData.profilePic)}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white dark:bg-slate-700 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition border border-transparent dark:border-slate-600">
                    <ImagePlus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
                <div className="rounded-3xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400 mb-6">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 p-4 text-sm text-emerald-700 dark:text-emerald-400 mb-6 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-12 py-4 text-sm text-slate-900 dark:text-white outline-none transition focus:border-sky-400 dark:focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30 placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="Dr. Asha Patel"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-12 py-4 text-sm text-slate-900 dark:text-white outline-none transition focus:border-sky-400 dark:focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30 placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="doctor@hospital.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold dark:text-white">Security</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Change your password securely when needed.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300 shadow-sm dark:border dark:border-slate-600">
                      <Lock className="w-3.5 h-3.5" />
                      Password
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-4 text-sm text-slate-900 dark:text-white outline-none transition focus:border-sky-400 dark:focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30 placeholder-slate-400 dark:placeholder-slate-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-4 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
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
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-4 text-sm text-slate-900 dark:text-white outline-none transition focus:border-sky-400 dark:focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/30 placeholder-slate-400 dark:placeholder-slate-500"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-4 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
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
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Password changes require your current password for security.
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

        <aside className="xl:col-span-4 space-y-6">
          <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-6 shadow-sm">
            <div className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-300 font-semibold mb-4">
              <div className="rounded-2xl bg-sky-100 dark:bg-sky-900/40 p-2 text-sky-600 dark:text-sky-400">
                <User className="w-5 h-5" />
              </div>
              Quick Profile Tips
            </div>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                Use a clear name and email so patients can recognize your account quickly.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                Add a profile photo URL to personalize your doctor dashboard.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                Choose a strong password and only change it when needed.
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                Security Summary
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Keep your account secure
              </h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <p className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Your session stays active while using the dashboard.
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Changing the password will require your current password.
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                All updates sync immediately to your doctor account.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
