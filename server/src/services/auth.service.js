import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";
import { generateAccessToken } from "../utils/jwt.js";

export async function registerFirmUser({
  firmName,
  firstName,
  lastName,
  email,
  password,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const firm = await tx.firm.create({
      data: {
        name: firmName,
        jurisdiction: "Nigeria",
      },
    });

    const user = await tx.user.create({
      data: {
        firmId: firm.id,
        firstName,
        lastName,
        email: normalizedEmail,
        passwordHash,
        role: "FIRM_ADMIN",
        status: "ACTIVE",
      },
    });

    return { firm, user };
  });

  const token = generateAccessToken(result.user);

  return {
    token,
    user: {
      id: result.user.id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      role: result.user.role,
      firmId: result.user.firmId,
    },
    firm: {
      id: result.firm.id,
      name: result.firm.name,
    },
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    include: {
      firm: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("This account is not active");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = generateAccessToken(user);

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      firmId: user.firmId,
    },
    firm: {
      id: user.firm.id,
      name: user.firm.name,
    },
  };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      firm: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
    firmId: user.firmId,
    firm: {
      id: user.firm.id,
      name: user.firm.name,
      jurisdiction: user.firm.jurisdiction,
    },
  };
}