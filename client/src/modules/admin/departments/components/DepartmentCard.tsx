/**
 * Department Card Component
 * Card view for departments (mobile-friendly alternative to table)
 */

'use client';

import React from 'react';
import { Edit, Trash2, Calendar, Hash } from 'lucide-react';
import type { Department } from '../types';

interface DepartmentCardProps {
  department: Department;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  isDarkMode?: boolean;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit,
  onDelete,
  isDarkMode = false,
}) => {
  const cardBg = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const hoverBg = isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50';

  return (
    <div
      className={`${cardBg} border ${cardBorder} rounded-lg p-4 space-y-3 transition-colors ${hoverBg}`}
    >
      {/* Department Name */}
      <div>
        <h3 className={`text-lg font-semibold ${textColor}`}>{department.name}</h3>
      </div>

      {/* Token Prefix Badge */}
      <div className="flex items-center gap-2">
        <Hash className={`h-4 w-4 ${mutedText}`} />
        <span
          className={`text-sm inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold ${
            isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {department.prefix}
        </span>
      </div>

      {/* Created Date */}
      <div className="flex items-center gap-2">
        <Calendar className={`h-4 w-4 ${mutedText}`} />
        <span className={`text-sm ${mutedText}`}>
          {new Date(department.createdAt || '').toLocaleDateString()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => onEdit(department)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            isDarkMode
              ? 'hover:bg-blue-900/30 text-blue-400'
              : 'hover:bg-blue-100 text-blue-600'
          }`}
        >
          <Edit className="h-4 w-4" />
          <span className="text-sm font-medium">Edit</span>
        </button>
        <button
          onClick={() => onDelete(department)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
            isDarkMode
              ? 'hover:bg-red-900/30 text-red-400'
              : 'hover:bg-red-100 text-red-600'
          }`}
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm font-medium">Delete</span>
        </button>
      </div>
    </div>
  );
};
