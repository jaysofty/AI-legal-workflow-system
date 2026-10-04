import { z } from "zod";

export const matterIntakeSchema = z.object({
  client: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Client name must be at least 2 characters")
      .max(200, "Client name must not exceed 200 characters"),

    email: z
      .string()
      .trim()
      .email("Client email must be valid")
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .trim()
      .max(50, "Client phone must not exceed 50 characters")
      .optional()
      .or(z.literal("")),

    address: z
      .string()
      .trim()
      .max(500, "Client address must not exceed 500 characters")
      .optional()
      .or(z.literal("")),
  }),

  matter: z.object({
    title: z
      .string()
      .trim()
      .min(3, "Matter title must be at least 3 characters")
      .max(300, "Matter title must not exceed 300 characters"),

    type: z
      .string()
      .trim()
      .min(1, "Matter type is required")
      .max(100, "Matter type must not exceed 100 characters"),

    description: z
      .string()
      .trim()
      .max(5000, "Matter description must not exceed 5000 characters")
      .optional()
      .or(z.literal("")),

    court: z
      .string()
      .trim()
      .max(300, "Court must not exceed 300 characters")
      .optional()
      .or(z.literal("")),

    courtNumber: z
      .string()
      .trim()
      .max(200, "Court number must not exceed 200 characters")
      .optional()
      .or(z.literal("")),
  }),

  intake: z.object({
    source: z
      .string()
      .trim()
      .max(100, "Intake source must not exceed 100 characters")
      .optional()
      .or(z.literal("")),

    summary: z
      .string()
      .trim()
      .min(10, "Intake summary must be at least 10 characters")
      .max(10000, "Intake summary must not exceed 10000 characters"),

    opposingParties: z
      .array(
        z.object({
          name: z
            .string()
            .trim()
            .min(2, "Opposing party name is required")
            .max(200),
        }),
      )
      .default([]),

    requestedServices: z
      .array(
        z
          .string()
          .trim()
          .min(2)
          .max(300),
      )
      .default([]),
  }),
});