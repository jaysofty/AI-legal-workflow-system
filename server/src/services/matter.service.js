import { prisma } from "../config/database.js";

export async function createMatter(firmId, userId, data) {
  const client = await prisma.client.findFirst({
    where: {
      id: data.clientId,
      firmId,
    },
    select: {
      id: true,
      type: true,
      firstName: true,
      lastName: true,
      companyName: true,
    },
  });

  if (!client) {
    throw new Error("Client not found or does not belong to this firm");
  }

  const existingMatter = await prisma.matter.findFirst({
    where: {
      firmId,
      referenceNumber: data.referenceNumber,
    },
  });

  if (existingMatter) {
    throw new Error("A matter with this reference number already exists");
  }

  const matter = await prisma.$transaction(async (tx) => {
    const createdMatter = await tx.matter.create({
      data: {
        firmId,
        clientId: data.clientId,

        referenceNumber: data.referenceNumber,

        title: data.title,

        description: data.description,

        type: data.type,

        status: data.status || "INTAKE",

        jurisdiction: data.jurisdiction || "Nigeria",

        court: data.court,

        courtNumber: data.courtNumber,

        limitationDate: data.limitationDate,

        openedAt: data.openedAt,
      },
    });

    await tx.matterUser.create({
      data: {
        matterId: createdMatter.id,
        userId,
      },
    });

    return createdMatter;
  });

  return getMatterById(firmId, matter.id);
}

export async function getMatters(firmId) {
  return prisma.matter.findMany({
    where: {
      firmId,
    },

    include: {
      client: {
        select: {
          id: true,
          type: true,
          firstName: true,
          lastName: true,
          companyName: true,
          email: true,
          phone: true,
        },
      },

      users: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },

      _count: {
        select: {
          documents: true,
          tasks: true,
          deadlines: true,
          hearings: true,
          conversations: true,
          escalations: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMatterById(firmId, matterId) {
  return prisma.matter.findFirst({
    where: {
      id: matterId,
      firmId,
    },

    include: {
      client: true,

      users: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },

      parties: true,

      documents: {
        orderBy: {
          createdAt: "desc",
        },
      },

      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },

      deadlines: {
        orderBy: {
          dueDate: "asc",
        },
      },

      hearings: {
        orderBy: { hearingDate: "asc" },
      },

      conversations: {
        orderBy: {
          createdAt: "desc",
        },
      },

      _count: {
        select: {
          documents: true,
          tasks: true,
          deadlines: true,
          hearings: true,
          conversations: true,
          memories: true,
          aiExecutions: true,
          escalations: true,
        },
      },
    },
  });
}

export async function updateMatter(firmId, matterId, data) {
  const existingMatter = await prisma.matter.findFirst({
    where: {
      id: matterId,
      firmId,
    },
  });

  if (!existingMatter) {
    throw new Error("Matter not found");
  }

  if (data.clientId) {
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        firmId,
      },
      select: {
        id: true,
      },
    });

    if (!client) {
      throw new Error("Client not found or does not belong to this firm");
    }
  }

  if (
    data.referenceNumber &&
    data.referenceNumber !== existingMatter.referenceNumber
  ) {
    const duplicate = await prisma.matter.findFirst({
      where: {
        firmId,
        referenceNumber: data.referenceNumber,
        id: {
          not: matterId,
        },
      },
    });

    if (duplicate) {
      throw new Error("A matter with this reference number already exists");
    }
  }

  return prisma.matter.update({
    where: {
      id: matterId,
    },

    data,

    include: {
      client: true,

      users: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });
}
