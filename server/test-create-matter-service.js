import "dotenv/config";

import {
  createMatterFromIntake,
} from "./src/workflows/definitions/create-matter.service.js";

import { prisma } from "./src/config/database.js";

const TEST_USER = {
  id: "cmuo5i6zc00011gzz3taoptt5",
  firmId: "cmuo5i6yh00001gzzf7u1ubs9",
  role: "FIRM_ADMIN",
};

async function run() {
  console.log("\n=== CREATE MATTER SERVICE TEST ===\n");

  try {
    const result = await createMatterFromIntake({
      user: TEST_USER,

      input: {
        client: {
          name: "Ifeoma Balogun",
          email: "ifeoma.balogun@example.com",
          phone: "08099998888",
          address: "Abuja, Nigeria",
        },

        matter: {
          title: "Commercial Contract Dispute",
          type: "COMMERCIAL",
          description:
            "Client contacted the firm regarding a commercial contract dispute.",
          court: "High Court of Lagos State",
          courtNumber: "LD/7890/2026",
        },

        intake: {
          source: "Website",
          summary:
            "Client contacted the firm regarding a commercial contract dispute.",

          opposingParties: [
            {
              name: "Zainab Olorunfemi",
            },
          ],

          requestedServices: [
            "Legal representation",
            "Contract dispute review",
          ],
        },
      },
    });

    console.log("1. Client:");
    console.log({
      id: result.client.id,
      name: [
        result.client.firstName,
        result.client.lastName,
      ]
        .filter(Boolean)
        .join(" "),
      email: result.client.email,
      phone: result.client.phone,
      created: result.clientCreated,
    });

    console.log("\n2. Matter:");
    console.log({
      id: result.matter.id,
      referenceNumber: result.matter.referenceNumber,
      title: result.matter.title,
      type: result.matter.type,
      status: result.matter.status,
      clientId: result.matter.clientId,
      firmId: result.matter.firmId,
    });

    console.log("\n3. Matter parties:");
    console.table(
      result.parties.map((party) => ({
        id: party.id,
        name: party.name,
        role: party.role,
        matterId: party.matterId,
      })),
    );

    const matterUser =
      await prisma.matterUser.findUnique({
        where: {
          matterId_userId: {
            matterId: result.matter.id,
            userId: TEST_USER.id,
          },
        },
      });

    console.log("\n4. Matter user:");
    console.log({
      id: matterUser?.id,
      matterId: matterUser?.matterId,
      userId: matterUser?.userId,
      role: matterUser?.role,
    });

    const databaseMatter =
      await prisma.matter.findUnique({
        where: {
          id: result.matter.id,
        },
        include: {
          client: true,
          parties: true,
          users: true,
        },
      });

    console.log("\n5. Database verification:");

    console.log({
      matterExists: Boolean(databaseMatter),
      clientExists: Boolean(databaseMatter?.client),
      partyCount: databaseMatter?.parties.length,
      userCount: databaseMatter?.users.length,
    });

    console.log(
      "\n=== CREATE MATTER SERVICE TEST PASSED ===\n",
    );
  } catch (error) {
    console.error(
      "\n=== CREATE MATTER SERVICE TEST FAILED ===\n",
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();