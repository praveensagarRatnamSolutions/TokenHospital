'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Check, X, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanManagementPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/subscription/plans');
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan? This cannot be undone.')) return;
    try {
      await api.delete(`/api/subscription/plans/${id}`);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Plan Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure subscription tiers, pricing, and feature limits for all hospitals.
          </p>
        </div>
        <Link href="./plans/create">
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
            <Plus className="w-4 h-4 mr-2" /> Create Plan
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <Card key={plan._id} className="overflow-hidden border-slate-200 dark:border-slate-800 relative group">
            {plan.recommended && (
              <div className="absolute top-3 right-3">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
            )}
            <CardHeader className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={plan.isActive ? 'default' : 'secondary'} className="text-[10px]">
                  {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/plans/${plan._id}/edit`}>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(plan._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600">₹{plan.price.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-3 gap-3 text-center mb-5">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                  <div className="text-lg font-bold">{plan.limits.maxDepartments >= 99999 ? '∞' : plan.limits.maxDepartments}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Depts</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                  <div className="text-lg font-bold">{plan.limits.maxDoctors >= 99999 ? '∞' : plan.limits.maxDoctors}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Doctors</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5">
                  <div className="text-lg font-bold">{plan.limits.maxKiosks === -1 ? '∞' : plan.limits.maxKiosks}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Kiosks</div>
                </div>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f: any, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    {f.available ? (
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span className={f.available ? '' : 'text-muted-foreground line-through'}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}