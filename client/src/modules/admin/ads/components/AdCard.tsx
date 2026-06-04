'use client';

import {
  Check,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Play,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import React from 'react';

import type { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
  onToggleActive?: (ad: Ad) => void;
  onPreview?: (ad: Ad) => void;
  isDarkMode?: boolean;
  userRole?: string;
  onReview?: (ad: Ad, status: 'accepted' | 'rejected', reason?: string) => void;
}

export const AdCard: React.FC<AdCardProps> = ({
  ad,
  onEdit,
  onDelete,
  onToggleActive,
  onPreview,
  isDarkMode = false,
  userRole,
  onReview,
}) => {

  const cardBg = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-slate-700' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const hoverBg = isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50';

  // Use the CloudFront URL for the image/video source
  const mediaUrl = `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`;

  return (
    <div
      className={`${cardBg} border ${cardBorder} rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md ${hoverBg}`}
    >
      {/* Preview Section */}
      <div
        onClick={() => onPreview?.(ad)}
        className={`w-full aspect-video ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center overflow-hidden relative group cursor-zoom-in`}
      >

        {ad.fileKey ? (
          ad.type === 'video' ? (
            <>
              <video
                src={mediaUrl}
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:opacity-0 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                  <Play size={24} className="text-black fill-black ml-1" />
                </div>
              </div>

            </>
          ) : (
            <img
              src={mediaUrl}
              alt={ad.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )
        ) : (
          <div className={`flex flex-col items-center justify-center gap-2 ${mutedText}`}>
            {ad.type === 'video' ? <Video size={32} /> : <ImageIcon size={32} />}
            <span className="text-xs">No preview available</span>
          </div>
        )}


        {/* Floating Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
            ad.displayArea === 'carousel' 
              ? 'bg-blue-500/80 border-blue-400 text-white' 
              : 'bg-purple-500/80 border-purple-400 text-white'
          }`}>
            {ad.displayArea}
          </span>
        </div>

        <div className="absolute top-2 right-2">
           <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
            ad.isActive 
              ? 'bg-green-500/80 border-green-400 text-white' 
              : 'bg-slate-500/80 border-slate-400 text-white'
          }`}>
            {ad.isActive ? '● LIVE' : '○ INACTIVE'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className={`text-md font-bold ${textColor} line-clamp-1`}>{ad.title}</h3>
          <p className={`text-xs ${mutedText} mt-1`}>Added on {new Date(ad.createdAt).toLocaleDateString()}</p>
          
          {/* Approval Badge */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider
              ${ad.approvalStatus === 'accepted' 
                ? (isDarkMode ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100')
                : ad.approvalStatus === 'rejected'
                ? (isDarkMode ? 'bg-red-950/30 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-100')
                : (isDarkMode ? 'bg-amber-950/30 text-amber-400 border border-amber-900/50' : 'bg-amber-50 text-amber-700 border border-amber-100')
              }`}>
              {ad.approvalStatus || 'pending'}
            </span>
            {ad.approvalStatus === 'rejected' && ad.rejectionReason && (
              <span className="text-[9px] font-semibold text-red-500 max-w-[180px] break-words whitespace-normal leading-relaxed" title={ad.rejectionReason}>
                Reason: {ad.rejectionReason}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${mutedText}`} />
            <span className={`text-sm font-medium ${textColor}`}>{ad.duration}s <span className="text-xs font-normal opacity-70">playtime</span></span>
          </div>
        </div>

        {/* Admin Review Action Banner */}
        {userRole === 'ADMIN' && ad.approvalStatus === 'pending' && onReview && (
          <div className="flex gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => onReview(ad, 'accepted')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check size={12} /> Approve
            </button>
            <button
              onClick={() => onReview(ad, 'rejected')}
              className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <X size={12} /> Reject
            </button>
          </div>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(ad)}
              disabled={ad.approvalStatus !== 'accepted'}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              } ${ad.approvalStatus !== 'accepted' ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={
                ad.approvalStatus !== 'accepted'
                  ? 'Cannot toggle active state on unapproved ads'
                  : ad.isActive ? 'Deactivate' : 'Activate'
              }
            >
              {ad.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
              <span className="text-[10px] font-bold uppercase">{ad.isActive ? 'Hide' : 'Show'}</span>
            </button>
          )}
          
          <button
            onClick={() => onEdit(ad)}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-blue-900/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
            }`}
          >
            <Edit size={16} />
            <span className="text-[10px] font-bold uppercase">Edit</span>
          </button>

          <button
            onClick={() => onDelete(ad)}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
            }`}
          >
            <Trash2 size={16} />
            <span className="text-[10px] font-bold uppercase">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};