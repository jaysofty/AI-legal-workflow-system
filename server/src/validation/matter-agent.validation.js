import { z } from "zod";

export const askMatterAgentSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Question must be at least 3 characters")
    .max(5000, "Question must not exceed 5000 characters"),
});