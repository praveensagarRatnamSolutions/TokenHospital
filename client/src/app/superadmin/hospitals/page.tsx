'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Activity, Zap } from 'lucide-react';
import { HospitalsList } from '@/components/superadmin/HospitalsList';
import { HospitalForm } from '@/components/superadmin/HospitalForm';
import { Hospital, hospitalApi } from '@/services/hospitalApi';
import { Button } from '@/components/ui/button';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalApi.getAllHospitals();
      setHospitals(response.data || []);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeCount = hospitals.filter(h => h.isActive).length;
  const customPlanCount = hospitals.filter(h => h.subscription?.plan?.isCustom).length;

  const handleCreate = () => {
    setSelectedHospital(null);
    setShowForm(true);
  };

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedHospital(null);
  };

  const handleFormSuccess = () => {
    fetchHospitals();
  };

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 relative p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 mb-4">
             <Building2 className="size-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Node Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Global <span className="text-primary italic font-serif">Hospitals</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Provision, manage, and monitor all active hospital nodes across the platform network.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Button 
            onClick={handleCreate}
            className="w-full sm:w-auto rounded-2xl h-12 px-6 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Provision Hospital
          </Button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 transition-transform group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Total Network Nodes</p>
           <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white relative z-10">{hospitals.length}</h3>
        </div>
        <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 transition-transform group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors" />
           <div className="flex items-center justify-between mb-2 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Nodes</p>
              <Activity className="w-4 h-4 text-emerald-500" />
           </div>
           <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white relative z-10">{activeCount}</h3>
        </div>
        <div className="p-6 rounded-[2rem] bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 shadow-sm glass hover:-translate-y-1 transition-transform group relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-colors" />
           <div className="flex items-center justify-between mb-2 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Plans</p>
              <Zap className="w-4 h-4 text-amber-500" />
           </div>
           <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white relative z-10">{customPlanCount}</h3>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm glass overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between bg-slate-50/50 dark:bg-slate-950/50">
           <div>
             <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Active Registry</h3>
             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Select a node to view full details</p>
           </div>
           
           <div className="relative w-full sm:w-72">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="text"
               placeholder="Search nodes..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
             />
           </div>
        </div>

        <div className="p-4 md:p-6 bg-slate-50/30 dark:bg-slate-950/30">
          <HospitalsList
            hospitals={filteredHospitals}
            onEdit={handleEdit}
            onRefresh={fetchHospitals}
            isLoading={loading}
          />
        </div>
      </div>

      {showForm && (
        <HospitalForm
          hospital={selectedHospital}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
