import { prisma } from "../../config/database.js";

function normalizeValue(value) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function splitClientName(name) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: null,
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function getClientType(client) {
  if (client.companyName) {
    return "COMPANY";
  }

  return "INDIVIDUAL";
}

async function findExistingClient(tx, { firmId, client }) {
  const email = normalizeValue(client.email);
  const phone = normalizeValue(client.phone);
  const name = normalizeValue(client.name);

  const conditions = [];

  if (email) {
    conditions.push({
      email: {
        equals: email,
        mode: "insensitive",
      },
    });
  }

  if (phone) {
    conditions.push({
      phone: {
        equals: phone,
      },
    });
  }

  if (name) {
    const { firstName, lastName } = splitClientName(client.name);

    conditions.push({
      AND: [
        {
          firstName: {
            equals: firstName,
            mode: "insensitive",
          },
        },
        lastName
          ? {
              lastName: {
                equals: lastName,
                mode: "insensitive",
              },
            }
          : {
              lastName: null,
            },
      ],
    });
  }

  if (conditions.length === 0) {
    return null;
  }

  return tx.client.findFirst({
    where: {
      firmId,
      OR: conditions,
    },
  });
}

async function createOrFindClient(tx, { firmId, client }) {
  const existingClient = await findExistingClient(tx, {
    firmId,
    client,
  });

  if (existingClient) {
    return {
      client: existingClient,
      created: false,
    };
  }

  const { firstName, lastName } = splitClientName(client.name);

  const createdClient = await tx.client.create({
    data: {
      firmId,
      type: getClientType(client),
      firstName,
      lastName,
      email: normalizeValue(client.email),
      phone: client.phone?.trim() || null,
      address: client.address?.trim() || null,
    },
  });

  return {
    client: createdClient,
    created: true,
  };
}

async function generateMatterReference(tx, firmId) {
  const year = new Date().getFullYear();

  const prefix = `LFT/${year}/`;

  const latestMatter = await tx.matter.findFirst({
    where: {
      firmId,
      referenceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      referenceNumber: "desc",
    },
    select: {
      referenceNumber: true,
    },
  });

  let nextNumber = 1;

  if (latestMatter?.referenceNumber) {
    const currentNumber = Number(
      latestMatter.referenceNumber.replace(prefix, ""),
    );

    if (Number.isInteger(currentNumber) && currentNumber >= 1) {
      nextNumber = currentNumber + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

async function createMatterRecord(
  tx,
  {
    firmId,
    user,
    input,
    client,
  },
) {
  const referenceNumber = await generateMatterReference(
    tx,
    firmId,
  );

  const matter = await tx.matter.create({
    data: {
      firmId,
      clientId: client.id,
      referenceNumber,
      title: input.matter.title,
      description: input.matter.description,
      type: input.matter.type,
      status: "INTAKE",
      jurisdiction: "Nigeria",
      court: input.matter.court,
      courtNumber: input.matter.courtNumber,
    },
  });

  await tx.matterUser.create({
    data: {
      matterId: matter.id,
      userId: user.id,
      role: user.role,
    },
  });

  return matter;
}

async function createMatterParties(
  tx,
  {
    matterId,
    opposingParties,
  },
) {
  if (!opposingParties?.length) {
    return [];
  }

  const parties = [];

  for (const party of opposingParties) {
    const createdParty = await tx.matterParty.create({
      data: {
        matterId,
        name: party.name,
        role: "OPPOSING_PARTY",
      },
    });

    parties.push(createdParty);
  }

  return parties;
}

export async function createMatterFromIntake({
  user,
  input,
}) {
  if (!user?.id || !user?.firmId) {
    throw new Error("Authenticated user context is required");
  }

  if (!input?.client?.name) {
    throw new Error("Client information is required");
  }

  if (!input?.matter?.title) {
    throw new Error("Matter information is required");
  }

  return prisma.$transaction(async (tx) => {
    const clientResult = await createOrFindClient(tx, {
      firmId: user.firmId,
      client: input.client,
    });

    const matter = await createMatterRecord(tx, {
      firmId: user.firmId,
      user,
      input,
      client: clientResult.client,
    });

    const parties = await createMatterParties(tx, {
      matterId: matter.id,
      opposingParties: input.intake?.opposingParties ?? [],
    });

    return {
      matter,
      client: clientResult.client,
      clientCreated: clientResult.created,
      parties,
    };
  });
}