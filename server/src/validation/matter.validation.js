import { z } from "zod";

const matterTypes = [
  "LITIGATION",
  "CORPORATE",
  "COMMERCIAL",
  "EMPLOYMENT",
  "REAL_ESTATE",
  "REGULATORY",
  "TAX",
  "INTELLECTUAL_PROPERTY",
  "TECHNOLOGY",
  "ADR",
  "CRIMINAL",
  "FAMILY",
  "OTHER",
];

const matterStatuses = [
  "LEAD",
  "INTAKE",
  "CONFLICT_CHECK",
  "PENDING_RETENTION",
  "ACTIVE",
  "LITIGATION",
  "TRANSACTION",
  "JUDGMENT",
  "ENFORCEMENT",
  "COMPLETED",
  "CLOSED",
  "ARCHIVED",
];

export const createMatterSchema = z.object({
  clientId: z
    .string()
    .min(1, "Client ID is required"),

  referenceNumber: z
    .string()
    .min(2, "Reference number is required")
    .max(100),

  title: z
    .string()
    .min(3, "Matter title must be at least 3 characters")
    .max(300),

  description: z
    .string()
    .max(10000)
    .optional(),

  type: z.enum(matterTypes),

  status: z
    .enum(matterStatuses)
    .default("INTAKE"),

  jurisdiction: z
    .string()
    .min(2)
    .max(100)
    .default("Nigeria"),

  court: z
    .string()
    .max(300)
    .optional(),

  courtNumber: z
    .string()
    .max(100)
    .optional(),

  limitationDate: z
    .coerce
    .date()
    .optional(),

  openedAt: z
    .coerce
    .date()
    .optional(),
});

export const updateMatterSchema = z.object({
  clientId: z
    .string()
    .min(1)
    .optional(),

  referenceNumber: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  title: z
    .string()
    .min(3)
    .max(300)
    .optional(),

  description: z
    .string()
    .max(10000)
    .optional(),

  type: z
    .enum(matterTypes)
    .optional(),

  status: z
    .enum(matterStatuses)
    .optional(),

  jurisdiction: z
    .string()
    .min(2)
    .max(100)
    .optional(),

  court: z
    .string()
    .max(300)
    .optional(),

  courtNumber: z
    .string()
    .max(100)
    .optional(),

  limitationDate: z
    .coerce
    .date()
    .optional(),

  openedAt: z
    .coerce
    .date()
    .optional(),

  closedAt: z
    .coerce
    .date()
    .optional(),
});

