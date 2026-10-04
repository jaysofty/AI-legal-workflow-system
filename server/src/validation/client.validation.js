import { z } from "zod";

export const createClientSchema = z
  .object({
    type: z.enum([
      "INDIVIDUAL",
      "COMPANY",
      "GOVERNMENT",
      "NGO",
      "OTHER",
    ]),

    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(100)
      .optional(),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(100)
      .optional(),

    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(200)
      .optional(),

    email: z
      .string()
      .email("Invalid email address")
      .optional(),

    phone: z
      .string()
      .max(50)
      .optional(),

    address: z
      .string()
      .max(500)
      .optional(),

    notes: z
      .string()
      .max(5000)
      .optional(),

    ownerId: z
      .string()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "INDIVIDUAL") {
      if (!data.firstName) {
        ctx.addIssue({
          code: "custom",
          path: ["firstName"],
          message: "First name is required for individual clients",
        });
      }

      if (!data.lastName) {
        ctx.addIssue({
          code: "custom",
          path: ["lastName"],
          message: "Last name is required for individual clients",
        });
      }
    }

    if (
      ["COMPANY", "GOVERNMENT", "NGO"].includes(data.type) &&
      !data.companyName
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "Company name is required for organization clients",
      });
    }
  });

export const updateClientSchema = z.object({
  type: z
    .enum([
      "INDIVIDUAL",
      "COMPANY",
      "GOVERNMENT",
      "NGO",
      "OTHER",
    ])
    .optional(),

  firstName: z.string().min(2).max(100).optional(),

  lastName: z.string().min(2).max(100).optional(),

  companyName: z.string().min(2).max(200).optional(),

  email: z.string().email("Invalid email address").optional(),

  phone: z.string().max(50).optional(),

  address: z.string().max(500).optional(),

  notes: z.string().max(5000).optional(),

  ownerId: z.string().optional(),
});