'use client';

import { Check, Edit2, ExternalLink, MapPin, Monitor, Power, Trash2, User, Users, X } from 'lucide-react';
import React from 'react';

import { useAppSelector } from '@/store/hooks';

import { Kiosk } from '../../../kiosk/types';

interface KioskTableProps {
  kiosks: Kiosk[];
  onEdit: (kiosk: Kiosk) => void;
  onDelete: (kiosk: Kiosk) => void;
  onToggleActive: (kiosk: Kiosk) => void;
  onReview?: (kiosk: Kiosk, status: 'accepted' | 'rejected', reason?: string) => void;
}

export const KioskTable: React.FC<KioskTableProps> = ({
  kiosks,
  onEdit,
  onDelete,
  onToggleActive,
  onReview,
}) => {
  const user = useAppSelector((state) => state.auth.user);

  if (kiosks.length === 0) {
    return (
      <div className="py-32 text-center rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Monitor className="mx-auto w-14 h-14 text-slate-200 dark:text-slate-700 mb-4" />
        <div className="text-lg font-black text-slate-900 dark:text-white">No Kiosks Found</div>
        <p className="text-slate-400 dark:text-slate-500 mt-1 text-sm font-medium">
          Add your first kiosk to start displaying content.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Device</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Configuration</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ads</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {kiosks.map((kiosk) => {
              const canEditOrDelete = user?.role === 'ADMIN' || kiosk.createdBy === user?._id;

              return (
              <tr
                key={kiosk._id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
              >
                {/* Device */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 dark:text-white">{kiosk.name}</div>
                      <div className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md inline-block mt-1">
                        {kiosk.code}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Configuration */}
                <td className="px-8 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-primary/50" />
                      <span className="capitalize">{kiosk.locationType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {kiosk.departmentIds?.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black border border-indigo-500/20">
                          <Users className="w-3 h-3" /> {kiosk.departmentIds.length} Depts
                        </div>
                      )}
                      {kiosk.doctorIds?.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-black border border-purple-500/20">
                          <User className="w-3 h-3" /> {kiosk.doctorIds.length} Doctors
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Ads */}
                <td className="px-8 py-5">
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    {kiosk.ads?.length || 0} Ads
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Playlist Active
                  </div>
                </td>

                {/* Status */}
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onToggleActive(kiosk)}
                      disabled={!canEditOrDelete || kiosk.approvalStatus !== 'accepted'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border w-fit ${
                        kiosk.isActive
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50'
                          : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-800'
                      } ${(!canEditOrDelete || kiosk.approvalStatus !== 'accepted') ? 'opacity-40 cursor-not-allowed' : ''}`}
                      title={
                        kiosk.approvalStatus !== 'accepted'
                          ? 'Cannot toggle active state on unapproved kiosks'
                          : kiosk.isActive ? 'Deactivate' : 'Activate'
                      }
                    >
                      <Power className="w-3 h-3" />
                      {kiosk.isActive ? 'Active' : 'Offline'}
                    </button>
                    
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border w-fit
                      ${kiosk.approvalStatus === 'accepted' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50'
                        : kiosk.approvalStatus === 'rejected'
                        ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50'
                        : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50'
                      }`}>
                      {kiosk.approvalStatus || 'pending'}
                    </span>
                    {kiosk.approvalStatus === 'rejected' && kiosk.rejectionReason && (
                      <span className="text-[10px] font-medium text-red-500 dark:text-red-400 max-w-[200px] break-words whitespace-normal leading-relaxed" title={kiosk.rejectionReason}>
                        Reason: {kiosk.rejectionReason}
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-8 py-5">
                  <div className="flex items-center justify-end gap-1">
                    {user?.role === 'ADMIN' && kiosk.approvalStatus === 'pending' && onReview && (
                      <>
                        <button
                          onClick={() => onReview(kiosk, 'accepted')}
                          className="p-2.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all"
                          title="Approve Kiosk"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReview(kiosk, 'rejected')}
                          className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                          title="Reject Kiosk"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {canEditOrDelete && (
                      <button
                        onClick={() => onEdit(kiosk)}
                        className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-all"
                        title="Edit Kiosk"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => window.open(`/kiosk/${kiosk.code}`, '_blank')}
                      className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                      title="Preview Kiosk"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    {canEditOrDelete && (
                      <button
                        onClick={() => onDelete(kiosk)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                        title="Delete Kiosk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
