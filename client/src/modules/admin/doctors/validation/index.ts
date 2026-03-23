import { z } from 'zod';

export const doctorSchema = z.object({
  name: z.string().min(1, 'Doctor name is required'),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  departmentId: z.string().min(1, 'Department is required'),

  experience: z.number().min(0, 'Experience must be 0 or more'),
  consultationFee: z.number().min(0, 'Consultation fee must be 0 or more'),
  isAvailable: z.boolean().default(true),

  availability: z.array(z.object({
    day: z.string(),
    from: z.string(),
    to: z.string(),
  })),
  tokenConfig: z.object({
    maxPerDay: z.number().min(1, 'Max tokens must be at least 1'),
    avgTimePerPatient: z.number().min(1, 'Avg time must be at least 1'),
  }),
  breaks: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional(),
  })),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;
