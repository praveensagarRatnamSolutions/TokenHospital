'use client';

import React, { useState } from 'react';
import { Plus, Monitor, AlertCircle, Loader, CheckCircle2, ChevronRight, LayoutGrid, Info } from 'lucide-react';
import { useKiosks, useCreateKiosk, useUpdateKiosk, useDeleteKiosk } from '../../../kiosk/hooks';
import { KioskTable } from './KioskTable';
import { KioskModal } from './KioskModal';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { Kiosk } from '../../../kiosk/types';

interface KioskManagementProps {
  isDarkMode?: boolean;
}

export const KioskManagement: React.FC<KioskManagementProps> = ({ isDarkMode = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Kiosk | null>(null);

  const { user } = useAppSelector((state: RootState) => state.auth);
  const hospitalId = user?.hospitalId || '';

  const { kiosks, loading, error, refetch } = useKiosks();
  const { createKiosk, loading: createLoading } = useCreateKiosk();
  const { updateKiosk, loading: updateLoading } = useUpdateKiosk();
  const { deleteKiosk, loading: deleteLoading } = useDeleteKiosk();

  const handleCreate = () => {
    setSelectedKiosk(null);
    setIsModalOpen(true);
  };

  const handleEdit = (kiosk: Kiosk) => {
    setSelectedKiosk(kiosk);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
    if (selectedKiosk) {
      const result = await updateKiosk(selectedKiosk._id, data);
      if (result) {
        setSuccessMessage('Kiosk updated successfully');
        setIsModalOpen(false);
        refetch();
      }
    } else {
      const result = await createKiosk(data);
      if (result) {
        setSuccessMessage('Kiosk created successfully');
        setIsModalOpen(false);
        refetch();
      }
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

  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = isDarkMode ? 'bg-slate-900/50' : 'bg-white';
  const borderColor = isDarkMode ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`space-y-6 min-h-screen p-1`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
            <Monitor size={16} /> Display Terminals
          </div>
          <h1 className={`text-4xl font-black tracking-tight ${textColor}`}>Kiosk Network</h1>
          <p className={mutedText}>Manage and monitor your hospital's digital infrastructure</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-600/20 flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} /> Register Kiosk
        </button>
      </div>

      {/* Stats/Quick Info (Optional Premium Feel) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${bgCard} p-6 rounded-2xl border ${borderColor} shadow-sm flex items-center gap-4`}>
              <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
                  <CheckCircle2 size={24} />
              </div>
              <div>
                  <div className={`text-2xl font-black ${textColor}`}>{kiosks.filter((k: Kiosk) => k.isActive).length}</div>
                  <div className={`text-xs font-bold uppercase ${mutedText}`}>Online Devices</div>
              </div>
          </div>
          <div className={`${bgCard} p-6 rounded-2xl border ${borderColor} shadow-sm flex items-center gap-4`}>
              <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
                  <LayoutGrid size={24} />
              </div>
              <div>
                  <div className={`text-2xl font-black ${textColor}`}>{kiosks.length}</div>
                  <div className={`text-xs font-bold uppercase ${mutedText}`}>Total Registered</div>
              </div>
          </div>
          <div className={`${bgCard} p-6 rounded-2xl border ${borderColor} shadow-sm flex items-center gap-4`}>
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Info size={24} />
              </div>
              <div className="flex-1">
                  <div className={`text-[11px] font-bold ${mutedText} leading-tight`}>
                      Need help? Check the <span className="text-blue-600">setup guide</span> for connecting devices.
                  </div>
              </div>
          </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-auto opacity-50 hover:opacity-100 italic text-xs">dismiss</button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl">
          <AlertCircle size={18} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {/* Table Section */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader className="animate-spin text-blue-600" size={48} />
            <p className={`font-bold ${mutedText}`}>Synchronizing device network...</p>
          </div>
        ) : (
          <KioskTable
            kiosks={kiosks}
            onEdit={handleEdit}
            onDelete={setShowDeleteConfirm}
            onToggleActive={handleToggleActive}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-sm w-full shadow-2xl border dark:border-slate-800 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className={`text-2xl font-black ${textColor}`}>Remove Device?</h2>
            <p className={`mt-3 text-sm ${mutedText} leading-relaxed`}>
              Are you sure you want to remove <span className="font-bold text-red-500">{showDeleteConfirm.name}</span>? 
              This will disconnect the physical terminal from the system.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={handleConfirmDelete} 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
              >
                Yes, Delete Terminal
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                className={`w-full py-3.5 rounded-xl font-bold transition-all ${isDarkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <KioskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedKiosk}
        hospitalId={hospitalId}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
