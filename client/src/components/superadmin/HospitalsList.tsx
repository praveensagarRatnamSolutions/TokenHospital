'use client';

import { useState } from 'react';
import { Trash2, Edit2, Power, AlertCircle, Loader } from 'lucide-react';
import { Hospital, hospitalApi } from '@/services/hospitalApi';
import { Button } from '@/components/ui/button';

interface HospitalsListProps {
  hospitals: Hospital[];
  onEdit: (hospital: Hospital) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

function formatPhone(phone: any) {
  if (!phone) return 'N/A';
  if (typeof phone === 'string') {
    if (phone.startsWith('91') && phone.length === 12) {
      return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
    }
    return phone;
  }
  if (typeof phone === 'object') {
    const code = phone.countryCode || '';
    const num = phone.nationalNumber || '';
    if (code && num) {
      return `${code} ${num.slice(0, 5)} ${num.slice(5)}`;
    }
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
    if (
      !confirm(
        'Are you sure you want to delete this hospital? This action cannot be undone.',
      )
    ) {
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

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50 dark:bg-slate-900">
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Hospital Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-widest">City</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                <tr
                  key={hospital._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {hospital.name}
                      </span>
                      <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                        ID: {hospital._id.substring(0, 8)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {hospital.email}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {formatPhone(hospital.phone)}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {hospital.address?.city || 'N/A'}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hospital.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${hospital.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                      ></span>
                      {hospital.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(hospital)}
                        disabled={actionLoading === hospital._id}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                        title="Edit Hospital"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleToggleStatus(hospital._id, hospital.isActive)
                        }
                        disabled={actionLoading === hospital._id}
                        className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                          hospital.isActive
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                        title={hospital.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {actionLoading === hospital._id ? (
                          <Loader className="w-4 h-4 animate-spin text-blue-500" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(hospital._id)}
                        disabled={actionLoading === hospital._id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
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
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No hospitals found</div>
        ) : (
          hospitals.map((hospital) => (
            <div
              key={hospital._id}
              className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{hospital.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">
                    ID: {hospital._id.substring(0, 8)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${
                    hospital.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${hospital.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  ></span>
                  {hospital.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-1 mb-3 text-xs text-slate-600 dark:text-slate-400">
                <p className="flex justify-between">
                  <span className="font-bold uppercase tracking-tighter text-slate-400">Email:</span> 
                  <span className="font-medium">{hospital.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold uppercase tracking-tighter text-slate-400">Phone:</span> 
                  <span className="font-medium">{formatPhone(hospital.phone)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold uppercase tracking-tighter text-slate-400">City:</span>{' '}
                  <span className="font-medium">{hospital.address?.city || 'N/A'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(hospital)}
                  disabled={actionLoading === hospital._id}
                  className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  <Edit2 className="w-3 h-3 mr-2" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(hospital._id, hospital.isActive)}
                  disabled={actionLoading === hospital._id}
                  className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  {actionLoading === hospital._id ? (
                    <>
                      <Loader className="w-3 h-3 mr-2 animate-spin" />
                      Loading
                    </>
                  ) : (
                    <>
                      <Power className="w-3 h-3 mr-2" />
                      {hospital.isActive ? 'Disable' : 'Enable'}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(hospital._id)}
                  disabled={actionLoading === hospital._id}
                  className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default HospitalsList;
