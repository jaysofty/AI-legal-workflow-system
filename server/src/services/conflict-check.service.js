import { prisma } from "../config/database.js";

function normalizeValue(value) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildSearchTerms(input) {
  const terms = [];

  const clientName = normalizeValue(input.client.name);

  if (clientName) {
    terms.push(clientName);

    const parts = clientName.split(" ");

    if (parts.length >= 2) {
      terms.push(parts[0]);
      terms.push(parts[parts.length - 1]);
    }
  }

  for (const party of input.intake.opposingParties ?? []) {
    const name = normalizeValue(party.name);

    if (name) {
      terms.push(name);

      const parts = name.split(" ");

      if (parts.length >= 2) {
        terms.push(parts[0]);
        terms.push(parts[parts.length - 1]);
      }
    }
  }

  return [...new Set(terms)].filter(Boolean);
}

function getClientDisplayName(client) {
  if (client.companyName) {
    return client.companyName;
  }

  return [client.firstName, client.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export async function runConflictCheck({
  firmId,
  input,
}) {
  if (!firmId) {
    throw new Error("Firm ID is required");
  }

  if (!input?.client?.name) {
    throw new Error("Client information is required");
  }

  const searchTerms = buildSearchTerms(input);

  if (searchTerms.length === 0) {
    return {
      potentialMatches: [],
      searchedTerms: [],
      result: "NO_POTENTIAL_MATCH",
    };
  }

  const clients = await prisma.client.findMany({
    where: {
      firmId,
      OR: searchTerms.flatMap((term) => [
        {
          firstName: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          companyName: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: term,
            mode: "insensitive",
          },
        },
      ]),
    },
    select: {
      id: true,
      type: true,
      firstName: true,
      lastName: true,
      companyName: true,
      email: true,
      phone: true,
      address: true,
    },
  });

  const potentialMatches = clients.map((client) => ({
    recordType: "CLIENT",
    recordId: client.id,
    clientType: client.type,
    name: getClientDisplayName(client),
    email: client.email,
    phone: client.phone,
    address: client.address,
    reason: "Potential match found in firm client records",
  }));

  return {
    searchedTerms: searchTerms,
    potentialMatches,
    result:
      potentialMatches.length > 0
        ? "POTENTIAL_MATCH"
        : "NO_POTENTIAL_MATCH",
  };
}