import { prisma } from "../config/database.js";

export async function createClient(firmId, userId, data) {
  let ownerId = data.ownerId || userId;

  // If an ownerId was supplied, make sure that user
  // belongs to the same firm.
  if (ownerId) {
    const owner = await prisma.user.findFirst({
      where: {
        id: ownerId,
        firmId,
      },
      select: {
        id: true,
      },
    });

    if (!owner) {
      throw new Error("Client owner does not belong to this firm");
    }
  }

  return prisma.client.create({
    data: {
      firmId,
      type: data.type,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      notes: data.notes,
      ownerId,
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function getClients(firmId) {
  return prisma.client.findMany({
    where: {
      firmId,
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          matters: true,
          leads: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getClientById(firmId, clientId) {
  return prisma.client.findFirst({
    where: {
      id: clientId,
      firmId,
    },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      matters: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          type: true,
          status: true,
          jurisdiction: true,
          createdAt: true,
        },
      },
      leads: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          matters: true,
          leads: true,
          conversations: true,
        },
      },
    },
  });
}

export async function updateClient(firmId, clientId, data) {
  const existingClient = await prisma.client.findFirst({
    where: {
      id: clientId,
      firmId,
    },
  });

  if (!existingClient) {
    throw new Error("Client not found");
  }

  if (data.ownerId) {
    const owner = await prisma.user.findFirst({
      where: {
        id: data.ownerId,
        firmId,
      },
      select: {
        id: true,
      },
    });

    if (!owner) {
      throw new Error("Client owner does not belong to this firm");
    }
  }

  return prisma.client.update({
    where: {
      id: clientId,
    },
    data,
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
}