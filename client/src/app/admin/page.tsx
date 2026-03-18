import { 
  Users, 
  Ticket, 
  Clock, 
  TrendingUp 
} from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Tokens" 
          value="1,284" 
          icon={Ticket} 
          trend={{ value: 12, isUp: true }}
          description="Since last month"
        />
        <StatsCard 
          title="Active Doctors" 
          value="24" 
          icon={Users} 
          description="Currently online"
        />
        <StatsCard 
          title="Avg. Wait Time" 
          value="18m" 
          icon={Clock} 
          trend={{ value: 5, isUp: false }}
          description="Since yesterday"
        />
        <StatsCard 
          title="Completion Rate" 
          value="94%" 
          icon={TrendingUp} 
          trend={{ value: 2, isUp: true }}
          description="Last 24 hours"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm min-h-[400px] flex items-center justify-center text-slate-400 font-medium italic">
          [ Tokens Activity Chart Placeholder ]
        </div>
        <div className="p-6 bg-white dark:bg-slate-950 border rounded-xl shadow-sm min-h-[400px]">
          <h3 className="font-bold mb-4">Recent Tokens</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xs">
                    {String.fromCharCode(64 + i)}-{100 + i}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Patient {i}</p>
                    <p className="text-xs text-slate-500">Department {i}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                  Waiting
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
