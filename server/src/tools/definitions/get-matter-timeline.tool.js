import { z } from "zod";
import { prisma } from "../../config/database.js";

export const getMatterTimelineTool = {
  name: "getMatterTimeline",

  description:
    "Retrieve the timeline of tasks, deadlines, and hearings associated with a specific matter.",

  inputSchema: z.object({
    matterId: z.string().min(1, "Matter ID is required"),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20),
  }),

  async execute({ matterId, limit, user }) {
    if (!user?.id || !user?.firmId) {
      const error = new Error(
        "Authenticated user context is required",
      );

      error.statusCode = 401;

      throw error;
    }

    // First verify that the matter belongs to the user's firm.
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

    const [tasks, deadlines, hearings] = await Promise.all([
      prisma.task.findMany({
        where: {
          matterId,
        },

        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
        },

        orderBy: [
          {
            dueDate: "asc",
          },
          {
            createdAt: "asc",
          },
        ],

        take: limit,
      }),

      prisma.deadline.findMany({
        where: {
          matterId,
        },

        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          completed: true,
          createdAt: true,
          updatedAt: true,
        },

        orderBy: {
          dueDate: "asc",
        },

        take: limit,
      }),

      prisma.hearing.findMany({
        where: {
          matterId,
        },

        select: {
          id: true,
          title: true,
          hearingDate: true,
          courtroom: true,
          purpose: true,
          outcome: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },

        orderBy: {
          hearingDate: "asc",
        },

        take: limit,
      }),
    ]);

    return {
      matterId,
      tasks,
      deadlines,
      hearings,
    };
  },
};