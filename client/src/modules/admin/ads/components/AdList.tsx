'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, AlertCircle, Loader, LayoutGrid, LayoutList, Filter, CheckCircle2, Clock, Layers, X } from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';


import { AdTable } from './AdTable';
import { AdCard } from './AdCard';
import { AdModal } from './AdModal';
import type { Ad } from '../types';
import { useAds, useCreateAd, useUpdateAd, useDeleteAd } from '../hooks';

interface AdListProps {
  isDarkMode?: boolean;
}

export const AdList: React.FC<AdListProps> = ({ isDarkMode = false }) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Ad | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);


  // Hooks
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { ads, pagination, loading: loadingAds, error: adsError, refetch } = useAds({ 
    page, 
    limit, 
    isActive: activeFilter === 'all' ? undefined : activeFilter === 'active' 
  });
  const { createAd, loading: createLoading, error: createError } = useCreateAd();
  const { updateAd, loading: updateLoading, error: updateError } = useUpdateAd();
  const { deleteAd, loading: deleteLoading, error: deleteError } = useDeleteAd();

  const isLoading = createLoading || updateLoading || deleteLoading;
  const error = createError || updateError || deleteError || adsError;

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Since the backend handles filtering, we don't need a separate useMemo for filteredAds
  const filteredAds = ads;

  const handleCreateClick = () => {
    setSelectedAd(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleEditClick = (ad: Ad) => {
    setSelectedAd(ad);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;
    const success = await deleteAd(showDeleteConfirm._id);
    if (success) {
      setSuccessMessage('Ad deleted successfully');
      setShowDeleteConfirm(null);
      refetch();
    }
  };

  const handleToggleActive = async (ad: Ad) => {
    const success = await updateAd(ad._id, { isActive: !ad.isActive });
    if (success) {
      setSuccessMessage(`Ad ${!ad.isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    }
  };

  const handleModalSubmit = async (data: any) => {
    if (selectedAd) {
      const result = await updateAd(selectedAd._id, data);
      if (result) {
        setSuccessMessage('Ad updated successfully');
        setIsModalOpen(false);
        refetch();
      }
    } else {
      const result = await createAd(data, data.file, (p) => setUploadProgress(p));
      if (result) {
        setSuccessMessage('Ad uploaded successfully');
        setIsModalOpen(false);
        refetch();
      }
    }
  };

  // Styles
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const containerBg = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const buttonPrimary = "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20";

  return (
    <div className={`space-y-6 ${containerBg} rounded-xl p-6 min-h-screen transition-colors duration-300`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${textColor}`}>Kiosk Ads</h1>
          <p className={`text-sm ${mutedText} mt-1`}>Manage and deploy content to your kiosk screens</p>
        </div>
        <button 
          onClick={handleCreateClick} 
          className={`${buttonPrimary} flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all active:scale-95`}
        >
          <Plus size={20} strokeWidth={3} /> Upload New Content
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/50 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setActiveFilter(f);
                setPage(1); // Reset page on filter change
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-all ${
                activeFilter === f 
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
          <button 
            onClick={() => setViewMode('table')} 
            className={`p-2 rounded-md ${viewMode === 'table' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400'}`}
          >
            <LayoutList size={20} />
          </button>
          <button 
            onClick={() => setViewMode('card')} 
            className={`p-2 rounded-md ${viewMode === 'card' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400'}`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loadingAds ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader className="animate-spin text-blue-600" size={40} />
          <p className={`text-sm font-medium ${mutedText}`}>Syncing with S3 storage...</p>
        </div>
      ) : (
        <div className="min-h-[400px]">
          {viewMode === 'table' ? (
              <AdTable 
                ads={filteredAds} 
                onEdit={handleEditClick} 
                onDelete={setShowDeleteConfirm} 
                onToggleActive={handleToggleActive} 
                onPreview={setPreviewAd}
                isDarkMode={isDarkMode} 
              />

          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAds.map(ad => (
                <AdCard 
                  key={ad._id} 
                  ad={ad} 
                  onEdit={handleEditClick} 
                  onDelete={setShowDeleteConfirm} 
                  onToggleActive={handleToggleActive}
                  onPreview={setPreviewAd}
                  isDarkMode={isDarkMode} 
                />

              ))}
            </div>
          )}
          
          {filteredAds.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Filter size={48} className="text-slate-300 mb-4" />
              <p className={`text-lg font-bold ${textColor}`}>No matching ads</p>
              <p className={mutedText}>Try changing your filter or upload a new ad.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <h2 className={`text-xl font-bold ${textColor}`}>Delete this ad?</h2>
            <p className={`mt-2 text-sm ${mutedText}`}>
              This will permanently delete <span className="font-bold text-red-500">{showDeleteConfirm.title}</span> from the server and S3 bucket.
            </p>
            <div className="flex gap-3 mt-8">
              <button onClick={handleConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold transition-all">Delete</button>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-slate-100 dark:bg-slate-800 ${textColor} py-2.5 rounded-xl font-bold transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Modal */}
      <AdModal 
        isOpen={isModalOpen} 
        initialData={selectedAd} 
        onSubmit={handleModalSubmit} 
        onClose={() => setIsModalOpen(false)} 
        uploadProgress={uploadProgress}
        isDarkMode={isDarkMode}
      />

      {/* Media Preview Lightbox */}
      {previewAd && (
        <div 
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={() => setPreviewAd(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            onClick={() => setPreviewAd(null)}
          >
            <X size={32} />
          </button>

          
          <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6" onClick={e => e.stopPropagation()}>
             <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                {previewAd.type === 'video' ? (
                  <video 
                    src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${previewAd.fileKey}`} 
                    className="w-full max-h-[70vh] object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${previewAd.fileKey}`} 
                    className="w-full max-h-[70vh] object-contain"
                    alt={previewAd.title}
                  />
                )}
             </div>
             
             <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">{previewAd.title}</h2>
                <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
                   <span className="flex items-center gap-1.5 capitalize"><Layers size={14}/> {previewAd.displayArea}</span>
                   <span className="flex items-center gap-1.5"><Clock size={14}/> {previewAd.duration}s Playtime</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>

  );
};