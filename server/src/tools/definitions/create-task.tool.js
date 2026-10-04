import { z } from "zod";
import { prisma } from "../../config/database.js";

export const createTaskTool = {
  name: "createTask",

  description:
    "Create a task for a matter belonging to the authenticated user's firm.",

  inputSchema: z.object({
    matterId: z.string().min(1, "Matter ID is required"),

    title: z
      .string()
      .trim()
      .min(3, "Task title must be at least 3 characters")
      .max(200, "Task title must not exceed 200 characters"),

    description: z
      .string()
      .trim()
      .max(5000, "Task description must not exceed 5000 characters")
      .optional(),

    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .default("MEDIUM"),

    dueDate: z.coerce.date().optional(),

    assignedToId: z
      .string()
      .min(1, "Assigned user ID must not be empty")
      .optional(),
  }),

  async execute({
    matterId,
    title,
    description,
    priority,
    dueDate,
    assignedToId,
    user,
  }) {
    if (!user?.id || !user?.firmId) {
      const error = new Error(
        "Authenticated user context is required",
      );

      error.statusCode = 401;

      throw error;
    }

    const matter = await prisma.matter.findFirst({
      where: {
        id: matterId,
        firmId: user.firmId,
      },

      select: {
        id: true,
      },
    });

    if (!matter) {
      const error = new Error(
        "Matter not found or does not belong to this firm",
      );

      error.statusCode = 404;

      throw error;
    }

    if (assignedToId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          firmId: user.firmId,
        },

        select: {
          id: true,
        },
      });

      if (!assignee) {
        const error = new Error(
          "Assigned user not found or does not belong to this firm",
        );

        error.statusCode = 404;

        throw error;
      }
    }

    const task = await prisma.task.create({
      data: {
        matterId,
        title,
        description,
        priority,
        dueDate,
        assignedToId,
      },

      select: {
        id: true,
        matterId: true,
        assignedToId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return task;
  },
};