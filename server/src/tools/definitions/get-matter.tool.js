import { z } from "zod";
import { prisma } from "../../config/database.js";

export const getMatterTool = {
  name: "getMatter",

  description:
    "Retrieve a matter belonging to the authenticated user's firm.",

  inputSchema: z.object({
    matterId: z.string().min(1, "Matter ID is required"),
  }),

  async execute({ matterId, user }) {
    if (!user?.id || !user?.firmId) {
      const error = new Error("Authenticated user context is required");
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
        referenceNumber: true,
        title: true,
        description: true,
        type: true,
        status: true,
        jurisdiction: true,
        court: true,
        courtNumber: true,
        limitationDate: true,
        openedAt: true,
        closedAt: true,
        client: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });

    if (!matter) {
      const error = new Error(
        "Matter not found or does not belong to this firm",
      );

      error.statusCode = 404;
      throw error;
    }

    return matter;
  },
};