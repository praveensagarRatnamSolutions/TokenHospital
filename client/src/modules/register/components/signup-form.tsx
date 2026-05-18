'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';

import { Input } from '@/components/ui/input';
import PhoneNumberInput from '@/components/common/phone-input';

import signupSchema from '../validation/validation';
import { registerAdmin } from '../api/auth.api';

type FormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();

  const [isPending, setIsPending] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="space-y-1">
        {/* Name */}
        <Field>
          <FieldLabel className="mb-1 block text-sm font-semibold text-slate-700">
            Full Name
          </FieldLabel>

          <Input
            placeholder="Enter your name"
            {...register('name')}
            className="h-14 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        {/* Email */}
        <Field>
          <FieldLabel className="mb-1 block text-sm font-semibold text-slate-700">
            Email Address
          </FieldLabel>

          <Input
            placeholder="admin@hospital.com"
            {...register('email')}
            className="h-14 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        {/* Password */}
        <Field>
          <FieldLabel className="mb-1 block text-sm font-semibold text-slate-700">
            Password
          </FieldLabel>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              {...register('password')}
              className="h-14 rounded-2xl border border-slate-300 bg-slate-50 px-4 pr-12 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>

        {/* Hospital Name */}
        <Field>
          <FieldLabel className="mb-1 block text-sm font-semibold text-slate-700">
            Hospital Name
          </FieldLabel>

          <Input
            placeholder="Apollo Hospital"
            {...register('hospitalName')}
            className="h-14 rounded-2xl border border-slate-300 bg-slate-50 px-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />

          {errors.hospitalName && <FieldError>{errors.hospitalName.message}</FieldError>}
        </Field>

        {/* Phone */}
        <Field>
          <FieldLabel className="mb-1 block text-sm font-semibold text-slate-700">
            Phone Number
          </FieldLabel>

          <PhoneNumberInput
            value={watch('phone.full')}
            onChange={(val) => setValue('phone', val)}
            showLabel={false}
          />

          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </Field>
      </FieldGroup>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-5 w-5 animate-spin" />}

        {isPending ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}
