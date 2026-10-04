import { z } from "zod";

export const registerSchema = z.object({
  firmName: z
    .string()
    .min(2, "Firm name must be at least 2 characters")
    .max(150),

  firstName: z
    .string()
    .min(2)
    .max(50),

  lastName: z
    .string()
    .min(2)
    .max(50),

  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),

  password: z
    .string()
    .min(1, "Password is required"),
});