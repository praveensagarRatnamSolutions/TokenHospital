'use client';

import { Check, Clock, Edit, Eye, EyeOff, Image as ImageIcon, Layers, Play, Trash2, X } from 'lucide-react';
import React from 'react';

import type { Ad } from '../types';

interface AdTableProps {
  ads: Ad[];
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
  onToggleActive?: (ad: Ad) => void;
  onPreview?: (ad: Ad) => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
  userRole?: string;
  onReview?: (ad: Ad, status: 'accepted' | 'rejected', reason?: string) => void;
}

export const AdTable: React.FC<AdTableProps> = ({
  ads,
  onEdit,
  onDelete,
  onToggleActive,
  onPreview,
  isLoading = false,
  isDarkMode = false,
  userRole,
  onReview,
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
                    <div 
                      onClick={() => onPreview?.(ad)}
                      className={`relative w-14 h-10 rounded-md overflow-hidden flex-shrink-0 bg-slate-200 border ${tableBorderColor} group/thumb cursor-zoom-in`}
                    >

                      {ad.fileKey ? (
                        ad.type === 'video' ? (
                          <>
                            <video
                              src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                              onMouseLeave={(e) => {
                                const v = e.target as HTMLVideoElement;
                                v.pause();
                                v.currentTime = 0;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:opacity-0 transition-opacity">
                              <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                                <Play size={10} className="text-black fill-black" />
                              </div>
                            </div>

                          </>
                        ) : (
                          <img
                            src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as any).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        )
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
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${ad.isActive 
                        ? (isDarkMode ? 'bg-green-950/30 text-green-400 border border-green-900/50' : 'bg-green-50 text-green-700 border border-green-100')
                        : (isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-50 text-slate-500 border border-slate-200')
                      }`}>
                      <span className={`w-1 h-1 rounded-full mr-1.5 ${ad.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                      {ad.isActive ? 'Live' : 'Inactive'}
                    </span>
                    
                    <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                      ${ad.approvalStatus === 'accepted' 
                        ? (isDarkMode ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100')
                        : ad.approvalStatus === 'rejected'
                        ? (isDarkMode ? 'bg-red-950/30 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-100')
                        : (isDarkMode ? 'bg-amber-950/30 text-amber-400 border border-amber-900/50' : 'bg-amber-50 text-amber-700 border border-amber-100')
                      }`}>
                      {ad.approvalStatus || 'pending'}
                    </span>
                    {ad.approvalStatus === 'rejected' && ad.rejectionReason && (
                      <span className="text-[10px] font-medium text-red-500 dark:text-red-400 max-w-[200px] break-words whitespace-normal leading-relaxed" title={ad.rejectionReason}>
                        Reason: {ad.rejectionReason}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    {userRole === 'ADMIN' && ad.approvalStatus === 'pending' && onReview && (
                      <>
                        <button
                          onClick={() => onReview(ad, 'accepted')}
                          className="p-1.5 rounded-md transition-colors hover:bg-emerald-100 text-emerald-600 dark:hover:bg-emerald-950/30 dark:text-emerald-400"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onReview(ad, 'rejected')}
                          className="p-1.5 rounded-md transition-colors hover:bg-red-100 text-red-600 dark:hover:bg-red-950/30 dark:text-red-400"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {onToggleActive && (
                      <button
                        onClick={() => onToggleActive(ad)}
                        disabled={ad.approvalStatus !== 'accepted'}
                        className={`p-1.5 rounded-md transition-colors ${
                          isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
                        } ${ad.approvalStatus !== 'accepted' ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title={
                          ad.approvalStatus !== 'accepted'
                            ? 'Cannot toggle active state on unapproved ads'
                            : ad.isActive ? 'Deactivate' : 'Activate'
                        }
                      >
                        {ad.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(ad)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isDarkMode ? 'hover:bg-blue-900/30 text-blue-400' : 'hover:bg-blue-100 text-blue-600'
                      }`}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(ad)}
                      className={`p-1.5 rounded-md transition-colors ${
                        isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-100 text-red-600'
                      }`}
                      title="Delete"
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
