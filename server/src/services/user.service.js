import { prisma } from "../config/database.js";

export async function getFirmUsers(firmId) {
  return prisma.user.findMany({
    where: {
      firmId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
    },
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],
  });
}