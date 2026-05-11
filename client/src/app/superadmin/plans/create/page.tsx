'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Check, X, ChevronLeft, Save, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanFormPage() {
    const router = useRouter();
    const params = useParams();
    const isEdit = params.id !== 'create' && params.id !== undefined;

    const [loading, setLoading] = useState(isEdit);
    const [formData, setFormData] = useState({
        name: '',
        planId: '',
        description: '',
        price: 0,
        yearlyPrice: 0,
        displayOrder: 0,
        recommended: false,
        limits: { maxDepartments: 1, maxDoctors: 2, maxKiosks: 0, allowCustomBranding: false },
        features: [{ text: '', available: true }],
        trialDays: 25,
        isActive: true,
    });

    useEffect(() => {
        if (isEdit) {
            api.get(`/api/subscription/plans/${params.id}`)
                .then(res => {
                    setFormData(res.data.data);
                    setLoading(false);
                })
                .catch(() => {
                    toast.error("Failed to load plan settings");
                    setLoading(false);
                });
        }
    }, [isEdit, params.id]);

    const handleSave = async () => {
        if (!formData.name || !formData.planId) {
            toast.error("Please fill in the Plan Name and ID");
            return;
        }

        try {
            const payload = {
                ...formData,
                features: formData.features.filter(f => f.text.trim() !== ''),
            };

            if (isEdit) {
                await api.put(`/api/subscription/plans/${params.id}`, payload);
                toast.success('Changes saved successfully');
            } else {
                await api.post('/api/subscription/plans', payload);
                toast.success('New plan published');
            }
            router.push('/admin/plans');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    const addFeature = () => setFormData({ ...formData, features: [...formData.features, { text: '', available: true }] });

    const updateFeature = (index: number, field: string, value: any) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setFormData({ ...formData, features: newFeatures });
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Zap className="w-8 h-8 animate-pulse text-blue-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
            {/* Sticky Action Header */}
            <div className="sticky top-0 z-20 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">{isEdit ? 'Edit Plan' : 'Create New Tier'}</h1>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{formData.name || 'Untitled Plan'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => router.back()} className="rounded-xl px-6">Discard</Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-lg shadow-blue-200 dark:shadow-none transition-all">
                            <Save className="w-4 h-4 mr-2" />
                            {isEdit ? 'Update Settings' : 'Publish Plan'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">

                {/* Left Side: Main Configuration */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Identity Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Sparkles className="w-5 h-5" />
                            <h2 className="font-semibold tracking-tight">Plan Identity</h2>
                        </div>
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Plan Display Name</label>
                                        <Input
                                            className="bg-slate-50/50 dark:bg-slate-900 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="e.g. Enterprise Elite"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Internal Plan ID</label>
                                        <Input
                                            disabled={isEdit}
                                            className="bg-slate-50/50 dark:bg-slate-900 border-slate-200 rounded-xl font-mono text-xs"
                                            placeholder="ENT_001"
                                            value={formData.planId}
                                            onChange={e => setFormData({ ...formData, planId: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Marketing Description</label>
                                    <Input
                                        className="bg-slate-50/50 dark:bg-slate-900 border-slate-200 rounded-xl"
                                        placeholder="Briefly explain who this plan is for..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Features Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Zap className="w-5 h-5" />
                                <h2 className="font-semibold tracking-tight">Feature Set</h2>
                            </div>
                            <Button variant="outline" size="sm" onClick={addFeature} className="rounded-lg border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50">
                                <Plus className="w-4 h-4 mr-2" /> Add Feature
                            </Button>
                        </div>

                        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                            <div className="bg-slate-50/80 dark:bg-slate-900/50 p-4 border-b">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Feature Status & Description</p>
                            </div>
                            <CardContent className="p-4 space-y-3">
                                {formData.features.map((feature, idx) => (
                                    <div key={idx} className="group flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all ${feature.available
                                                    ? "bg-green-100 text-green-600 dark:bg-green-500/20"
                                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                                }`}
                                            onClick={() => updateFeature(idx, 'available', !feature.available)}
                                        >
                                            {feature.available ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                        </div>
                                        <Input
                                            className="flex-1 bg-transparent border-slate-200 focus:border-indigo-500 rounded-xl transition-all"
                                            value={feature.text}
                                            onChange={e => updateFeature(idx, 'text', e.target.value)}
                                            placeholder="Feature name..."
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Right Side: Sidebar Controls */}
                <div className="space-y-8">

                    {/* Pricing Sidebar */}
                    <section className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 ml-1">Commercials</h2>
                        <Card className="border-none shadow-md shadow-blue-100/50 ring-1 ring-blue-100 dark:ring-slate-800 dark:shadow-none">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                                        <label className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Monthly Rate (INR)</label>
                                        <div className="flex items-center mt-1">
                                            <span className="text-2xl font-light text-slate-400 mr-2">₹</span>
                                            <input
                                                type="number"
                                                className="bg-transparent text-3xl font-bold w-full outline-none text-slate-800 dark:text-white"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500">Yearly Rate (Discounted)</label>
                                        <Input type="number" className="rounded-xl" value={formData.yearlyPrice} onChange={e => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500">Trial Days</label>
                                        <Input type="number" className="rounded-xl font-mono" value={formData.trialDays} onChange={e => setFormData({ ...formData, trialDays: Number(e.target.value) })} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Limits Sidebar */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 ml-1">
                            <ShieldCheck className="w-4 h-4" />
                            <h2 className="text-sm font-bold uppercase tracking-widest">Guardrails</h2>
                        </div>
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                            <CardContent className="p-6 space-y-5">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Departments</label>
                                        <Input type="number" className="w-20 rounded-lg text-right h-8" value={formData.limits.maxDepartments} onChange={e => setFormData({ ...formData, limits: { ...formData.limits, maxDepartments: Number(e.target.value) } })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Doctors</label>
                                        <Input type="number" className="w-20 rounded-lg text-right h-8" value={formData.limits.maxDoctors} onChange={e => setFormData({ ...formData, limits: { ...formData.limits, maxDoctors: Number(e.target.value) } })} />
                                    </div>
                                </div>
                                <hr className="border-slate-100 dark:border-slate-800" />
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between group">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold">Recommended</p>
                                            <p className="text-[10px] text-muted-foreground">Badge visible to users</p>
                                        </div>
                                        <Switch
                                            checked={formData.recommended}
                                            onCheckedChange={v => setFormData({ ...formData, recommended: v })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between group">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold">Live Status</p>
                                            <p className="text-[10px] text-muted-foreground">Active for new signups</p>
                                        </div>
                                        <Switch
                                            checked={formData.isActive}
                                            onCheckedChange={v => setFormData({ ...formData, isActive: v })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </div>
    );
}