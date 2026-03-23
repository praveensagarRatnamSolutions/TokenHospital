'use client';

import React from 'react';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import type { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
  onToggleActive?: (ad: Ad) => void;
  isDarkMode?: boolean;
}

export const AdCard: React.FC<AdCardProps> = ({
  ad,
  onEdit,
  onDelete,
  onToggleActive,
  isDarkMode = false,
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
        className={`w-full aspect-video ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center overflow-hidden relative group`}
      >
        {ad.fileKey ? (
          ad.type === 'video' ? (
            <video src={mediaUrl} className="w-full h-full object-cover" muted />
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${mutedText}`} />
            <span className={`text-sm font-medium ${textColor}`}>{ad.duration}s <span className="text-xs font-normal opacity-70">playtime</span></span>
          </div>
          <div className={`text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 ${mutedText}`}>
            Prio: {ad.priority}
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(ad)}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title={ad.isActive ? 'Deactivate' : 'Activate'}
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