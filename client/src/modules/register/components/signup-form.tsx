// src/components/forms/signup-form.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PhoneNumberInput from '@/components/common/phone-input';
import signupSchema from '../validation/validation';
import { registerAdmin } from '../api/auth.api';

type FormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      hospitalName: '',
      phone: {
        full: '',
        countryCode: '',
        country: '',
        nationalNumber: '',
      },
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      await registerAdmin(data);
      alert('Account created 🚀');
      router.push('/admin');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Admin Section */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className='text-sm font-semibold text-slate-300 ml-1'>Full Name</label>
          <input 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="John Doe" 
            {...register('name')} 
          />
          {errors.name && <p className="text-xs text-red-400 mt-1 ml-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className='text-sm font-semibold text-slate-300 ml-1'>Email Address</label>
          <input 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="admin@hospital.com" 
            {...register('email')} 
          />
          {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className='text-sm font-semibold text-slate-300 ml-1'>Create Password</label>
          <input 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            type="password" 
            placeholder="••••••••" 
            {...register('password')} 
          />
          {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password.message}</p>}
        </div>
      </div>

      {/* Hospital Section */}
      <div className="grid grid-cols-1 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className='text-sm font-semibold text-slate-300 ml-1'>Hospital Name</label>
          <input 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="City Medical Center" 
            {...register('hospitalName')} 
          />
          {errors.hospitalName && <p className="text-xs text-red-400 mt-1 ml-1">{errors.hospitalName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className='text-sm font-semibold text-slate-300 ml-1'>Contact Number</label>
          <div className="[&_input]:bg-slate-800/50 [&_input]:border-slate-700 [&_input]:text-white [&_input]:rounded-2xl [&_input]:py-3.5">
            <PhoneNumberInput
              value={watch('phone.full')}
              onChange={(val) => setValue('phone', val)}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-400 mt-1 ml-1">{errors.phone.message}</p>}
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
        disabled={isPending}
      >
        {isPending ? 'Provisioning System...' : 'Create Hospital Account'}
      </button>
    </form>
  );
}
