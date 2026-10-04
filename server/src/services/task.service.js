import { prisma } from "../config/database.js";

async function validateMatter(firmId, matterId) {
  if (!matterId) {
    return;
  }

  const matter = await prisma.matter.findFirst({
    where: {
      id: matterId,
      firmId,
    },
    select: {
      id: true,
    },
  });

  if (!matter) {
    throw new Error("Matter not found or does not belong to this firm");
  }
}

async function validateAssignedUser(firmId, assignedToId) {
  if (!assignedToId) {
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: assignedToId,
      firmId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("Assigned user not found or does not belong to this firm");
  }
}

export async function createTask(firmId, data) {
  await validateMatter(firmId, data.matterId);
  await validateAssignedUser(firmId, data.assignedToId);

  const task = await prisma.task.create({
    data: {
      firmId,

      matterId: data.matterId,

      assignedToId: data.assignedToId,

      title: data.title,

      description: data.description,

      status: data.status || "TODO",

      priority: data.priority || "MEDIUM",

      dueDate: data.dueDate,

      completedAt:
        data.status === "COMPLETED"
          ? new Date()
          : null,
    },

    include: {
      matter: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          status: true,
        },
      },

      assignedTo: {
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

  return task;
}

export async function getTasks(firmId, filters = {}) {
  const where = {
    firmId,
  };

  if (filters.matterId) {
    where.matterId = filters.matterId;
  }

  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  return prisma.task.findMany({
    where,

    include: {
      matter: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          status: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },

    orderBy: [
      {
        dueDate: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
}

export async function getTaskById(firmId, taskId) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      firmId,
    },

    include: {
      matter: {
        include: {
          client: true,
        },
      },

      assignedTo: {
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

export async function updateTask(firmId, taskId, data) {
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      firmId,
    },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  if (data.matterId !== undefined) {
    await validateMatter(firmId, data.matterId);
  }

  if (data.assignedToId !== undefined) {
    await validateAssignedUser(firmId, data.assignedToId);
  }

  const updateData = {
    ...data,
  };

  if (data.status === "COMPLETED") {
    updateData.completedAt = existingTask.completedAt || new Date();
  }

  if (
    data.status &&
    data.status !== "COMPLETED"
  ) {
    updateData.completedAt = null;
  }

  return prisma.task.update({
    where: {
      id: taskId,
    },

    data: updateData,

    include: {
      matter: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          status: true,
        },
      },

      assignedTo: {
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

export async function deleteTask(firmId, taskId) {
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      firmId,
    },
    select: {
      id: true,
    },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
}