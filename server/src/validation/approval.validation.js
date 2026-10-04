import { z } from "zod";

export const updateApprovalSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),

  notes: z
    .string()
    .trim()
    .max(5000, "Approval notes must not exceed 5000 characters")
    .optional(),
});