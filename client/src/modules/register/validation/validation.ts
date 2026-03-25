import { z } from "zod";

const phoneSchema = z.object({
  full: z.string().min(10, "Phone number is required"),
  countryCode: z.string().min(1, "Country code is required"),
  country: z.string().min(2, "Country is required"),
  nationalNumber: z.string().min(5, "Invalid phone number"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6),
  hospitalName: z.string().min(2),
  phone: phoneSchema,
});

export default signupSchema;