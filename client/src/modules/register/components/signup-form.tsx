'use client';

import * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, User, Mail, Lock, ChevronRight } from 'lucide-react';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { registerAdmin } from '../api/auth.api';
import signupSchema from '../validation/validation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';

type FormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsPending(true);

      const res = await registerAdmin(data);
      const user = res.data;
      const token = user.token;

      // Save token in Redux & Cookies
      dispatch(
        setCredentials({
          user,
          accessToken: token,
          refreshToken: token,
        }),
      );

      // Get plan details from URL params if any
      const planParam = searchParams.get('planId');
      const cycleParam = searchParams.get('cycle');

      let onboardUrl = '/onboarding';
      const params = new URLSearchParams();
      if (planParam) params.set('planId', planParam);
      if (cycleParam) params.set('cycle', cycleParam);
      if (params.toString()) {
        onboardUrl += `?${params.toString()}`;
      }

      toast.success('Registration successful! Setting up onboarding...');
      router.push(onboardUrl);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <FieldLabel className="text-slate-700">Full Name</FieldLabel>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              {...register('name')}
              placeholder="John Doe"
              className="pl-11 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </div>
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel className="text-slate-700">Email Address</FieldLabel>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              {...register('email')}
              placeholder="admin@hospital.com"
              className="pl-11 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </div>
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel className="text-slate-700">Password</FieldLabel>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="pl-11 pr-12 h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>

        <button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Continue Setup
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
