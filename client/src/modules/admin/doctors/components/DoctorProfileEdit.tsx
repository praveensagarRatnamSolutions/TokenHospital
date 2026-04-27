'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { doctorApi } from '../api/doctorApi';
import { Doctor } from '../types';
import { Laugh, Pencil } from 'lucide-react';

export const DoctorProfileEdit = ({ doctorId }: { doctorId?: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch Departments for the dropdown
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/api/department');
      return res.data.data;
    },
  });

  const departments = departmentsData || [];

  // Fetch Doctor Data if doctorId is provided
  const { data: doctorData, isLoading: isDoctorLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      const res = await doctorApi.getById(doctorId);
      return res.data;
    },
    enabled: !!doctorId,
  });

  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    email: '',
    password: '',
    profilePic: '',
    departmentId: '',
    experience: 0,
    consultationFee: 0,

    isAvailable: true,
    availability: [
      {
        day: 'Monday',
        sessions: [{ label: 'Morning', from: '09:00', to: '13:00', breaks: [] }],
      },
      {
        day: 'Tuesday',
        sessions: [{ label: 'Morning', from: '09:00', to: '13:00', breaks: [] }],
      },
      {
        day: 'Wednesday',
        sessions: [{ label: 'Morning', from: '09:00', to: '13:00', breaks: [] }],
      },
      {
        day: 'Thursday',
        sessions: [{ label: 'Morning', from: '09:00', to: '13:00', breaks: [] }],
      },
      {
        day: 'Friday',
        sessions: [{ label: 'Morning', from: '09:00', to: '13:00', breaks: [] }],
      },
    ],
  });

  useEffect(() => {
    if (doctorData) {
      setFormData({
        ...doctorData,
        email: doctorData.userId?.email || '',
        departmentId:
          typeof doctorData.departmentId === 'object'
            ? doctorData.departmentId._id
            : doctorData.departmentId,
      });
    }
  }, [doctorData]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (doctorId) {
        return doctorApi.update(doctorId, data);
      }
      return doctorApi.create(data);
    },
    onSuccess: () => {
      alert(doctorId ? 'Profile updated successfully' : 'Doctor created successfully');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      if (doctorId) queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      router.push('/admin/doctors');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as any;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: type === 'number' ? Number(value) : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'number'
            ? Number(value)
            : type === 'checkbox'
              ? (e.target as HTMLInputElement).checked
              : value,
      }));
    }
  };

  const toggleAvailability = (day: string) => {
    setFormData((prev) => {
      const exists = prev.availability?.find((a) => a.day === day);
      if (exists) {
        return { ...prev, availability: prev.availability?.filter((a) => a.day !== day) };
      } else {
        return {
          ...prev,
          availability: [
            ...(prev.availability || []),
            {
              day,
              sessions: [{ label: 'Morning', from: '09:00', to: '13:00', breaks: [] }],
            },
          ],
        };
      }
    });
  };

  const addSession = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability?.map((a) =>
        a.day === day
          ? {
              ...a,
              sessions: [
                ...a.sessions,
                { label: 'New Session', from: '14:00', to: '17:00', breaks: [] },
              ],
            }
          : a,
      ),
    }));
  };

  const removeSession = (day: string, sessionIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability?.map((a) =>
        a.day === day
          ? {
              ...a,
              sessions: a.sessions.filter((_, i) => i !== sessionIdx),
            }
          : a,
      ),
    }));
  };

  const updateSession = (day: string, sessionIdx: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability?.map((a) =>
        a.day === day
          ? {
              ...a,
              sessions: a.sessions.map((s, i) =>
                i === sessionIdx ? { ...s, [field]: value } : s,
              ),
            }
          : a,
      ),
    }));
  };

  const addSessionBreak = (day: string, sessionIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability?.map((a) =>
        a.day === day
          ? {
              ...a,
              sessions: a.sessions.map((s, i) =>
                i === sessionIdx
                  ? {
                      ...s,
                      breaks: [
                        ...s.breaks,
                        { from: '11:00', to: '11:15', label: 'Break' },
                      ],
                    }
                  : s,
              ),
            }
          : a,
      ),
    }));
  };

  const removeSessionBreak = (day: string, sessionIdx: number, breakIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability?.map((a) =>
        a.day === day
          ? {
              ...a,
              sessions: a.sessions.map((s, i) =>
                i === sessionIdx
                  ? {
                      ...s,
                      breaks: s.breaks.filter((_, bi) => bi !== breakIdx),
                    }
                  : s,
              ),
            }
          : a,
      ),
    }));
  };

  const updateSessionBreak = (
    day: string,
    sessionIdx: number,
    breakIdx: number,
    field: string,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability?.map((a) =>
        a.day === day
          ? {
              ...a,
              sessions: a.sessions.map((s, i) =>
                i === sessionIdx
                  ? {
                      ...s,
                      breaks: s.breaks.map((b, bi) =>
                        bi === breakIdx ? { ...b, [field]: value } : b,
                      ),
                    }
                  : s,
              ),
            }
          : a,
      ),
    }));
  };

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const getSelectedDepartmentName = () => {
    return (
      departments.find((d: any) => d._id === formData.departmentId)?.name ||
      'Select Department'
    );
  };

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    // Instant Preview
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, profilePic: previewUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalProfilePic = formData.profilePic;

    if (selectedFile) {
      try {
        setUploading(true);
        // 1. Get Presigned URL
        const { data } = await doctorApi.getUploadUrl(
          selectedFile.name,
          selectedFile.type,
        );
        const { uploadUrl, imageUrl, key } = data;

        // 2. Upload to S3
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
        alert('Failed to upload image before saving profile');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    mutation.mutate({ ...formData, profilePic: finalProfilePic });
  };

  if (isDoctorLoading) return <div className="p-8 text-center">Loading Profile...</div>;

  return (
    <main className="pt-6 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Form Section */}
        <div className="flex-1 space-y-8">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
              {doctorId ? 'Edit Doctor Profile' : 'Add New Doctor'}
            </h1>
            <p className="text-on-surface-variant mt-1">
              Configure clinical identity, availability, and consultation parameters.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Info */}
            <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold">Basic Info</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-surface-container-high overflow-hidden border-2 border-outline-variant/20 transition-all group-hover:border-primary">
                    {formData.profilePic ? (
                      <img
                        src={
                          formData.profilePic.startsWith('blob:')
                            ? formData.profilePic
                            : `https://d2rxrksscpnnty.cloudfront.net/${formData.profilePic}`
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <Laugh />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    id="profile-pic"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="profile-pic"
                    className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-sm text-white">
                      <Pencil size={16} />
                    </span>
                  </label>
                  {uploading && (
                    <div className="absolute inset-0 bg-surface-container-lowest/60 flex items-center justify-center rounded-2xl">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-bold text-on-surface">Profile Picture</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    A professional portrait helps build trust with patients. JPG or PNG,
                    max 2MB.
                  </p>
                </div>
              </div>

              {!doctorId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant block">
                      Email Address (for login)
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                      type="email"
                      placeholder="doctor@hospital.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant block">
                      Password
                    </label>
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                      type="password"
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>
                </div>
              )}

              {doctorId && (
                <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-on-surface-variant block">
                      Email Address
                    </label>
                    <input
                      value={formData.email}
                      className="w-full bg-white border border-outline-variant/40 rounded-lg px-4 py-2.5 opacity-50 cursor-not-allowed"
                      type="email"
                      disabled
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    type="text"
                    placeholder="Dr. Sarah Jenkins"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block">
                    Department
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept: any) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block">
                    Years of Experience
                  </label>
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block">
                    Consultation Fee (₹)
                  </label>
                  <input
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    type="text"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block">
                    Education
                  </label>
                  <input
                    name="education"
                    value={formData.education || ''}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                    type="text"
                    placeholder="MBBS, MD (Internal Medicine)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block">
                    Status
                  </label>
                  <div className="flex items-center gap-3 h-[46px]">
                    <span className="text-sm text-on-surface-variant">Inactive</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.isAvailable}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, isAvailable: e.target.checked }))
                        }
                      />
                      <div className="w-11 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <span
                      className={`text-sm font-semibold ${formData.isAvailable ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Weekly Availability & Sessions */}
            <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold">Weekly Availability</h2>
              </div>
              <div className="space-y-6">
                {daysOfWeek.map((day) => {
                  const daySlot = formData.availability?.find((a) => a.day === day);
                  return (
                    <div
                      key={day}
                      className="p-4 rounded-xl bg-surface-container-low/30 border border-outline-variant/10 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={!!daySlot}
                            onChange={() => toggleAvailability(day)}
                            className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary"
                          />
                          <span
                            className={`font-bold ${!daySlot ? 'text-on-surface-variant' : ''}`}
                          >
                            {day}
                          </span>
                        </div>
                        {daySlot && (
                          <button
                            type="button"
                            onClick={() => addSession(day)}
                            className="text-xs font-bold text-primary flex items-center gap-1 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">+</span>
                            Add Session
                          </button>
                        )}
                      </div>

                      {daySlot && (
                        <div className="space-y-4 pl-9">
                          {daySlot.sessions.map((session, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 space-y-4 relative group/session"
                            >
                              <button
                                type="button"
                                onClick={() => removeSession(day, sIdx)}
                                className="absolute top-2 right-2 text-error/40 hover:text-error opacity-0 group-hover/session:opacity-100 transition-opacity"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  close
                                </span>
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">
                                    Session Label
                                  </label>
                                  <input
                                    type="text"
                                    value={session.label}
                                    onChange={(e) =>
                                      updateSession(day, sIdx, 'label', e.target.value)
                                    }
                                    placeholder="e.g. Morning"
                                    className="w-full bg-surface-container-low/50 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">
                                    From
                                  </label>
                                  <input
                                    type="time"
                                    value={session.from}
                                    onChange={(e) =>
                                      updateSession(day, sIdx, 'from', e.target.value)
                                    }
                                    className="w-full bg-surface-container-low/50 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">
                                    To
                                  </label>
                                  <input
                                    type="time"
                                    value={session.to}
                                    onChange={(e) =>
                                      updateSession(day, sIdx, 'to', e.target.value)
                                    }
                                    className="w-full bg-surface-container-low/50 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">
                                    Session Capacity
                                  </label>
                                  <input
                                    type="number"
                                    value={session.maxTokens || ''}
                                    onChange={(e) =>
                                      updateSession(
                                        day,
                                        sIdx,
                                        'maxTokens',
                                        e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      )
                                    }
                                    placeholder="Tokens per session"
                                    className="w-full bg-surface-container-low/50 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-on-surface-variant uppercase">
                                    Avg. Consultation Time
                                  </label>
                                  <input
                                    type="number"
                                    value={session.avgTimePerPatient || ''}
                                    onChange={(e) =>
                                      updateSession(
                                        day,
                                        sIdx,
                                        'avgTimePerPatient',
                                        e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      )
                                    }
                                    placeholder="Minutes per patient"
                                    className="w-full bg-surface-container-low/50 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 outline-none"
                                  />
                                </div>
                              </div>

                              {/* Nested Breaks */}
                              <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">
                                    Session Breaks
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => addSessionBreak(day, sIdx)}
                                    className="text-[10px] font-bold text-primary hover:underline"
                                  >
                                    + Add Break
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {session.breaks.map((b, bIdx) => (
                                    <div
                                      key={bIdx}
                                      className="flex items-center gap-2 bg-surface-container-low/30 p-2 rounded-lg border border-dashed border-outline-variant/30"
                                    >
                                      <input
                                        type="text"
                                        value={b.label}
                                        onChange={(e) =>
                                          updateSessionBreak(
                                            day,
                                            sIdx,
                                            bIdx,
                                            'label',
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Label"
                                        className="flex-1 bg-transparent border-none text-[10px] font-medium outline-none"
                                      />
                                      <input
                                        type="time"
                                        value={b.from}
                                        onChange={(e) =>
                                          updateSessionBreak(
                                            day,
                                            sIdx,
                                            bIdx,
                                            'from',
                                            e.target.value,
                                          )
                                        }
                                        className="bg-transparent border-none text-[10px] w-16 outline-none"
                                      />
                                      <span className="text-[10px] text-on-surface-variant">
                                        to
                                      </span>
                                      <input
                                        type="time"
                                        value={b.to}
                                        onChange={(e) =>
                                          updateSessionBreak(
                                            day,
                                            sIdx,
                                            bIdx,
                                            'to',
                                            e.target.value,
                                          )
                                        }
                                        className="bg-transparent border-none text-[10px] w-16 outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeSessionBreak(day, sIdx, bIdx)
                                        }
                                        className="text-error/40 hover:text-error"
                                      >
                                        <span className="material-symbols-outlined text-[10px]">
                                          delete
                                        </span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-full border border-outline text-on-surface-variant font-semibold hover:bg-surface-container-low transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-8 py-2.5 rounded-full bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Preview Sidebar */}
        <aside className="w-full lg:w-[380px]">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-tighter text-on-surface-variant">
                Live Preview
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                REAL-TIME
              </div>
            </div>

            {/* Profile Card Preview */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-on-surface/5 border border-outline-variant/20 overflow-hidden">
              <div className="h-32 bg-primary relative">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                  }}
                ></div>
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
                    <img
                      alt="Doctor Preview"
                      className="w-full h-full object-cover rounded-xl"
                      src={
                        formData.profilePic
                          ? formData.profilePic.startsWith('blob:')
                            ? formData.profilePic
                            : `https://d2rxrksscpnnty.cloudfront.net/${formData.profilePic}`
                          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqjO5J-L91CXQzPyidLehGaZW-M6KbSiwAJh3RIKMRrTceF2ED0v5smcu4Nm52z9bRshWDv1VPnumCTOXD7LGKP_RHC4zWoCGUl6fnYPATav5gSVDxI0O4k4M4ELpnnxcxjHI4e-znZjHRgwfZ0y6d4vxKiLN3afbwab86Gkd-4GQm6TPkJLVVB_6WSp6s4HtAxAzg6k6H2B476D-tO8NuQZL5Uib31UOnuEUePNPjkLnXorBSAfx-6bxNam0G7gkuLdrWHkrQftY'
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="pt-14 pb-8 px-6 space-y-6">
                <div>
                  <h4 className="text-2xl font-extrabold text-on-surface leading-tight">
                    {formData.name || 'Dr. Sarah Jenkins'}
                  </h4>
                  <p className="text-xs font-bold text-primary mt-1">
                    {formData.education || 'MBBS, MD'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase rounded-md">
                      {getSelectedDepartmentName()}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      • {formData.experience || 0} Years Exp.
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Today
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {(() => {
                        const dayIdx = new Date().getDay();
                        const days = [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ];
                        const todayName = days[dayIdx];
                        const daySlot = formData.availability?.find(
                          (a) => a.day === todayName,
                        );
                        if (!daySlot || daySlot.sessions.length === 0) return 'Closed';
                        const first = daySlot.sessions[0];
                        return `${first.from} - ${first.to}${daySlot.sessions.length > 1 ? ' +' : ''}`;
                      })()}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Consultation
                    </p>
                    <p className="text-sm font-bold text-primary">
                      ₹{formData.consultationFee || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                      Capacity
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {(() => {
                        const dayIdx = new Date().getDay();
                        const days = [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ];
                        const todayName = days[dayIdx];
                        const daySlot = formData.availability?.find(
                          (a) => a.day === todayName,
                        );
                        if (!daySlot) return '0';
                        return daySlot.sessions.reduce(
                          (sum, s) => sum + (s.maxTokens || 0),
                          0,
                        );
                      })()}{' '}
                      Tokens
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 text-center">
                      Sessions
                    </p>
                    <p className="text-sm font-bold text-primary text-center">
                      {(() => {
                        const dayIdx = new Date().getDay();
                        const days = [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ];
                        const todayName = days[dayIdx];
                        return (
                          formData.availability?.find((a) => a.day === todayName)
                            ?.sessions.length || 0
                        );
                      })()}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">bookmark</span>
                    Book Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};
