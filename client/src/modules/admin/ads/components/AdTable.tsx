'use client';

import React from 'react';
import { Edit, Trash2, Eye, EyeOff, Clock, Layers, Image as ImageIcon } from 'lucide-react';
import type { Ad } from '../types';

interface AdTableProps {
  ads: Ad[];
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
  onToggleActive?: (ad: Ad) => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
}

export const AdTable: React.FC<AdTableProps> = ({
  ads,
  onEdit,
  onDelete,
  onToggleActive,
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

  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Layers className={`h-12 w-12 ${mutedText} opacity-50 mb-4`} />
        <p className={`text-lg font-medium ${textColor}`}>No ads found</p>
        <p className={`text-sm ${mutedText}`}>Create your first advertisement to get started</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto border ${tableBorderColor} rounded-lg shadow-sm`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`${tableHeaderBg} border-b ${tableBorderColor}`}>
            <th className={`px-6 py-3 text-sm font-semibold ${tableHeaderText}`}>Ad Content</th>
            <th className={`px-6 py-3 text-sm font-semibold ${tableHeaderText}`}>Display</th>
            <th className={`px-6 py-3 text-sm font-semibold ${tableHeaderText}`}>Metrics</th>
            <th className={`px-6 py-3 text-sm font-semibold ${tableHeaderText}`}>Status</th>
            <th className={`px-6 py-3 text-sm font-semibold ${tableHeaderText}`}>Actions</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${tableBorderColor}`}>
          {ads.map((ad) => {
            // Using logic from your JSON: duration and isActive
            const createdDate = new Date(ad.createdAt).toLocaleDateString();
            
            return (
              <tr key={ad._id} className={`${tableRowBg} transition-colors`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-10 rounded-md overflow-hidden flex-shrink-0 bg-slate-200 border ${tableBorderColor}`}>
                      {ad.fileKey ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${textColor}`}>{ad.title}</div>
                      <div className={`text-xs ${mutedText}`}>{ad.fileName}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize 
                    ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                    {ad.displayArea}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className={`flex flex-col gap-1 text-xs ${mutedText}`}>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {ad.duration}s duration
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      Prio: {ad.priority}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${ad.isActive 
                      ? (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700')
                      : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${ad.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    {ad.isActive ? 'Live' : 'Inactive'}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {onToggleActive && (
                      <button
                        onClick={() => onToggleActive(ad)}
                        className={`p-1.5 rounded-md transition-colors ${
                          isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
                        }`}
                        title={ad.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {ad.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(ad)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isDarkMode ? 'hover:bg-blue-900/30 text-blue-400' : 'hover:bg-blue-100 text-blue-600'
                      }`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(ad)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-100 text-red-600'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
