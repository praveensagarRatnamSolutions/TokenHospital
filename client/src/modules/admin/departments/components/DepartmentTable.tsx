/**
 * Department Table Component
 * Displays departments in a table format
 */

'use client';

import React from 'react';
import { Edit, Trash2, ChevronRight } from 'lucide-react';
import type { Department } from '../types';

interface DepartmentTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  onEdit,
  onDelete,
  isLoading = false,
  isDarkMode = false,
}) => {
  const tableHeaderBg = isDarkMode ? 'bg-slate-800' : 'bg-slate-100';
  const tableHeaderText = isDarkMode ? 'text-slate-300' : 'text-slate-700';
  const tableRowBg = isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50';
  const tableBorderColor = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-slate-300' : 'text-slate-700';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse space-y-4 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-12 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-lg`}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ChevronRight className={`h-12 w-12 ${mutedText} opacity-50 mb-4`} />
        <p className={`text-lg font-medium ${textColor}`}>No departments found</p>
        <p className={`text-sm ${mutedText}`}>
          Create your first department to get started
        </p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg`}
    >
      <table className="w-full">
        <thead>
          <tr
            className={`${tableHeaderBg} border-b border-slate-200 dark:border-slate-700`}
          >
            <th
              className={`px-6 py-3 text-left text-sm font-semibold ${tableHeaderText}`}
            >
              Department Name
            </th>
            <th
              className={`px-6 py-3 text-left text-sm font-semibold ${tableHeaderText}`}
            >
              Token Prefix
            </th>
            <th
              className={`px-6 py-3 text-left text-sm font-semibold ${tableHeaderText}`}
            >
              Created
            </th>
            <th
              className={`px-6 py-3 text-left text-sm font-semibold ${tableHeaderText}`}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr
              key={department._id}
              className={`border-b border-slate-200 dark:border-slate-700 ${tableRowBg} transition-colors cursor-pointer`}
            >
              <td className={`px-6 py-4 text-sm font-medium ${textColor}`}>
                {department.name}
              </td>
              <td className={`px-6 py-4 text-sm`}>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    isDarkMode
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {department.prefix}
                </span>
              </td>
              <td className={`px-6 py-4 text-sm ${mutedText}`}>
                {new Date(department.createdAt || '').toLocaleDateString()}
              </td>
              <td className={`px-6 py-4 text-sm`}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(department)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'hover:bg-blue-900/30 text-blue-400'
                        : 'hover:bg-blue-100 text-blue-600'
                    }`}
                    title="Edit department"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(department)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'hover:bg-red-900/30 text-red-400'
                        : 'hover:bg-red-100 text-red-600'
                    }`}
                    title="Delete department"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
