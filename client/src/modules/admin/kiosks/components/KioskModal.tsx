'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Monitor,
  MapPin,
  Users,
  User,
  PlayCircle,
  Plus,
  Trash2,
  Settings,
  Play,
  ImageIcon,
} from 'lucide-react';
import { Kiosk, KioskAd } from '../../../kiosk/types';
import { useDepartments } from '../../departments/hooks';
import { useDoctors } from '../../doctors/hooks';
import { useAds } from '../../ads/hooks';
import { useAppSelector } from '@/store/hooks';
import { Ad } from '../../ads/types';
import { Department } from '../../departments/types';
import { Doctor } from '../../doctors/types';

interface KioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Kiosk | null;
  hospitalId: string;
}

type TabType = 'general' | 'clinical' | 'playlist';

export const KioskModal: React.FC<KioskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  hospitalId,
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

  const doctorFilters = useMemo(
    () => ({
      departmentId:
        formData.departmentIds.length > 0 ? formData.departmentIds : undefined,
    }),
    [formData.departmentIds],
  );

  const { doctors, loading: loadingDocs } = useDoctors(doctorFilters);
  const { ads: availableAds, loading: loadingAds } = useAds({
    isActive: true,
    limit: 100,
  });

  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        locationType: initialData.locationType,
        departmentIds: initialData.departmentIds.map((d: any) =>
          typeof d === 'string' ? d : d._id,
        ),
        doctorIds: initialData.doctorIds.map((d: any) =>
          typeof d === 'string' ? d : d._id,
        ),
        ads: initialData.ads.map((a) => ({
          adId: typeof a.adId === 'string' ? a.adId : a.adId._id,
          order: a.order,
        })),
      });
    } else {
      const defaultDoctorId = user?.role === 'DOCTOR' ? (user?.doctorId?._id || user?.doctorId) : null;
      const defaultDepartmentId = user?.role === 'DOCTOR' ? (user?.doctorId?.departmentId?._id || user?.doctorId?.departmentId) : null;

      setFormData({
        name: '',
        code: '',
        locationType: 'general',
        departmentIds: defaultDepartmentId ? [defaultDepartmentId] : [],
        doctorIds: defaultDoctorId ? [defaultDoctorId] : [],
        ads: [],
      });
    }
  }, [initialData, isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, hospitalId });
  };

  const toggleSelection = (field: 'departmentIds' | 'doctorIds', id: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((i) => i !== id)
        : [...prev[field], id],
    }));
  };

  const addAdToPlaylist = (adId: string) => {
    if (formData.ads.some((a) => a.adId === adId)) return;
    setFormData((prev) => ({
      ...prev,
      ads: [...prev.ads, { adId, order: prev.ads.length }],
    }));
  };

  const removeAdFromPlaylist = (adId: string) => {
    setFormData((prev) => ({
      ...prev,
      ads: prev.ads.filter((a) => a.adId !== adId).map((a, i) => ({ ...a, order: i })),
    }));
  };

  const moveAd = (index: number, direction: 'up' | 'down') => {
    const newAds = [...formData.ads];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAds.length) return;
    [newAds[index], newAds[targetIndex]] = [newAds[targetIndex], newAds[index]];
    setFormData((prev) => ({ ...prev, ads: newAds.map((a, i) => ({ ...a, order: i })) }));
  };

  const tabs = [
    { id: 'general', label: 'Settings', icon: Settings },
    ...(user?.role !== 'DOCTOR' ? [{ id: 'clinical', label: 'Clinical', icon: Users }] : []),
    { id: 'playlist', label: 'Playlist', icon: PlayCircle },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 border border-slate-200 dark:border-slate-800 max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                {initialData ? 'Configure Kiosk' : 'Register New Kiosk'}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Terminal ID: {formData.code || 'Pending'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-black transition-all border-b-2 relative ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'playlist' && formData.ads.length > 0 && (
                <span className="absolute top-2 right-1 bg-primary text-white text-[9px] size-4 rounded-full flex items-center justify-center">
                  {formData.ads.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <form onSubmit={handleSubmit}>
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Kiosk Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Reception Display"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Hardware Code
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!initialData}
                      placeholder="KIOSK-001"
                      className={`w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 transition-all font-mono font-black uppercase ${
                        initialData
                          ? 'opacity-50 cursor-not-allowed'
                          : 'focus:ring-4 focus:ring-primary/10 outline-none'
                      }`}
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Deployment Zone
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['reception', 'waiting_area', 'doctor_room', 'general'].map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, locationType: type })}
                          className={`px-3 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-2 ${
                            formData.locationType === type
                              ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary/40'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                          {type.replace('_', ' ')}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Clinical Tab */}
            {activeTab === 'clinical' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Link Departments
                    </h3>
                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      {formData.departmentIds.length} Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {loadingDepts ? (
                      <div className="col-span-2 text-center py-4 animate-pulse text-slate-400">
                        Loading departments...
                      </div>
                    ) : (
                      departments.map((dept: Department) => (
                        <button
                          key={dept._id}
                          type="button"
                          onClick={() => toggleSelection('departmentIds', dept._id!)}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                            formData.departmentIds.includes(dept._id!)
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-900'
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {dept.name}
                          {formData.departmentIds.includes(dept._id!) && (
                            <Plus className="w-3.5 h-3.5 rotate-45" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Link Doctors
                    </h3>
                    <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                      {formData.doctorIds.length} Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {loadingDocs ? (
                      <div className="col-span-2 text-center py-4 animate-pulse text-slate-400">
                        Loading doctors...
                      </div>
                    ) : doctors.length === 0 ? (
                      <div className="col-span-2 text-center py-4 text-slate-400 dark:text-slate-500 text-xs italic">
                        {formData.departmentIds.length > 0
                          ? 'No doctors found in these departments.'
                          : 'Select a department first.'}
                      </div>
                    ) : (
                      doctors.map((doc: Doctor) => (
                        <button
                          key={doc._id}
                          type="button"
                          onClick={() => toggleSelection('doctorIds', doc._id!)}
                          className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center gap-3 ${
                            formData.doctorIds.includes(doc._id!)
                              ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 ring-2 ring-purple-500/20 shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="size-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-600">
                            {doc.profilePic ? (
                              <img
                                src={
                                  doc.profilePic.startsWith('http')
                                    ? doc.profilePic
                                    : `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${doc.profilePic}`
                                }
                                alt={doc.name}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-black">{doc.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
                              {(doc.departmentId as any)?.name || 'General'}
                            </p>
                          </div>
                          {formData.doctorIds.includes(doc._id!) && (
                            <div className="size-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                              <Plus className="w-2.5 h-2.5 rotate-45" />
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* Playlist Tab */}
            {activeTab === 'playlist' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Live Playlist Sequence
                  </h3>
                  <div className="space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-4 min-h-[150px]">
                    {formData.ads.length === 0 ? (
                      <div className="h-[120px] flex flex-col items-center justify-center text-slate-400 gap-2">
                        <PlayCircle className="w-8 h-8" strokeWidth={1.5} />
                        <p className="text-xs font-medium">
                          Add media from the list below
                        </p>
                      </div>
                    ) : (
                      formData.ads.map((item, index) => {
                        const ad = availableAds.find((a) => a._id === item.adId);
                        return (
                          <div
                            key={item.adId}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm group"
                          >
                            <span className="text-xs font-black text-slate-400 w-4">
                              {index + 1}
                            </span>
                            <div className="size-10 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 relative">
                              {ad?.fileKey ? (
                                ad.type === 'video' ? (
                                  <>
                                    <video
                                      src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`}
                                      className="size-full object-cover"
                                      muted
                                      playsInline
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                      <div className="w-3 h-3 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                                        <Play
                                          size={6}
                                          className="text-black fill-black"
                                        />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`}
                                    alt={ad.title}
                                    className="size-full object-cover"
                                    onError={(e) => {
                                      (e.target as any).style.display = 'none';
                                    }}
                                  />
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-3 w-3 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black truncate text-slate-900 dark:text-white">
                                {ad?.title || 'Unknown Media'}
                              </p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">
                                {ad?.type} • {ad?.displayArea}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveAd(index, 'up')}
                                disabled={index === 0}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-20 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 rotate-180" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveAd(index, 'down')}
                                disabled={index === formData.ads.length - 1}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-20 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAdFromPlaylist(item.adId)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg ml-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Available Advertisements
                  </h3>
                  <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2">
                    {loadingAds ? (
                      <div className="col-span-2 text-center py-4 text-slate-400 animate-pulse">
                        Loading ads...
                      </div>
                    ) : (
                      availableAds
                        .filter(
                          (ad: Ad) => !formData.ads.some((a: any) => a.adId === ad._id),
                        )
                        .map((ad: Ad) => (
                          <button
                            key={ad._id}
                            type="button"
                            onClick={() => addAdToPlaylist(ad._id!)}
                            className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 dark:hover:bg-primary/10 border border-transparent hover:border-primary/30 rounded-2xl transition-all flex items-center gap-3 group text-left"
                          >
                            <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0 group/thumb relative">
                              {ad.fileKey ? (
                                ad.type === 'video' ? (
                                  <>
                                    <video
                                      src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`}
                                      className="size-full object-cover group-hover:scale-110 transition-transform"
                                      muted
                                      playsInline
                                      onMouseEnter={(e) =>
                                        (e.target as HTMLVideoElement).play()
                                      }
                                      onMouseLeave={(e) => {
                                        const v = e.target as HTMLVideoElement;
                                        v.pause();
                                        v.currentTime = 0;
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:opacity-0 transition-opacity pointer-events-none">
                                      <div className="w-3 h-3 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                                        <Play
                                          size={6}
                                          className="text-black fill-black"
                                        />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${ad.fileKey}`}
                                    alt={ad.title}
                                    className="size-full object-cover group-hover:scale-110 transition-transform"
                                    onError={(e) => {
                                      (e.target as any).src =
                                        'https://via.placeholder.com/40?text=No+Image';
                                    }}
                                  />
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-3 w-3 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black truncate text-slate-900 dark:text-white">
                                {ad.title}
                              </p>
                              <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                                {ad.displayArea}
                              </span>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                    )}
                  </div>
                </section>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 max-w-[120px] py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <Save className="w-4 h-4" />
            {initialData ? 'Commit Changes' : 'Initialize Terminal'}
          </button>
        </div>
      </div>
    </div>
  );
};
