'use client';

import React from 'react';
import { Edit2, Trash2, Monitor, MapPin, Power, ExternalLink, User, Users } from 'lucide-react';
import { Kiosk } from '../../../kiosk/types';

interface KioskTableProps {
  kiosks: Kiosk[];
  onEdit: (kiosk: Kiosk) => void;
  onDelete: (kiosk: Kiosk) => void;
  onToggleActive: (kiosk: Kiosk) => void;
  isDarkMode?: boolean;
}

export const KioskTable: React.FC<KioskTableProps> = ({
  kiosks,
  onEdit,
  onDelete,
  onToggleActive,
  isDarkMode = false,
}) => {
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const borderColor = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const bgCard = isDarkMode ? 'bg-slate-900/50' : 'bg-white';

  return (
    <div className={`overflow-x-auto rounded-xl border ${borderColor} ${bgCard} shadow-sm`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`border-b ${borderColor} bg-slate-50/50 dark:bg-slate-800/50`}>
            <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${mutedText}`}>Device</th>
            <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${mutedText}`}>Configuration</th>
            <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${mutedText}`}>Ads</th>
            <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${mutedText}`}>Status</th>
            <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${mutedText} text-right text-right-important`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {kiosks.map((kiosk) => (
            <tr key={kiosk._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <Monitor size={20} />
                  </div>
                  <div>
                    <div className={`font-bold ${textColor}`}>{kiosk.name}</div>
                    <div className={`text-xs font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded inline-block mt-1 ${mutedText}`}>
                      {kiosk.code}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1.5">
                  <div className={`text-sm flex items-center gap-1.5 ${mutedText}`}>
                    <MapPin size={14} className="text-blue-500" />
                    <span className="capitalize">{kiosk.locationType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex gap-2">
                    {kiosk.departmentIds?.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">
                        <Users size={10} /> {kiosk.departmentIds.length} Depts
                      </div>
                    )}
                    {kiosk.doctorIds?.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded-full font-bold">
                        <User size={10} /> {kiosk.doctorIds.length} Doctors
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`text-sm font-bold ${textColor}`}>
                  {kiosk.ads?.length || 0} Ads
                </div>
                <div className={`text-xs ${mutedText}`}>Playlist active</div>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onToggleActive(kiosk)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    kiosk.isActive
                      ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                      : 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
                  }`}
                >
                  <Power size={12} />
                  {kiosk.isActive ? 'Active' : 'Offline'}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(kiosk)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                    title="Edit Kiosk"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => window.open(`/kiosk/${kiosk.code}`, '_blank')}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    title="Preview Kiosk"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(kiosk)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    title="Delete Kiosk"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {kiosks.length === 0 && (
        <div className="py-12 text-center">
          <Monitor size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
          <div className={`text-lg font-bold ${textColor}`}>No Kiosks Found</div>
          <p className={mutedText}>Add your first kiosk to start displaying content.</p>
        </div>
      )}
    </div>
  );
};
