// src/features/auth/validation.ts
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6),
  hospitalName: z.string().min(2),
  phone: z.string().min(5), // validated in backend
});