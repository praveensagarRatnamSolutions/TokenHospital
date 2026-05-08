'use client';

import React, { useState } from 'react';
import { Plus, Monitor, AlertCircle, Loader, CheckCircle2, LayoutGrid, Info } from 'lucide-react';
import { useKiosks, useCreateKiosk, useUpdateKiosk, useDeleteKiosk } from '../../../kiosk/hooks';
import { KioskTable } from './KioskTable';
import { KioskModal } from './KioskModal';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { Kiosk } from '../../../kiosk/types';

export const KioskManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Kiosk | null>(null);

  const { user } = useAppSelector((state: RootState) => state.auth);
  const hospitalId = user?.hospitalId || '';

  const { kiosks, loading, error, refetch } = useKiosks();
  const { createKiosk } = useCreateKiosk();
  const { updateKiosk } = useUpdateKiosk();
  const { deleteKiosk } = useDeleteKiosk();

  const handleCreate = () => { setSelectedKiosk(null); setIsModalOpen(true); };
  const handleEdit = (kiosk: Kiosk) => { setSelectedKiosk(kiosk); setIsModalOpen(true); };

  const handleModalSubmit = async (data: any) => {
    const result = selectedKiosk
      ? await updateKiosk(selectedKiosk._id, data)
      : await createKiosk(data);
    if (result) {
      setSuccessMessage(selectedKiosk ? 'Kiosk updated successfully' : 'Kiosk created successfully');
      setIsModalOpen(false);
      refetch();
    }
  };

  const handleToggleActive = async (kiosk: Kiosk) => {
    const result = await updateKiosk(kiosk._id, { isActive: !kiosk.isActive });
    if (result) {
      setSuccessMessage(`Kiosk ${!kiosk.isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    }
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;
    const success = await deleteKiosk(showDeleteConfirm._id);
    if (success) {
      setSuccessMessage('Kiosk deleted successfully');
      setShowDeleteConfirm(null);
      refetch();
    }
  };

  return (
    <div className="space-y-8 min-h-screen p-8 bg-slate-50/50 dark:bg-slate-950/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Display Terminals
            </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Kiosk <span className="text-primary italic font-serif">Network</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            Manage and monitor your hospital's digital infrastructure.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="h-14 px-8 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Register Kiosk
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {kiosks.filter((k: Kiosk) => k.isActive).length}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Online Devices</div>
          </div>
        </div>

        <div className="p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{kiosks.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Registered</div>
          </div>
        </div>

        <div className="p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
              Need help? Check the{' '}
              <span className="text-primary font-black cursor-pointer hover:underline">setup guide</span>
              {' '}for connecting devices.
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-5 py-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="ml-auto text-xs font-bold opacity-50 hover:opacity-100 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader className="animate-spin text-primary" size={48} />
          <p className="font-bold text-slate-400">Synchronizing device network...</p>
        </div>
      ) : (
        <KioskTable
          kiosks={kiosks}
          onEdit={handleEdit}
          onDelete={setShowDeleteConfirm}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Remove Device?</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to remove{' '}
              <span className="font-bold text-red-500">{showDeleteConfirm.name}</span>?
              This will disconnect the physical terminal from the system.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={handleConfirmDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20"
              >
                Yes, Delete Terminal
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-3.5 rounded-2xl font-bold transition-all text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <KioskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedKiosk}
        hospitalId={hospitalId}
      />
    </div>
  );
};
