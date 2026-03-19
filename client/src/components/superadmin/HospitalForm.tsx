'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Loader,
  Hospital as HospitalIcon,
  MapPin,
  ShieldCheck,
  User,
  Lock,
  RefreshCw, // Added for password generation
} from 'lucide-react';
import { Hospital, hospitalApi } from '@/services/hospitalApi';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface HospitalFormProps {
  hospital?: Hospital | null;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_STATE = {
  hospitalName: '',
  adminName: '',
  email: '',
  password: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  },
  registrationNumber: '',
  licenseNumber: '',
};

export function HospitalForm({ hospital, onClose, onSuccess }: HospitalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_STATE);

  useEffect(() => {
    if (hospital) {
      setFormData({
        ...INITIAL_STATE,
        hospitalName: hospital.name || '',
        email: hospital.email || '',
        phone: hospital.phone || '',
        address: {
          street: hospital.address?.street || '',
          city: hospital.address?.city || '',
          state: hospital.address?.state || '',
          zipCode: hospital.address?.zipCode || '',
          country: hospital.address?.country || 'India',
        },
        registrationNumber: hospital.registrationNumber || '',
        licenseNumber: hospital.licenseNumber || '',
      });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [hospital]);

  // Frontend Password Generator
  const generatePass = () => {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const pass = Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof INITIAL_STATE] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (hospital?._id) {
        await hospitalApi.updateHospital(hospital._id, formData);
      } else {
        await hospitalApi.createHospital(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {hospital ? 'Update Facility' : 'Register New Hospital'}
            </h2>
            <p className="text-sm text-slate-500">
              Facility onboarding & Admin account setup.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="hospital-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-8 overflow-y-auto"
        >
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Section: Facility & Admin */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2 dark:border-slate-800">
              <HospitalIcon className="w-4 h-4" />
              <h3>Facility & Account</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                  className="form-input-style"
                  placeholder="City General"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Admin Full Name *
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                    className="form-input-style pl-10"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Official Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input-style"
                  placeholder="admin@hospital.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Phone Number
                </label>
                <PhoneInput
                  country={'in'}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputClass="!w-full !px-4 !py-2 !border !rounded-lg !bg-slate-50 dark:!bg-slate-900 !focus:!bg-white dark:!focus:!bg-slate-800 !focus:!ring-2 !focus:!ring-primary/20 !focus:!border-primary !outline-none !transition-all"
                  containerClass="!w-full"
                  buttonClass="!border-r !rounded-l-lg !bg-slate-50 dark:!bg-slate-900"
                  dropdownClass="!bg-white dark:!bg-slate-950 !border !rounded-lg"
                />
              </div>
              {!hospital && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 flex justify-between">
                    Temp Password *
                    <button
                      type="button"
                      onClick={generatePass}
                      className="text-blue-500 hover:text-blue-600 lowercase font-normal flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> auto-generate
                    </button>
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="password"
                      // Fallback to empty string if formData.password is undefined or null
                      value={formData.password || ''}
                      onChange={handleChange}
                      required
                      className="form-input-style pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Address */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2 dark:border-slate-800">
              <MapPin className="w-4 h-4" />
              <h3>Location Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                  className="form-input-style"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                  className="form-input-style"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    State *
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    required
                    className="form-input-style"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    required
                    className="form-input-style"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Compliance */}
          <section className="space-y-4 pb-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold border-b pb-2 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4" />
              <h3>Compliance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="form-input-style"
                placeholder="Registration Number"
              />
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="form-input-style"
                placeholder="License Number"
              />
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            form="hospital-form"
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg disabled:opacity-50 font-semibold flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {hospital ? 'Save Changes' : 'Onboard Facility'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .form-input-style {
          width: 100%;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          border-width: 1px;
          background-color: white;
          border-color: #e2e8f0;
          outline: none;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        :global(.dark) .form-input-style {
          background-color: #0f172a;
          border-color: #1e293b;
          color: white;
        }
        .form-input-style:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}
