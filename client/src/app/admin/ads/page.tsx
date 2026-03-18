'use client';

import { Plus, Search, Image as ImageIcon, Calendar, Trash2, Edit2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export default function AdminAds() {
  const { data: ads, isLoading } = useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/ads');
        return response.data.data;
      } catch {
        return [
          { _id: '1', title: 'Health Checkup Campaign', imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop', status: 'active', schedule: 'Oct 2026' },
          { _id: '2', title: 'New Cardiology Wing', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop', status: 'scheduled', schedule: 'Nov 2026' },
        ];
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Advertisements</h1>
          <p className="text-slate-500">Manage Kiosk screen ads and health campaigns.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" />
          Upload Ad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-20 text-slate-400 italic">Loading advertisements...</div>
        ) : ads?.map((ad: any) => (
          <div key={ad._id} className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm group">
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              <img 
                src={ad.imageUrl} 
                alt={ad.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${ad.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {ad.status}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{ad.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {ad.schedule}
                </span>
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Image
                </span>
              </div>
              <div className="mt-4 flex gap-2 border-t pt-4">
                <button className="flex-1 flex items-center justify-center gap-1 text-xs font-bold p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 text-xs font-bold p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
