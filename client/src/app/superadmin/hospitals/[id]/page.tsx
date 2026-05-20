'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck,
  CreditCard,
  Zap,
  Activity,
  Calendar,
  AlertCircle,
  Loader
} from 'lucide-react';
import { hospitalApi } from '@/services/hospitalApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HospitalForm } from '@/components/superadmin/HospitalForm';

function formatPhone(phone: any) {
  if (!phone) return 'N/A';
  if (typeof phone === 'string') return phone;
  if (typeof phone === 'object') {
    const code = phone.countryCode || '';
    const num = phone.nationalNumber || '';
    if (code && num) return `${code} ${num}`;
    return phone.full || 'N/A';
  }
  return 'N/A';
}

export default function HospitalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hospitalApi.getHospitalById(id);
      setHospital(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch hospital details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHospitalDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h2 className="text-red-800 dark:text-red-200 font-bold">{error || 'Hospital not found'}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/superadmin/hospitals')}
          className="w-10 h-10 p-0 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{hospital.name}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-mono">NODE ID: {hospital._id}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => setShowEditForm(true)} className="rounded-xl font-bold bg-primary hover:bg-primary/90">
            Edit Node
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: DETAILS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Info Card */}
          <div className="p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
             
             <div className="flex items-center gap-2 mb-6">
               <Building2 className="w-5 h-5 text-primary" />
               <h2 className="text-xl font-black text-slate-800 dark:text-white">Facility Details</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Official Email</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{hospital.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone Contact</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPhone(hospital.phone)}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Address</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state} {hospital.address?.zipCode}
                  </p>
                </div>
             </div>
          </div>

          {/* Compliance Card */}
          <div className="p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass relative overflow-hidden">
             <div className="flex items-center gap-2 mb-6">
               <ShieldCheck className="w-5 h-5 text-emerald-500" />
               <h2 className="text-xl font-black text-slate-800 dark:text-white">Compliance & Registration</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Gov. Registration Number</p>
                  <p className="text-base font-mono font-bold text-slate-900 dark:text-white">{hospital.registrationNumber || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Medical License Number</p>
                  <p className="text-base font-mono font-bold text-slate-900 dark:text-white">{hospital.licenseNumber || 'N/A'}</p>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COL: SUBSCRIPTION & STATUS */}
        <div className="space-y-8">
           
           {/* Plan Status Card */}
           <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-slate-800 group">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700 pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-8 relative z-10">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black">Plan & Billing</h2>
              </div>

              {hospital.subscription ? (
                <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Active Plan</p>
                    <div className="flex items-center gap-3">
                       <h3 className={`text-3xl font-black tracking-tighter ${hospital.subscription.plan.isCustom ? 'text-amber-400' : 'text-white'}`}>
                         {hospital.subscription.plan.name}
                       </h3>
                       {hospital.subscription.plan.isCustom && <Zap className="w-5 h-5 text-amber-400" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                     <div>
                       <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
                       <Badge className={`mt-1 text-[9px] font-black tracking-widest px-2 py-0.5 ${
                         hospital.subscription.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                         hospital.subscription.status === 'TRIAL' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'
                       }`}>
                         {hospital.subscription.status}
                       </Badge>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-slate-400">Billing Cycle</p>
                       <p className="font-bold mt-1 text-sm">{hospital.subscription.billingCycle}</p>
                     </div>
                  </div>

                  {/* Limits summary if populated */}
                  {hospital.subscription.plan.limits && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Max Doctors</p>
                        <p className="font-black text-lg">{hospital.subscription.plan.limits.maxDoctors}</p>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Max Departments</p>
                        <p className="font-black text-lg">{hospital.subscription.plan.limits.maxDepartments}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Current Period Ends</p>
                    <p className="text-sm font-bold mt-1 text-slate-300">
                      {new Date(hospital.subscription.currentPeriodEnd).toLocaleDateString('en-US', { dateStyle: 'full' })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-slate-700 rounded-2xl relative z-10">
                  <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="font-bold text-slate-400">No active subscription found.</p>
                </div>
              )}
           </div>

        </div>
      </div>

      {showEditForm && (
        <HospitalForm 
          hospital={hospital} 
          onClose={() => setShowEditForm(false)} 
          onSuccess={fetchHospitalDetails} 
        />
      )}

    </div>
  );
}
