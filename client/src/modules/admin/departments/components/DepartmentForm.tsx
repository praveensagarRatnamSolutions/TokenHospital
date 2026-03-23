/**
 * Department Form Component
 * Reusable form for creating and editing departments
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import type { Department } from '../types';
import { validateDepartmentForm, getFieldError } from '../validation';

interface DepartmentFormProps {
  initialData?: Department | null;
  onSubmit: (data: { name: string; prefix: string }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isDarkMode = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    prefix: initialData?.prefix || '',
  });

  const [errors, setErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        prefix: initialData.prefix,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setErrors((prev) => prev.filter((err) => err.field !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateDepartmentForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      setFormData({ name: '', prefix: '' });
      setErrors([]);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bgColor = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const inputBgColor = isDarkMode
    ? 'bg-slate-800 border-slate-700'
    : 'bg-slate-50 border-slate-300';
  const inputTextColor = isDarkMode
    ? 'text-white placeholder-slate-400'
    : 'text-slate-900 placeholder-slate-500';
  const labelColor = isDarkMode ? 'text-slate-300' : 'text-slate-700';
  const errorBgColor = isDarkMode
    ? 'bg-red-900/20 border-red-800'
    : 'bg-red-50 border-red-200';
  const errorTextColor = isDarkMode ? 'text-red-300' : 'text-red-700';
  const buttonBgColor = isDarkMode
    ? 'bg-blue-700 hover:bg-blue-800'
    : 'bg-blue-600 hover:bg-blue-700';
  const cancelBgColor = isDarkMode
    ? 'bg-slate-700 hover:bg-slate-600'
    : 'bg-slate-300 hover:bg-slate-400';

  return (
    <form
      onSubmit={handleSubmit}
      className={`${bgColor} p-6 rounded-lg border border-slate-200 dark:border-slate-700`}
    >
      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelColor}`}>
            Department Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Cardiology, Neurology"
            className={`w-full px-4 py-2 rounded-lg border ${inputBgColor} ${inputTextColor} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            disabled={isLoading || isSubmitting}
          />
          {getFieldError(errors, 'name') && (
            <div
              className={`mt-2 p-2 rounded-lg border ${errorBgColor} flex items-start gap-2`}
            >
              <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${errorTextColor}`} />
              <span className={`text-sm ${errorTextColor}`}>
                {getFieldError(errors, 'name')}
              </span>
            </div>
          )}
        </div>

        {/* Prefix Field */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelColor}`}>
            Token Prefix (Max 3 characters) *
          </label>
          <input
            type="text"
            name="prefix"
            value={formData.prefix.toUpperCase()}
            onChange={handleChange}
            placeholder="e.g., A, B, C"
            maxLength={3}
            className={`w-full px-4 py-2 rounded-lg border ${inputBgColor} ${inputTextColor} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            disabled={isLoading || isSubmitting}
          />
          {getFieldError(errors, 'prefix') && (
            <div
              className={`mt-2 p-2 rounded-lg border ${errorBgColor} flex items-start gap-2`}
            >
              <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${errorTextColor}`} />
              <span className={`text-sm ${errorTextColor}`}>
                {getFieldError(errors, 'prefix')}
              </span>
            </div>
          )}
          <p
            className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Used to generate token numbers (e.g., A-001, B-002)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={`flex-1 ${buttonBgColor} text-white font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : initialData ? (
              'Update Department'
            ) : (
              'Create Department'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
              className={`${cancelBgColor} text-white font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
