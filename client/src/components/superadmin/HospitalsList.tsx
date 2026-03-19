'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, Power, AlertCircle, Loader } from 'lucide-react';
import { Hospital, hospitalApi } from '@/services/hospitalApi';

interface HospitalsListProps {
  hospitals: Hospital[];
  onEdit: (hospital: Hospital) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function HospitalsList({ hospitals, onEdit, onRefresh, isLoading = false }: HospitalsListProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleStatus = async (hospitalId: string, isActive: boolean) => {
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

  const handleDelete = async (hospitalId: string) => {
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

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50 dark:bg-slate-900">
              <th className="px-6 py-3 text-left text-sm font-semibold">Hospital Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">City</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  <Loader className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
            ) : hospitals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No hospitals found
                </td>
              </tr>
            ) : (
              hospitals.map((hospital) => (
                <tr key={hospital._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{hospital.name}</p>
                      <p className="text-xs text-slate-500">{hospital._id.substring(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{hospital.email}</td>
                  <td className="px-6 py-4 text-sm">{hospital.phone}</td>
                  <td className="px-6 py-4 text-sm">{hospital.address.city}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      hospital.isActive 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {hospital.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(hospital)}
                        disabled={actionLoading === hospital._id}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Edit hospital"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(hospital._id, hospital.isActive)}
                        disabled={actionLoading === hospital._id}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                          hospital.isActive 
                            ? 'hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400' 
                            : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                        }`}
                        title={hospital.isActive ? 'Deactivate hospital' : 'Activate hospital'}
                      >
                        {actionLoading === hospital._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(hospital._id)}
                        disabled={actionLoading === hospital._id}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete hospital"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
