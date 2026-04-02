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
        }
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
        enabled: !!doctorId
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
            { day: 'Monday', from: '09:00', to: '17:00' },
            { day: 'Tuesday', from: '09:00', to: '17:00' },
            { day: 'Wednesday', from: '09:00', to: '17:00' },
            { day: 'Thursday', from: '09:00', to: '17:00' },
            { day: 'Friday', from: '09:00', to: '17:00' },
        ],
        tokenConfig: {
            maxPerDay: 40,
            avgTimePerPatient: 15,
        },
        breaks: [
            { from: '13:00', to: '14:00', label: 'Lunch Break' }
        ],
    });

    useEffect(() => {
        if (doctorData) {
            setFormData({
                ...doctorData,
                departmentId: typeof doctorData.departmentId === 'object' ? doctorData.departmentId._id : doctorData.departmentId
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
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: type === 'number' ? Number(value) : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? Number(value) : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value)
            }));
        }
    };

    const toggleAvailability = (day: string) => {
        setFormData(prev => {
            const exists = prev.availability?.find(a => a.day === day);
            if (exists) {
                return { ...prev, availability: prev.availability?.filter(a => a.day !== day) };
            } else {
                return { ...prev, availability: [...(prev.availability || []), { day, from: '09:00', to: '17:00' }] };
            }
        });
    };

    const updateAvailabilityTime = (day: string, field: 'from' | 'to', value: string) => {
        setFormData(prev => ({
            ...prev,
            availability: prev.availability?.map(a => a.day === day ? { ...a, [field]: value } : a)
        }));
    };

    const addBreak = () => {
        setFormData(prev => ({
            ...prev,
            breaks: [...(prev.breaks || []), { from: '13:00', to: '14:00', label: 'Break' }]
        }));
    };

    const removeBreak = (index: number) => {
        setFormData(prev => ({
            ...prev,
            breaks: prev.breaks?.filter((_, i) => i !== index)
        }));
    };

    const updateBreak = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            breaks: prev.breaks?.map((b, i) => i === index ? { ...b, [field]: value } : b)
        }));
    };

    const suggestedCapacity = useMemo(() => {
        // Simple calculation: 8 hours = 480 mins / avgTime
        // In real app, we should calculate based on actual availability hours
        const avg = formData.tokenConfig?.avgTimePerPatient || 15;
        return Math.floor(480 / avg);
    }, [formData.tokenConfig?.avgTimePerPatient]);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const getSelectedDepartmentName = () => {
        return departments.find((d: any) => d._id === formData.departmentId)?.name || 'Select Department';
    };

    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        // Instant Preview
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, profilePic: previewUrl }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalProfilePic = formData.profilePic;

        if (selectedFile) {
            try {
                setUploading(true);
                // 1. Get Presigned URL
                const { data } = await doctorApi.getUploadUrl(selectedFile.name, selectedFile.type);
                const { uploadUrl, imageUrl, key } = data.data;

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
                        <p className="text-on-surface-variant mt-1">Configure clinical identity, availability, and consultation parameters.</p>
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
                                            <img src={formData.profilePic.startsWith('blob:') ? formData.profilePic : `https://d2rxrksscpnnty.cloudfront.net/${formData.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
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
                                        <span className="material-symbols-outlined text-sm"><Pencil size={16} /></span>
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
                                        A professional portrait helps build trust with patients. JPG or PNG, max 2MB.
                                    </p>
                                </div>
                            </div>

                            {!doctorId && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-on-surface-variant block">Email Address (for login)</label>
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
                                        <label className="text-sm font-medium text-on-surface-variant block">Password</label>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-on-surface-variant block">Full Name</label>
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
                                    <label className="text-sm font-medium text-on-surface-variant block">Department</label>
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept: any) => (
                                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-on-surface-variant block">Years of Experience</label>
                                    <input
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-on-surface-variant block">Consultation Fee (₹)</label>
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
                                    <label className="text-sm font-medium text-on-surface-variant block">Status</label>
                                    <div className="flex items-center gap-3 h-[46px]">
                                        <span className="text-sm text-on-surface-variant">Inactive</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.isAvailable}
                                                onChange={(e) => setFormData(p => ({ ...p, isAvailable: e.target.checked }))}
                                            />
                                            <div className="w-11 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                        <span className={`text-sm font-semibold ${formData.isAvailable ? 'text-primary' : 'text-on-surface-variant'}`}>
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Weekly Availability */}
                        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20">
                            <div className="flex items-center gap-3 mb-6">

                                <h2 className="text-lg font-bold">Weekly Availability</h2>
                            </div>
                            <div className="space-y-4">
                                {daysOfWeek.map(day => {
                                    const slot = formData.availability?.find(a => a.day === day);
                                    return (
                                        <div key={day} className="flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg bg-surface-container-low/50 gap-4">
                                            <div className="flex items-center gap-4 w-32">
                                                <input
                                                    type="checkbox"
                                                    checked={!!slot}
                                                    onChange={() => toggleAvailability(day)}
                                                    className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary"
                                                />
                                                <span className={`font-medium ${!slot ? 'text-on-surface-variant' : ''}`}>{day}</span>
                                            </div>
                                            <div className={`flex items-center gap-2 ${!slot ? 'opacity-40 pointer-events-none' : ''}`}>
                                                <input
                                                    type="time"
                                                    value={slot?.from || '09:00'}
                                                    onChange={(e) => updateAvailabilityTime(day, 'from', e.target.value)}
                                                    className="bg-white border-outline-variant/40 rounded px-2 py-1 text-sm outline-none focus:border-primary"
                                                />
                                                <span className="text-on-surface-variant">to</span>
                                                <input
                                                    type="time"
                                                    value={slot?.to || '17:00'}
                                                    onChange={(e) => updateAvailabilityTime(day, 'to', e.target.value)}
                                                    className="bg-white border-outline-variant/40 rounded px-2 py-1 text-sm outline-none focus:border-primary"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Section 3: Token Config */}
                        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20">
                            <div className="flex items-center gap-3 mb-6">

                                <h2 className="text-lg font-bold">Token Configuration</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-on-surface-variant block">Max Tokens per Day</label>
                                        <input
                                            name="tokenConfig.maxPerDay"
                                            value={formData.tokenConfig?.maxPerDay}
                                            onChange={handleInputChange}
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                            type="text"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-on-surface-variant block">Avg. Time per Patient (min)</label>
                                        <input
                                            name="tokenConfig.avgTimePerPatient"
                                            value={formData.tokenConfig?.avgTimePerPatient}
                                            onChange={handleInputChange}
                                            className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none"
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div className="bg-primary-container/10 p-5 rounded-xl flex flex-col justify-center items-center text-center border border-primary/10">
                                    <span className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Suggested Capacity</span>
                                    <div className="text-4xl font-black text-primary">{suggestedCapacity}</div>
                                    <p className="text-xs text-on-surface-variant mt-2 max-w-[180px]">Based on 8 working hours and {formData.tokenConfig?.avgTimePerPatient}min average time.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Break Times */}
                        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/20">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">

                                    <h2 className="text-lg font-bold">Break Times</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addBreak}
                                    className="text-sm font-semibold text-primary flex items-center gap-1 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Add Slot
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.breaks?.map((breakSlot, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={breakSlot.from}
                                                    onChange={(e) => updateBreak(idx, 'from', e.target.value)}
                                                    className="bg-white border-outline-variant/40 rounded px-3 py-1.5 text-sm outline-none focus:border-primary"
                                                />
                                                <span className="text-on-surface-variant">to</span>
                                                <input
                                                    type="time"
                                                    value={breakSlot.to}
                                                    onChange={(e) => updateBreak(idx, 'to', e.target.value)}
                                                    className="bg-white border-outline-variant/40 rounded px-3 py-1.5 text-sm outline-none focus:border-primary"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={breakSlot.label}
                                                onChange={(e) => updateBreak(idx, 'label', e.target.value)}
                                                placeholder="Break Label"
                                                className="text-xs font-medium text-on-surface-variant italic px-3 py-1 bg-surface-variant/40 rounded-full border-none outline-none focus:ring-1 focus:ring-primary/30"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeBreak(idx)}
                                            className="text-error/60 hover:text-error transition-colors"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
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
                            <h3 className="text-xs font-black uppercase tracking-tighter text-on-surface-variant">Live Preview</h3>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                REAL-TIME
                            </div>
                        </div>

                        {/* Profile Card Preview */}
                        <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-on-surface/5 border border-outline-variant/20 overflow-hidden">
                            <div className="h-32 bg-primary relative">
                                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                                <div className="absolute -bottom-10 left-6">
                                    <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg">
                                        <img
                                            alt="Doctor Preview"
                                            className="w-full h-full object-cover rounded-xl"
                                            src={formData.profilePic ? (formData.profilePic.startsWith('blob:') ? formData.profilePic : `https://d2rxrksscpnnty.cloudfront.net/${formData.profilePic}`) : "https://lh3.googleusercontent.com/aida-public/AB6AXuBqjO5J-L91CXQzPyidLehGaZW-M6KbSiwAJh3RIKMRrTceF2ED0v5smcu4Nm52z9bRshWDv1VPnumCTOXD7LGKP_RHC4zWoCGUl6fnYPATav5gSVDxI0O4k4M4ELpnnxcxjHI4e-znZjHRgwfZ0y6d4vxKiLN3afbwab86Gkd-4GQm6TPkJLVVB_6WSp6s4HtAxAzg6k6H2B476D-tO8NuQZL5Uib31UOnuEUePNPjkLnXorBSAfx-6bxNam0G7gkuLdrWHkrQftY"}
                                        />

                                    </div>
                                </div>
                            </div>
                            <div className="pt-14 pb-8 px-6 space-y-6">
                                <div>
                                    <h4 className="text-2xl font-extrabold text-on-surface leading-tight">{formData.name || 'Dr. Sarah Jenkins'}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase rounded-md">
                                            {getSelectedDepartmentName()}
                                        </span>
                                        <span className="text-xs text-on-surface-variant font-medium">• {formData.experience || 0} Years Exp.</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Today</p>
                                        <p className="text-sm font-bold text-primary">
                                            {formData.availability?.find(a => a.day === daysOfWeek[new Date().getDay() - 1])?.from || 'Closed'} - {formData.availability?.find(a => a.day === daysOfWeek[new Date().getDay() - 1])?.to || ''}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Consultation</p>
                                        <p className="text-sm font-bold text-primary">₹{formData.consultationFee || 0}</p>
                                    </div>
                                    <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Capacity</p>
                                        <p className="text-sm font-bold text-primary">{formData.tokenConfig?.maxPerDay || 0} Tokens</p>
                                    </div>
                                    <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 text-center">Avg. Time</p>
                                        <p className="text-sm font-bold text-primary text-center">{formData.tokenConfig?.avgTimePerPatient || 0}m</p>
                                    </div>
                                </div>
                                <div className="space-y-3">

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-on-surface-variant">Avg. Consultation Time</span>
                                        <span className="font-bold">{formData.tokenConfig?.avgTimePerPatient || 0} mins</span>
                                    </div>
                                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[65%]" style={{ width: `${Math.min(100, (formData.tokenConfig?.avgTimePerPatient || 0) * 4)}%` }}></div>
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

                        {/* Quick Tip Card */}
                        <div className="bg-tertiary-fixed p-5 rounded-2xl flex gap-4">
                            <span className="material-symbols-outlined text-on-tertiary-fixed-variant">lightbulb</span>
                            <div>
                                <p className="text-sm font-bold text-on-tertiary-fixed">Optimization Tip</p>
                                <p className="text-xs text-on-tertiary-fixed-variant mt-1 leading-relaxed">Increasing your average time per patient will automatically adjust the suggested tokens to prevent scheduling overruns.</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
};
