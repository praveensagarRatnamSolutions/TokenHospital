import { z } from 'zod';

export const patientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Full name must contain only letters and spaces'),

  age: z
    .string()
    .trim()
    .min(1, 'Age is required')
    .regex(/^[1-9]\d*$/, 'Age must be a valid number')
    .refine((value) => {
      const age = Number(value);
      return age <= 120;
    }, 'Age must be less than or equal to 120')
    .transform((value) => Number(value)),

  weight: z
    .string()
    .trim()
    .min(1, 'Weight is required')
    .regex(/^\d+(\.\d+)?$/, 'Weight must be a valid number')
    .refine((value) => {
      const weight = Number(value);
      return weight > 0 && weight <= 300;
    }, 'Weight must be between 1 and 300')
    .transform((value) => Number(value)),

  phone: z
    .string()
    .trim()
    .min(10, 'Phone is required')
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter valid phone number'),
});

export type TypeCheckInDetailsFormInput = z.input<typeof patientSchema>;
export type TypeCheckInDetailsFormOutput = z.infer<typeof patientSchema>;
