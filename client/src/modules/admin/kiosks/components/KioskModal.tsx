'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Monitor, MapPin, Users, User, PlayCircle, Plus, Trash2, GripVertical, Settings, Layers } from 'lucide-react';
import { Kiosk, KioskAd } from '../../../kiosk/types';
import { useDepartments } from '../../departments/hooks';
import { useDoctors } from '../../doctors/hooks';
import { useAds } from '../../ads/hooks';
import { Ad } from '../../ads/types';
import { Department } from '../../departments/types';
import { Doctor } from '../../doctors/types';

interface KioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Kiosk | null;
  hospitalId: string;
  isDarkMode?: boolean;
}

type TabType = 'general' | 'clinical' | 'playlist';

export const KioskModal: React.FC<KioskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  hospitalId,
  isDarkMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    locationType: 'general',
    departmentIds: [] as string[],
    doctorIds: [] as string[],
    ads: [] as { adId: string; order: number }[],
  });

  const { departments, loading: loadingDepts } = useDepartments();
  
  const doctorFilters = useMemo(() => ({
    departmentId: formData.departmentIds.length > 0 ? formData.departmentIds : undefined
  }), [formData.departmentIds]);

  const { doctors, loading: loadingDocs } = useDoctors(doctorFilters);
  const { ads: availableAds, loading: loadingAds } = useAds({ isActive: true, limit: 100 });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        locationType: initialData.locationType,
        departmentIds: initialData.departmentIds.map((d: any) => typeof d === 'string' ? d : d._id),
        doctorIds: initialData.doctorIds.map((d: any) => typeof d === 'string' ? d : d._id),
        ads: initialData.ads.map(a => ({ 
          adId: typeof a.adId === 'string' ? a.adId : a.adId._id, 
          order: a.order 
        })),
      });
    } else {
      setFormData({
        name: '',
        code: '',
        locationType: 'general',
        departmentIds: [],
        doctorIds: [],
        ads: [],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, hospitalId });
  };

  const toggleSelection = (field: 'departmentIds' | 'doctorIds', id: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(id) 
        ? prev[field].filter(item => item !== id)
        : [...prev[field], id]
    }));
  };

  const addAdToPlaylist = (adId: string) => {
    if (formData.ads.some(a => a.adId === adId)) return;
    setFormData(prev => ({
      ...prev,
      ads: [...prev.ads, { adId, order: prev.ads.length }]
    }));
  };

  const removeAdFromPlaylist = (adId: string) => {
    setFormData(prev => ({
      ...prev,
      ads: prev.ads.filter(a => a.adId !== adId).map((a, i) => ({ ...a, order: i }))
    }));
  };

  const moveAd = (index: number, direction: 'up' | 'down') => {
    const newAds = [...formData.ads];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAds.length) return;
    
    [newAds[index], newAds[targetIndex]] = [newAds[targetIndex], newAds[index]];
    setFormData(prev => ({
      ...prev,
      ads: newAds.map((a, i) => ({ ...a, order: i }))
    }));
  };

  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const inputBg = isDarkMode ? 'bg-slate-800' : 'bg-slate-50';
  const inputBorder = isDarkMode ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`${bgCard} w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 border ${inputBorder} max-h-[90vh]`}>
        {/* Header */}
        <div className={`p-6 border-b ${inputBorder} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
              <Monitor size={24} />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${textColor}`}>
                {initialData ? 'Configure Kiosk' : 'Register New Kiosk'}
              </h2>
              <p className={`text-xs font-bold uppercase tracking-wider ${mutedText}`}>Terminal ID: {formData.code || 'Pending'}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${mutedText}`}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs Selection */}
        <div className={`flex px-6 pt-2 bg-slate-50/50 dark:bg-slate-800/30 border-b ${inputBorder} shrink-0`}>
          {[
            { id: 'general', label: 'Settings', icon: Settings },
            { id: 'clinical', label: 'Clinical', icon: Users },
            { id: 'playlist', label: 'Playlist', icon: PlayCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-black transition-all border-b-2 relative ${
                activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'playlist' && formData.ads.length > 0 && (
                <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] size-4 rounded-full flex items-center justify-center animate-bounce-subtle">
                  {formData.ads.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-sm font-black uppercase tracking-widest ${mutedText}`}>Kiosk Name</label>
                    <input
                      type="text" required placeholder="Reception Display"
                      className={`w-full px-4 py-3 rounded-2xl border ${inputBorder} ${inputBg} ${textColor} focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-sm font-black uppercase tracking-widest ${mutedText}`}>Hardware Code</label>
                    <input
                      type="text" required disabled={!!initialData} placeholder="KIOSK-001"
                      className={`w-full px-4 py-3 rounded-2xl border ${inputBorder} ${inputBg} ${textColor} transition-all font-mono font-black uppercase ${initialData ? 'opacity-50 cursor-not-allowed' : 'focus:ring-4 focus:ring-blue-500/10'}`}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={`text-sm font-black uppercase tracking-widest ${mutedText}`}>Deployment Zone</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['reception', 'waiting_area', 'doctor_room', 'general'].map((type) => (
                      <button
                        key={type} type="button"
                        onClick={() => setFormData({ ...formData, locationType: type })}
                        className={`px-4 py-3 rounded-2xl border text-[11px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-2 ${
                          formData.locationType === type
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105'
                            : `${inputBg} ${inputBorder} ${mutedText} hover:border-blue-400`
                        }`}
                      >
                        <MapPin size={18} />
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clinical' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-black uppercase tracking-widest ${mutedText}`}>Link Departments</h3>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{formData.departmentIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {loadingDepts ? (
                      <div className="col-span-2 text-center py-4 animate-pulse text-slate-400">Loading departments...</div>
                    ) : departments.map((dept: Department) => (
                      <button
                        key={dept._id} type="button"
                        onClick={() => toggleSelection('departmentIds', dept._id!)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                          formData.departmentIds.includes(dept._id!)
                          ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {dept.name}
                        {formData.departmentIds.includes(dept._id!) && <Plus size={14} className="rotate-45" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-black uppercase tracking-widest ${mutedText}`}>Link Doctors</h3>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{formData.doctorIds.length} Selected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {loadingDocs ? (
                      <div className="col-span-2 text-center py-4 animate-pulse text-slate-400">Loading doctors for selected departments...</div>
                    ) : doctors.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-slate-400 text-xs italic">
                        {formData.departmentIds.length > 0 ? 'No doctors found in these departments.' : 'Select a department first to see doctors.'}
                      </div>
                    ) : doctors.map((doc: Doctor) => (
                      <button
                        key={doc._id} type="button"
                        onClick={() => toggleSelection('doctorIds', doc._id!)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center gap-3 ${
                          formData.doctorIds.includes(doc._id!)
                          ? 'bg-purple-50 border-purple-200 text-purple-700 ring-2 ring-purple-500/20 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="size-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                           {doc.profilePic ? (
                             <img 
                               src={doc.profilePic.startsWith('http') ? doc.profilePic : `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${doc.profilePic}`} 
                               alt={doc.name}
                               className="size-full object-cover"
                             />
                           ) : (
                             <div className="size-full flex items-center justify-center bg-purple-100 text-purple-600">
                               <User size={16} />
                             </div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{doc.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
                            {(doc.departmentId as any)?.name || 'General'}
                          </p>
                        </div>
                        {formData.doctorIds.includes(doc._id!) && (
                          <div className="size-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Plus size={10} className="rotate-45" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'playlist' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Playlist Builder */}
                <section className="space-y-4">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${mutedText}`}>Live Playlist Sequence</h3>
                  <div className="space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-4 min-h-[150px]">
                    {formData.ads.length === 0 ? (
                      <div className="h-[120px] flex flex-col items-center justify-center text-slate-400 gap-2">
                        <PlayCircle size={32} strokeWidth={1.5} />
                        <p className="text-xs font-medium">Add media from the list below</p>
                      </div>
                    ) : (
                      formData.ads.map((item, index) => {
                        const ad = availableAds.find(a => a._id === item.adId);
                        return (
                          <div key={item.adId} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-sm group">
                            <span className="text-xs font-black text-slate-400 w-4">{index + 1}</span>
                            <div className="size-10 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0">
                               {ad?.fileKey && (
                                 <img src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`} className="size-full object-cover" />
                               )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black truncate">{ad?.title || 'Unknown Media'}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">{ad?.type} • {ad?.displayArea}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => moveAd(index, 'up')} disabled={index === 0} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-20"><Plus size={14} className="rotate-180" /></button>
                              <button type="button" onClick={() => moveAd(index, 'down')} disabled={index === formData.ads.length - 1} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-20"><Plus size={14} /></button>
                              <button type="button" onClick={() => removeAdFromPlaylist(item.adId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-1"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Available Ads Selection */}
                <section className="space-y-4">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${mutedText}`}>Available Advertisements</h3>
                  <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {loadingAds ? (
                      <div className="col-span-2 text-center py-4">Loading ads...</div>
                    ) : availableAds.filter((ad: Ad) => !formData.ads.some((a: any) => a.adId === ad._id)).map((ad: Ad) => (
                      <button
                        key={ad._id} type="button"
                        onClick={() => addAdToPlaylist(ad._id!)}
                        className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 rounded-2xl transition-all flex items-center gap-3 group text-left"
                      >
                         <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0">
                           {ad.fileKey && <img src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`} className="size-full object-cover group-hover:scale-110 transition-transform" />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black truncate">{ad.title}</p>
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase">{ad.displayArea}</span>
                         </div>
                         <Plus size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${inputBorder} flex gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl`}>
          <button
            type="button" onClick={onClose}
            className={`flex-1 max-w-[120px] py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Save size={18} />
            {initialData ? 'Commit Changes' : 'Initialize Terminal'}
          </button>
        </div>
      </div>
    </div>
  );
};
