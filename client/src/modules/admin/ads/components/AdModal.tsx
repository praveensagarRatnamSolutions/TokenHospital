/**
 * Ad Modal Component
 * Refactored for better scroll behavior and sticky header visibility
 */

'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AdForm } from './AdForm';
import type { Ad } from '../types';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Ad | null;
  isLoading?: boolean;
  uploadProgress?: number;
  isDarkMode?: boolean;
}

export const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  uploadProgress = 0,
  isDarkMode = false,
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayBg = isDarkMode ? 'bg-black/70' : 'bg-black/50';
  const modalBg = isDarkMode ? 'bg-slate-950' : 'bg-white';
  const headerTextColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const borderColor = isDarkMode ? 'border-slate-700' : 'border-slate-200';

  return (
    <div
      // Fixed: Changed items-center to items-start + py-8/md:py-12 
      // This ensures long forms can be scrolled from the very top.
      className={`fixed inset-0 z-50 flex justify-center items-start overflow-y-auto p-4 py-8 md:py-12 ${overlayBg} backdrop-blur-sm`}
      onClick={onClose}
    >
      <div
        className={`${modalBg} rounded-lg shadow-2xl w-full max-w-2xl border ${borderColor} relative mb-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header 
            Added: ${modalBg} and z-10 to ensure form content doesn't 
            overlap the header text during scroll.
        */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}  top-0 ${modalBg} rounded-t-lg z-20`}
        >
          <h2 className={`text-lg font-semibold ${headerTextColor}`}>
            {initialData ? 'Edit Advertisement' : 'Create New Advertisement'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-slate-100 text-slate-500'
            } disabled:opacity-50`}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <AdForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            uploadProgress={uploadProgress}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};