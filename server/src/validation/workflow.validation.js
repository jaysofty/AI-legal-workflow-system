import { z } from "zod";

export const conflictReviewSchema = z.object({
  decision: z.enum(["CONTINUE", "CANCEL"]),

  notes: z
    .string()
    .trim()
    .max(2000, "Review notes must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),
});