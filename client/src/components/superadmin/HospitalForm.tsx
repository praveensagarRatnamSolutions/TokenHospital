'use client';

import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { Hospital, CreateHospitalDto, UpdateHospitalDto, hospitalApi } from '@/services/hospitalApi';

interface HospitalFormProps {
  hospital?: Hospital | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function HospitalForm({ hospital, onClose, onSuccess }: HospitalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateHospitalDto>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    registrationNumber: '',
    licenseNumber: '',
  });

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name,
        email: hospital.email,
        phone: hospital.phone,
        address: hospital.address,
        registrationNumber: hospital.registrationNumber || '',
        licenseNumber: hospital.licenseNumber || '',
      });
    }
  }, [hospital]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1] as keyof typeof formData.address;
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (hospital) {
        await hospitalApi.updateHospital(hospital._id, formData as UpdateHospitalDto);
      } else {
        await hospitalApi.createHospital(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white dark:bg-slate-950">
          <h2 className="text-xl font-bold">
            {hospital ? 'Edit Hospital' : 'Create Hospital'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hospital Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Hospital Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="hospital@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="REG-12345"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold">Address</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Street *</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Street Address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Zip Code *</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country *</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* License */}
          <div className="space-y-4">
            <h3 className="font-semibold">License Information</h3>
            <div>
              <label className="block text-sm font-medium mb-2">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="LIC-12345"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {hospital ? 'Update Hospital' : 'Create Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
