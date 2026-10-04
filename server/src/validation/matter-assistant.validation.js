import { z } from "zod";

export const askMatterAssistantSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Question must be at least 3 characters")
    .max(5000, "Question must not exceed 5000 characters"),

  documentId: z.string().min(1).optional(),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(5),
});