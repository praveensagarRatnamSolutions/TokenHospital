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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Admin Section */}
      <FieldGroup>
        <Field>
          <FieldLabel className='text-sm font-medium text-gray-700'>Name</FieldLabel>
          <Input   className="border border-[#d1d5db]" placeholder="Enter name" {...register('name')} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel className='text-sm font-medium text-gray-700'>Email</FieldLabel>
          <Input className="border border-[#d1d5db]"  placeholder="Enter email" {...register('email')} />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel className='text-sm font-medium text-gray-700'>Password</FieldLabel>
          <Input className="border border-[#d1d5db]"  type="password" placeholder="Enter password" {...register('password')} />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>
      </FieldGroup>

      {/* Hospital Section */}
      <FieldGroup>
        <Field>
          <FieldLabel className='text-sm font-medium text-gray-700'>Hospital Name</FieldLabel>
          <Input className="border border-[#d1d5db]"  placeholder="Hospital name" {...register('hospitalName')} />
          {errors.hospitalName && <FieldError>{errors.hospitalName.message}</FieldError>}
        </Field>

        <Field>
          <PhoneNumberInput
            value={watch('phone.full')} // ✅ string for UI
            onChange={(val) => setValue('phone', val)} // ✅ full object
          />
          {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Account'}
      </Button>
    </form>
  );
}
