import { z } from "zod";

const taskStatuses = [
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
];

const taskPriorities = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const createTaskSchema = z.object({
  matterId: z
    .string()
    .min(1)
    .optional(),

  assignedToId: z
    .string()
    .min(1)
    .optional(),

  title: z
    .string()
    .min(2, "Task title must be at least 2 characters")
    .max(300),

  description: z
    .string()
    .max(10000)
    .optional(),

  status: z
    .enum(taskStatuses)
    .default("TODO"),

  priority: z
    .enum(taskPriorities)
    .default("MEDIUM"),

  dueDate: z
    .coerce
    .date()
    .optional(),
});

export const updateTaskSchema = z.object({
  matterId: z
    .string()
    .min(1)
    .nullable()
    .optional(),

  assignedToId: z
    .string()
    .min(1)
    .nullable()
    .optional(),

  title: z
    .string()
    .min(2, "Task title must be at least 2 characters")
    .max(300)
    .optional(),

  description: z
    .string()
    .max(10000)
    .nullable()
    .optional(),

  status: z
    .enum(taskStatuses)
    .optional(),

  priority: z
    .enum(taskPriorities)
    .optional(),

  dueDate: z
    .coerce
    .date()
    .nullable()
    .optional(),
});