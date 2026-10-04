import { z } from "zod";

const documentTypes = [
  "PLEADING",
  "MOTION",
  "AFFIDAVIT",
  "WRITTEN_ADDRESS",
  "WITNESS_STATEMENT",
  "CONTRACT",
  "AGREEMENT",
  "COURT_ORDER",
  "JUDGMENT",
  "CTC",
  "CERTIFICATE",
  "REGULATORY",
  "IDENTIFICATION",
  "CORRESPONDENCE",
  "LEGAL_RESEARCH",
  "INTERNAL_MEMO",
  "TEMPLATE",
  "OTHER",
];

const documentStatuses = [
  "UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
  "ARCHIVED",
];

export const createDocumentSchema = z.object({
  matterId: z.string().min(1).optional(),

  name: z
    .string()
    .min(2, "Document name must be at least 2 characters")
    .max(300),

  type: z.enum(documentTypes),

  status: z.enum(documentStatuses).default("UPLOADED"),

  fileUrl: z
    .string()
    .url("File URL must be a valid URL")
    .optional(),

  mimeType: z
    .string()
    .max(150)
    .optional(),

  fileSize: z
    .number()
    .int()
    .positive()
    .optional(),

  extractedText: z
    .string()
    .max(5_000_000)
    .optional(),
});

export const updateDocumentSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(300)
    .optional(),

  type: z
    .enum(documentTypes)
    .optional(),

  status: z
    .enum(documentStatuses)
    .optional(),

  fileUrl: z
    .string()
    .url("File URL must be a valid URL")
    .optional(),

  mimeType: z
    .string()
    .max(150)
    .optional(),

  fileSize: z
    .number()
    .int()
    .positive()
    .optional(),

  extractedText: z
    .string()
    .max(5_000_000)
    .optional(),
});

export const uploadedDocumentMetadataSchema = z.object({
  matterId: z.string().min(1, "Matter ID is required"),

  name: z
    .string()
    .min(2, "Document name must be at least 2 characters")
    .max(300),

  type: z.enum(documentTypes),
});