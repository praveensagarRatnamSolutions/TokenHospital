'use client';

import { BarChart3, TrendingUp, Users, Building2 } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';

export default function SuperAdminReports() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-slate-500">System-wide analytics and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Tokens Issued" 
          value="12,847" 
          icon={TrendingUp} 
          trend={{ value: 23, isUp: true }}
          description="Since last month"
        />
        <StatsCard 
          title="Active Users" 
          value="1,234" 
          icon={Users} 
          description="Across all hospitals"
        />
        <StatsCard 
          title="Hospital Coverage" 
          value="98%" 
          icon={Building2} 
          trend={{ value: 5, isUp: true }}
          description="System utilization"
        />
        <StatsCard 
          title="Reports Generated" 
          value="456" 
          icon={BarChart3} 
          description="This month"
        />
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm min-h-[400px] flex items-center justify-center text-slate-400 font-medium italic">
        [ System Analytics Dashboard Coming Soon ]
      </div>
    </div>
  );
}
