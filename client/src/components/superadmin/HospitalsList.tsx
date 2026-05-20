'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Power, AlertCircle, Loader, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import { Hospital, hospitalApi } from '@/services/hospitalApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HospitalsListProps {
  hospitals: any[]; // Using any to accept the newly attached subscription object
  onEdit: (hospital: Hospital) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

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

export function HospitalsList({
  hospitals,
  onEdit,
  onRefresh,
  isLoading = false,
}: HospitalsListProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleStatus = async (hospitalId: string, isActive: boolean, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row click
    try {
      setActionLoading(hospitalId);
      setError(null);
      if (isActive) {
        await hospitalApi.deactivateHospital(hospitalId);
      } else {
        await hospitalApi.activateHospital(hospitalId);
      }
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update hospital status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (hospitalId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row click
    if (!confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(hospitalId);
      setError(null);
      await hospitalApi.deleteHospital(hospitalId);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete hospital');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (hospital: Hospital, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(hospital);
  };

  const navigateToDetails = (id: string) => {
    router.push(`/superadmin/hospitals/${id}`);
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm font-bold text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto p-2">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Facility ID & Name</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription Plan</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Status</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">Loading network nodes...</p>
                </td>
              </tr>
            ) : hospitals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <p className="text-sm font-bold text-slate-500">No hospitals found in the network.</p>
                </td>
              </tr>
            ) : (
              hospitals.map((hospital) => (
                <tr
                  key={hospital._id}
                  onClick={() => navigateToDetails(hospital._id)}
                  className="group bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer rounded-2xl overflow-hidden"
                >
                  <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-200 dark:border-slate-800 group-hover:border-primary/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {hospital.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mt-1">
                        NODE: {hospital._id.substring(0, 8)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5 border-y border-slate-200 dark:border-slate-800 group-hover:border-primary/30 transition-colors">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{hospital.email}</span>
                       <span className="text-xs font-medium text-slate-500">{formatPhone(hospital.phone)}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5 border-y border-slate-200 dark:border-slate-800 group-hover:border-primary/30 transition-colors">
                     {hospital.subscription ? (
                        <div className="flex flex-col items-start gap-1">
                           <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                              hospital.subscription.plan.isCustom 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                              : 'bg-primary/10 text-primary border-primary/30'
                           }`}>
                              {hospital.subscription.plan.isCustom && <Zap className="w-3 h-3" />}
                              {hospital.subscription.plan.name}
                           </Badge>
                           <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                             <span className={`w-1.5 h-1.5 rounded-full ${hospital.subscription.status === 'ACTIVE' ? 'bg-emerald-500' : hospital.subscription.status === 'TRIAL' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                             {hospital.subscription.status}
                           </span>
                        </div>
                     ) : (
                        <span className="text-xs font-bold text-slate-400 italic">No Active Plan</span>
                     )}
                  </td>

                  <td className="px-6 py-5 border-y border-slate-200 dark:border-slate-800 group-hover:border-primary/30 transition-colors">
                    <Badge className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                      hospital.isActive 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20'
                    }`}>
                      {hospital.isActive ? 'Network Active' : 'Suspended'}
                    </Badge>
                  </td>

                  <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-200 dark:border-slate-800 group-hover:border-primary/30 transition-colors text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost" size="icon"
                        onClick={(e) => handleEditClick(hospital, e)}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary hover:bg-primary/10"
                        title="Edit Hospital"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={(e) => handleToggleStatus(hospital._id, hospital.isActive, e)}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10"
                        title={hospital.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {actionLoading === hospital._id ? <Loader className="w-4 h-4 animate-spin text-primary" /> : <Power className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={(e) => handleDelete(hospital._id, e)}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
                        title="Delete Hospital"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          <div className="py-12 text-center">
             <Loader className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-bold">No hospitals found in network.</div>
        ) : (
          hospitals.map((hospital) => (
            <div
              key={hospital._id}
              onClick={() => navigateToDetails(hospital._id)}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{hospital.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-1">
                    ID: {hospital._id.substring(0, 8)}
                  </p>
                </div>
                <Badge className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg ${
                  hospital.isActive 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                }`}>
                  {hospital.isActive ? 'Active' : 'Suspended'}
                </Badge>
              </div>

              {hospital.subscription && (
                 <div className="mb-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Plan</p>
                    <div className="flex items-center justify-between">
                       <span className={`text-xs font-bold ${hospital.subscription.plan.isCustom ? 'text-amber-500' : 'text-primary'}`}>
                          {hospital.subscription.plan.name}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500">
                          {hospital.subscription.status}
                       </span>
                    </div>
                 </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline" size="sm"
                  onClick={(e) => handleEditClick(hospital, e)}
                  className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                >
                  <Edit2 className="w-3 h-3 mr-2" /> Edit
                </Button>
                <Button
                  variant="outline" size="sm"
                  onClick={(e) => navigateToDetails(hospital._id)}
                  className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 border-transparent shadow-md shadow-primary/20"
                >
                  <ArrowUpRight className="w-3 h-3 mr-2" /> View
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
