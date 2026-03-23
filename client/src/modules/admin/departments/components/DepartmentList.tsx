/**
 * Department List Component (Main Component)
 * Orchestrates all department management features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Loader, LayoutGrid, LayoutList } from 'lucide-react';
import { DepartmentTable } from './DepartmentTable';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentModal } from './DepartmentModal';
import type { Department } from '../types';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '../hooks';

interface DepartmentListProps {
  isDarkMode?: boolean;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({ isDarkMode = false }) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Department | null>(null);

  // Hooks
  const {
    departments,
    loading: loadingDepartments,
    error: deptError,
    refetch,
  } = useDepartments();
  const {
    createDepartment,
    loading: createLoading,
    error: createError,
  } = useCreateDepartment();
  const {
    updateDepartment,
    loading: updateLoading,
    error: updateError,
  } = useUpdateDepartment();
  const {
    deleteDepartment,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteDepartment();

  const isLoading = createLoading || updateLoading || deleteLoading;
  const error = createError || updateError || deleteError || deptError;

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCreateClick = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (department: Department) => {
    setShowDeleteConfirm(department);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;
    const success = await deleteDepartment(showDeleteConfirm._id);
    if (success) {
      setSuccessMessage('Department deleted successfully');
      setShowDeleteConfirm(null);
      refetch();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleModalSubmit = async (data: { name: string; prefix: string }) => {
    try {
      if (selectedDepartment) {
        // Update existing
        const result = await updateDepartment(selectedDepartment._id, data);
        if (result) {
          setSuccessMessage('Department updated successfully');
          handleModalClose();
          refetch();
        }
      } else {
        // Create new
        const result = await createDepartment(data);
        if (result) {
          setSuccessMessage('Department created successfully');
          handleModalClose();
          refetch();
        }
      }
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  // Color schemes based on dark mode
  const bgColor = isDarkMode ? 'bg-slate-950' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const containerBg = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const headerBg = isDarkMode ? 'bg-slate-950' : 'bg-white';
  const buttonBg = isDarkMode
    ? 'bg-blue-700 hover:bg-blue-800'
    : 'bg-blue-600 hover:bg-blue-700';
  const secondaryButtonBg = isDarkMode
    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
    : 'bg-slate-200 hover:bg-slate-300 text-slate-700';
  const borderColor = isDarkMode ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className={`space-y-6 ${containerBg} rounded-lg p-6`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${textColor}`}>Departments</h1>
          <p className={`text-sm ${mutedText} mt-1`}>
            Manage hospital departments and token prefixes
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className={`${buttonBg} text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto`}
        >
          <Plus className="h-5 w-5" />
          Add Department
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div
          className={`p-4 rounded-lg border ${
            isDarkMode
              ? 'bg-green-900/20 border-green-800 text-green-300'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            isDarkMode
              ? 'bg-red-900/20 border-red-800 text-red-300'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className={`text-sm font-medium ${mutedText}`}>
          {departments.length} {departments.length === 1 ? 'department' : 'departments'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? isDarkMode
                  ? 'bg-blue-900/30 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
                : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Table view"
          >
            <LayoutList className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'card'
                ? isDarkMode
                  ? 'bg-blue-900/30 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
                : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Card view"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loadingDepartments && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader
              className={`h-8 w-8 animate-spin ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
            />
            <p className={textColor}>Loading departments...</p>
          </div>
        </div>
      )}

      {/* Content - Table or Card View */}
      {!loadingDepartments && (
        <>
          {viewMode === 'table' ? (
            <DepartmentTable
              departments={departments}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              isDarkMode={isDarkMode}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <p className={`text-lg font-medium ${textColor}`}>
                    No departments found
                  </p>
                  <p className={`text-sm ${mutedText}`}>
                    Create your first department to get started
                  </p>
                </div>
              ) : (
                departments.map((dept) => (
                  <DepartmentCard
                    key={dept._id}
                    department={dept}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    isDarkMode={isDarkMode}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50`}
        >
          <div
            className={`${headerBg} rounded-lg shadow-xl max-w-sm w-full border ${borderColor} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold ${textColor} mb-2`}>
              Confirm Deletion
            </h3>
            <p className={mutedText}>
              Are you sure you want to delete the "{showDeleteConfirm.name}" department?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {deleteLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleteLoading}
                className={`flex-1 ${secondaryButtonBg} font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={selectedDepartment}
        isLoading={isLoading}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
