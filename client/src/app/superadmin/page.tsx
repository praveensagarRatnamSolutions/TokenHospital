'use client';

import { useEffect, useState } from 'react';
import { 
  Building2,
  Users, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { hospitalApi, Hospital } from '@/services/hospitalApi';

export default function SuperAdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const response = await hospitalApi.getAllHospitals();
        setHospitals(response.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch hospitals');
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const activeHospitals = hospitals.filter(h => h.isActive).length;
  const inactiveHospitals = hospitals.filter(h => !h.isActive).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-500">System Overview - Manage all hospitals</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Hospitals" 
          value={hospitals.length} 
          icon={Building2} 
          description={`${activeHospitals} active, ${inactiveHospitals} inactive`}
        />
        <StatsCard 
          title="Active Hospitals" 
          value={activeHospitals} 
          icon={Users} 
          trend={{ value: activeHospitals > 0 ? Math.round((activeHospitals / hospitals.length) * 100) : 0, isUp: true }}
          description="Operational hospitals"
        />
        <StatsCard 
          title="Inactive Hospitals" 
          value={inactiveHospitals} 
          icon={AlertCircle} 
          description="Suspended hospitals"
        />
        <StatsCard 
          title="System Health" 
          value={hospitals.length > 0 ? '100%' : '0%'} 
          icon={TrendingUp} 
          description="All systems operational"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
          <h3 className="font-bold mb-4">Recent Hospitals</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              Loading hospitals...
            </div>
          ) : hospitals.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              No hospitals created yet
            </div>
          ) : (
            <div className="space-y-3">
              {hospitals.slice(0, 5).map((hospital) => (
                <div key={hospital._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center font-bold text-sm">
                      {hospital.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{hospital.name}</p>
                      <p className="text-xs text-slate-500">{hospital.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    hospital.isActive 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {hospital.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm">
          <h3 className="font-bold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Average Active</p>
              <p className="text-2xl font-bold">{hospitals.length > 0 ? Math.round((activeHospitals / hospitals.length) * 100) : 0}%</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Total Coverage</p>
              <p className="text-2xl font-bold">{hospitals.length}</p>
              <p className="text-xs text-slate-500 mt-1">hospitals</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">System Status</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Healthy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
