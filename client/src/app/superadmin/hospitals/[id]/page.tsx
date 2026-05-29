'use client';

import { 
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft, 
  ArrowUpRight,
  BriefcaseMedical,
  Building2, 
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader,
  Mail, 
  MapPin, 
  MonitorSmartphone,
  Phone, 
  ShieldCheck,
  Stethoscope,
  UserCircle,
  Users,
  Wallet,
  Zap} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hospitalApi } from '@/services/hospitalApi';

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
          <Button onClick={() => router.push(`/superadmin/hospitals/create?id=${id}`)} className="rounded-xl font-bold bg-primary hover:bg-primary/90">
            Edit Node
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: DETAILS & USAGE */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Admin Card */}
            {hospital.primaryAdmin && (
              <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="w-4 h-4 text-blue-500" />
                  <h3 className="font-black text-slate-800 dark:text-white">Primary Admin</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Name</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{hospital.primaryAdmin.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Email</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{hospital.primaryAdmin.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Phone</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{hospital.primaryAdmin.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Card */}
            <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass">
               <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 <h3 className="font-black text-slate-800 dark:text-white">Compliance</h3>
               </div>
               <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Gov. Registration No.</p>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">{hospital.registrationNumber || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Medical License No.</p>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">{hospital.licenseNumber || 'N/A'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Platform Usage & Activity Metrics */}
          <div className="p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass">
            <div className="flex items-center gap-2 mb-6">
               <Activity className="w-5 h-5 text-indigo-500" />
               <h2 className="text-xl font-black text-slate-800 dark:text-white">Network Activity & Usage</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <Stethoscope className="w-5 h-5 text-primary mx-auto mb-2" />
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{hospital.usageStats?.doctors || 0}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Doctors</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <BriefcaseMedical className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{hospital.usageStats?.departments || 0}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Depts</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <MonitorSmartphone className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{hospital.usageStats?.kiosks || 0}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kiosks</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <Users className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{hospital.usageStats?.patients || 0}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patients</p>
              </div>
            </div>

            {hospital.subscription?.plan?.limits && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Subscription Limits Utilization</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Doctors Quota</span>
                    <span>{hospital.usageStats?.doctors || 0} / {hospital.subscription.plan.limits.maxDoctors}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all rounded-full"
                      style={{ width: `${Math.min(100, ((hospital.usageStats?.doctors || 0) / (hospital.subscription.plan.limits.maxDoctors || 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>Departments Quota</span>
                    <span>{hospital.usageStats?.departments || 0} / {hospital.subscription.plan.limits.maxDepartments}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all rounded-full"
                      style={{ width: `${Math.min(100, ((hospital.usageStats?.departments || 0) / (hospital.subscription.plan.limits.maxDepartments || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COL: SUBSCRIPTION & WALLET */}
        <div className="space-y-8">
           
           {/* Plan Status Card */}
           <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-slate-800 group">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700 pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-8 relative z-10">
                <CheckCircle2 className="w-5 h-5 text-primary" />
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

                  <div className="flex items-center justify-between border-y border-slate-800 py-4">
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

                  <div className="pt-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Current Period Ends</p>
                    <p className="text-lg font-black mt-1 text-slate-100">
                      {new Date(hospital.subscription.currentPeriodEnd).toLocaleDateString('en-US', { dateStyle: 'medium' })}
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

           {/* Wallet Balances Card */}
           <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass">
             <div className="flex items-center gap-2 mb-6">
               <Wallet className="w-4 h-4 text-emerald-500" />
               <h3 className="font-black text-slate-800 dark:text-white">Wallet Balances</h3>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">SMS Credits</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{hospital.wallet?.smsCredits || 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500">Email Credits</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{hospital.wallet?.emailCredits || 0}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* FULL WIDTH: LEDGERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Wallet Ledger */}
        <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Wallet Ledger</h2>
            </div>
          </div>
          
          <div className="space-y-3">
            {!hospital.walletLedger || hospital.walletLedger.length === 0 ? (
              <div className="text-center py-8 text-sm font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                No wallet transactions found.
              </div>
            ) : (
              hospital.walletLedger.map((tx: any) => (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                      {tx.type === 'CREDIT' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.description || tx.referenceType}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 mt-1">{new Date(tx.createdAt).toLocaleDateString()} &bull; {tx.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.type === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount}
                    </p>
                    <p className="text-[10px] font-black uppercase text-slate-400 mt-1">Bal: {tx.balanceAfter}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subscription Transactions */}
        <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Subscription Payments</h2>
            </div>
          </div>
          
          <div className="space-y-3">
            {!hospital.subscriptionHistory || hospital.subscriptionHistory.length === 0 ? (
              <div className="text-center py-8 text-sm font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                No payment history found.
              </div>
            ) : (
              hospital.subscriptionHistory.map((tx: any) => (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {tx.planId || 'Payment'}
                      </p>
                      <p className="text-[10px] font-black uppercase text-slate-400 mt-1">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      ₹{tx.amount}
                    </p>
                    <Badge className={`mt-1 text-[9px] font-black tracking-widest px-2 py-0.5 ${
                         tx.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                         tx.status === 'PENDING' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                       }`}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
