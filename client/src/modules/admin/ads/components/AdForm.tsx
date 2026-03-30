'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Loader,
  Upload,
  X,
  Clock,
  Layers,
  MousePointer2,
} from 'lucide-react';
import type { Ad } from '../types';

interface AdFormProps {
  initialData?: Ad | null;
  onSubmit: (data: {
    title: string;
    type: 'image' | 'video';
    fileName: string;
    duration: number;
    displayArea: 'carousel' | 'fullscreen';
    file?: File;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
  uploadProgress?: number;
}

export const AdForm: React.FC<AdFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isDarkMode = false,
  uploadProgress = 0,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    displayArea: (initialData?.displayArea || 'carousel') as 'carousel' | 'fullscreen',
    duration: initialData?.duration?.toString() || '10',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        displayArea: initialData.displayArea,
        duration: initialData.duration.toString(),
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const adType = selectedFile
        ? selectedFile.type.startsWith('video/')
          ? 'video'
          : 'image'
        : initialData?.type || 'image';

      await onSubmit({
        ...formData,
        type: adType as 'image' | 'video',
        fileName: selectedFile?.name || initialData?.fileKey || '',
        duration: parseInt(formData.duration) || 10,
        file: selectedFile || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 ${
    isDarkMode
      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
      : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Title Section */}
      <section className="space-y-2">
        <label
          className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
        >
          <MousePointer2 size={16} /> Campaign Title
        </label>
        <input
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Summer Sale Banner"
          className={inputClass}
          required
        />
      </section>

      {/* Media Upload Section */}
      <section className="space-y-2">
        <label
          className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
        >
          Content Preview
        </label>
        <div
          className={`relative group border-2 border-dashed rounded-2xl overflow-hidden transition-all ${
            isDarkMode
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-slate-50 border-slate-200'
          } ${!filePreview && !initialData?.fileKey ? 'py-12' : 'p-2'}`}
        >
          {!filePreview && !initialData?.fileKey ? (
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <div className="p-4 bg-blue-500/10 rounded-full text-blue-500 mb-3">
                <Upload size={32} />
              </div>
              <span className="font-bold text-slate-500">Drop your file here</span>
              <span className="text-xs text-slate-400">MP4, JPG, PNG (Max 100MB)</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setFilePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          ) : (
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden shadow-inner">
              {selectedFile?.type.startsWith('video') || initialData?.type === 'video' ? (
                <video
                  src={
                    filePreview ||
                    `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${initialData?.fileKey}`
                  }
                  className="w-full h-full object-contain"
                  controls
                />
              ) : (
                <img
                  src={
                    filePreview ||
                    `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${initialData?.fileKey}`
                  }
                  className="w-full h-full object-contain"
                  alt="Ad preview"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreview('');
                }}
                className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <section className="space-y-2">
          <label
            className={`text-sm font-semibold flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            <Clock size={16} /> Duration (Seconds)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className={inputClass}
          />
        </section>
      </div>

      {/* Display Area Selection - Better UI */}
      <section className="space-y-3">
        <label
          className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
        >
          Screen Placement
        </label>
        <div
          className={`grid grid-cols-3 gap-2 p-1.5 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
        >
          {['carousel', 'fullscreen'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormData({ ...formData, displayArea: option as any })}
              className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                formData.displayArea === option
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm ring-1 ring-black/5'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </section>

      {/* Progress Bar (Only during active upload) */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2 animate-pulse">
          <div className="flex justify-between text-xs font-bold text-blue-500">
            <span>UPLOADING TO S3...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <Upload size={20} />
          )}
          {initialData ? 'Update Campaign' : 'Publish to Kiosk'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 font-bold py-4 rounded-2xl transition-all ${
            isDarkMode
              ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
