/**
 * Department Modal Component
 * Modal wrapper for department form
 */

'use client';

import React from 'react';
import { X, Loader } from 'lucide-react';
import { DepartmentForm } from './DepartmentForm';
import type { Department } from '../types';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; prefix: string }) => Promise<void>;
  initialData?: Department | null;
  isLoading?: boolean;
  isDarkMode?: boolean;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  isDarkMode = false,
}) => {
  if (!isOpen) return null;

  const overlayBg = isDarkMode ? 'bg-black/70' : 'bg-black/50';
  const modalBg = isDarkMode ? 'bg-slate-950' : 'bg-white';
  const headerTextColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const borderColor = isDarkMode ? 'border-slate-700' : 'border-slate-200';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayBg}`}
      onClick={onClose}
    >
      <div
        className={`${modalBg} rounded-lg shadow-xl max-w-md w-full border ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}
        >
          <h2 className={`text-lg font-semibold ${headerTextColor}`}>
            {initialData ? 'Edit Department' : 'Create New Department'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-slate-800 text-slate-400'
                : 'hover:bg-slate-100 text-slate-500'
            } disabled:opacity-50`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <DepartmentForm
            initialData={initialData}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};
