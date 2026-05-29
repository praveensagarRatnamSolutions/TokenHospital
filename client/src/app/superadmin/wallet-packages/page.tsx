'use client';

import {
  Edit,
  Mail,
  MessageSquare,
  Plus,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect,useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { walletApi } from '@/services/walletApi';

export default function WalletPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await walletApi.getPackages();
      setPackages(res);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch wallet packages');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Zap className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  const smsPackages = packages.filter((p) => p.service === 'SMS');
  const emailPackages = packages.filter((p) => p.service === 'EMAIL');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
            Wallet Top-up Packages
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1">
            Manage add-on credit bundles for SMS and Email services
          </p>
        </div>
        <Button
          onClick={() => router.push('/superadmin/wallet-packages/create')}
          className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-12 font-bold shadow-xl shadow-primary/20 hover:shadow-2xl transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Package
        </Button>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        {/* SMS Packages Section */}
        <div className="space-y-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              SMS Bundles
            </h2>
          </div>

          {smsPackages.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-bold">No SMS packages configured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smsPackages.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  pkg={pkg}
                  onEdit={() =>
                    router.push(`/superadmin/wallet-packages/create?id=${pkg._id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Email Packages Section */}
        <div className="space-y-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              Email Bundles
            </h2>
          </div>

          {emailPackages.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-bold">
                No Email packages configured yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emailPackages.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  pkg={pkg}
                  onEdit={() =>
                    router.push(`/superadmin/wallet-packages/create?id=${pkg._id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PackageCard({ pkg, onEdit }: { pkg: any; onEdit: () => void }) {
  const isSms = pkg.service === 'SMS';

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col justify-between">
      {/* Background Decor */}
      <div
        className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 ${isSms ? 'bg-blue-500' : 'bg-purple-500'}`}
      />

      <div className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <Badge
            variant={pkg.isActive ? 'default' : 'secondary'}
            className={`rounded-lg font-black tracking-widest text-[9px] uppercase ${pkg.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}
          >
            {pkg.isActive ? 'Live' : 'Draft'}
          </Badge>
          <h3 className="text-xl font-black mt-3 text-slate-800 dark:text-white leading-tight">
            {pkg.name}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="flex items-end gap-2">
          <p className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white">
            {pkg.credits.toLocaleString()}
          </p>
          <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">
            {isSms ? 'SMS' : 'Emails'}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <p className="text-sm font-bold text-slate-500">Price</p>
          <p className="text-xl font-black text-primary">₹{pkg.price.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
