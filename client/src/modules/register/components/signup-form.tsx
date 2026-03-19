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
      phone: '',
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
          <FieldLabel>Name</FieldLabel>
          <Input placeholder="Enter name" {...register('name')} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input placeholder="Enter email" {...register('email')} />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <Input type="password" placeholder="Enter password" {...register('password')} />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </Field>
      </FieldGroup>

      {/* Hospital Section */}
      <FieldGroup>
        <Field>
          <FieldLabel>Hospital Name</FieldLabel>
          <Input placeholder="Hospital name" {...register('hospitalName')} />
          {errors.hospitalName && <FieldError>{errors.hospitalName.message}</FieldError>}
        </Field>

        <Field>
          <PhoneNumberInput
            value={watch('phone')}
            onChange={(val) => setValue('phone', val)}
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
