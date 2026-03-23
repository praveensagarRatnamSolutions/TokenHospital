'use client';

import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { doctorApi } from '@/modules/admin/doctors';

export default function AdminDoctors() {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        const response = await doctorApi.getAll();
        return response.data.doctors || [];
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        return [
          {
            _id: '1',
            name: 'Dr. Sarah Smith',
            departmentId: { name: 'Cardiology' },
            isAvailable: true,
          },
          {
            _id: '2',
            name: 'Dr. James Wilson',
            departmentId: { name: 'Pediatrics' },
            isAvailable: false,
          },
        ];
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">Doctors</h1>
          <p className="text-slate-500">
            Manage hospital medical staff and availability.
          </p>
        </div>
        <Link href="/admin/doctors/add">
          <Button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors w-full sm:w-auto">
            <Plus className="w-5 h-5" />
            Add Doctor
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-950 border rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctor..."
            className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-950 border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-slate-500 font-bold border-b">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                  Loading doctors...
                </td>
              </tr>
            ) : (
              doctors?.map((doctor: any) => (
                <tr
                  key={doctor._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                        {doctor.profilePic ? (
                          <img 
                            src={`https://d2rxrksscpnnty.cloudfront.net/${doctor.profilePic}`} 
                            alt={doctor.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <span className="text-[10px] font-bold uppercase">{doctor.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <span className="font-semibold">{doctor.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {doctor.departmentId?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4">
                    {doctor.isAvailable ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">
                        <XCircle className="w-3.5 h-3.5" /> Offline
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/doctors/${doctor._id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors border"
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
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400 italic">Loading doctors...</div>
        ) : (
          doctors?.map((doctor: any) => (
            <div
              key={doctor._id}
              className="p-4 bg-white dark:bg-slate-950 border rounded-lg shadow-sm"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                  {doctor.profilePic ? (
                    <img 
                      src={`https://d2rxrksscpnnty.cloudfront.net/${doctor.profilePic}`} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="text-sm font-bold uppercase">{doctor.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-base">{doctor.name}</h3>
                      <p className="text-sm text-slate-500">
                        {doctor.departmentId?.name || 'Unassigned'}
                      </p>
                    </div>
                    {doctor.isAvailable ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                        <XCircle className="w-4 h-4" /> Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Link href={`/admin/doctors/${doctor._id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs text-rose-500 hover:text-rose-600"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
