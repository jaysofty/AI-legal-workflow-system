import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding LegalFlow AI database...");

  const passwordHash = await bcrypt.hash(
    "Password123!",
    12
  );

  // --------------------------------------------------
  // FIRM
  // --------------------------------------------------

  const firm = await prisma.firm.create({
    data: {
      name: "Adeola & Partners Legal Practitioners",
      email: "admin@adeolapartners.test",
      phone: "+2348000000000",
      address: "Victoria Island, Lagos",
      jurisdiction: "Nigeria",
    },
  });

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------

  const principal = await prisma.user.create({
    data: {
      firmId: firm.id,
      firstName: "Daniel",
      lastName: "Adeola",
      email: "principal@adeolapartners.test",
      passwordHash,
      role: "PRINCIPAL_PARTNER",
      status: "ACTIVE",
    },
  });

  const seniorAssociate = await prisma.user.create({
    data: {
      firmId: firm.id,
      firstName: "Amaka",
      lastName: "Okoro",
      email: "associate@adeolapartners.test",
      passwordHash,
      role: "SENIOR_ASSOCIATE",
      status: "ACTIVE",
    },
  });

  const clerk = await prisma.user.create({
    data: {
      firmId: firm.id,
      firstName: "Tunde",
      lastName: "Bello",
      email: "clerk@adeolapartners.test",
      passwordHash,
      role: "LITIGATION_CLERK",
      status: "ACTIVE",
    },
  });

  // --------------------------------------------------
  // CLIENTS
  // --------------------------------------------------

  const client = await prisma.client.create({
    data: {
      firmId: firm.id,
      type: "COMPANY",
      companyName: "Lagos Technology Ventures Ltd",
      email: "legal@lagostech.test",
      phone: "+2348011111111",
      address: "Yaba, Lagos",
      ownerId: principal.id,
      notes: "Technology company requiring recurring commercial legal support.",
    },
  });

  const individualClient = await prisma.client.create({
    data: {
      firmId: firm.id,
      type: "INDIVIDUAL",
      firstName: "Michael",
      lastName: "Adebayo",
      email: "michael@example.test",
      phone: "+2348022222222",
      address: "Ikeja, Lagos",
      ownerId: seniorAssociate.id,
    },
  });

  // --------------------------------------------------
  // LEAD
  // --------------------------------------------------

  await prisma.lead.create({
    data: {
      firmId: firm.id,
      name: "FinServe Africa Ltd",
      email: "contact@finserve.test",
      phone: "+2348033333333",
      enquiry:
        "We need assistance reviewing a technology services agreement and advising on regulatory obligations.",
      matterType: "TECHNOLOGY",
      status: "QUALIFIED",
      source: "Website enquiry",
    },
  });

  // --------------------------------------------------
  // MATTER
  // --------------------------------------------------

  const matter = await prisma.matter.create({
    data: {
      firmId: firm.id,
      clientId: client.id,
      referenceNumber: "APL/COM/2026/001",
      title: "Lagos Technology Ventures - SaaS Agreement",
      description:
        "Review and negotiation of a software-as-a-service agreement.",
      type: "COMMERCIAL",
      status: "ACTIVE",
      jurisdiction: "Nigeria",
      openedAt: new Date(),

      users: {
        create: [
          {
            userId: principal.id,
            role: "Supervising Partner",
          },
          {
            userId: seniorAssociate.id,
            role: "Matter Associate",
          },
          {
            userId: clerk.id,
            role: "Matter Clerk",
          },
        ],
      },

      parties: {
        create: [
          {
            name: "Lagos Technology Ventures Ltd",
            role: "CLIENT",
            clientId: client.id,
            email: "legal@lagostech.test",
          },
          {
            name: "Cloud Services Provider Ltd",
            role: "OPPOSING_PARTY",
            email: "legal@cloudprovider.test",
          },
        ],
      },
    },
  });

  // --------------------------------------------------
  // SECOND MATTER
  // --------------------------------------------------

  const litigationMatter = await prisma.matter.create({
    data: {
      firmId: firm.id,
      clientId: individualClient.id,
      referenceNumber: "APL/LIT/2026/002",
      title: "Adebayo v. Example Property Holdings",
      description:
        "Property dispute concerning alleged breach of a land transaction.",
      type: "LITIGATION",
      status: "LITIGATION",
      jurisdiction: "Nigeria",
      court: "High Court of Lagos State",
      openedAt: new Date(),

      users: {
        create: [
          {
            userId: seniorAssociate.id,
            role: "Lead Counsel",
          },
          {
            userId: clerk.id,
            role: "Litigation Clerk",
          },
        ],
      },

      parties: {
        create: [
          {
            name: "Michael Adebayo",
            role: "CLAIMANT",
            clientId: individualClient.id,
          },
          {
            name: "Example Property Holdings Ltd",
            role: "DEFENDANT",
          },
        ],
      },
    },
  });

  // --------------------------------------------------
  // TASKS
  // --------------------------------------------------

  await prisma.task.createMany({
    data: [
      {
        matterId: matter.id,
        assignedToId: seniorAssociate.id,
        title: "Review SaaS indemnity provisions",
        description:
          "Review liability, indemnity and limitation of liability clauses.",
        priority: "HIGH",
        status: "IN_PROGRESS",
      },
      {
        matterId: matter.id,
        assignedToId: clerk.id,
        title: "Organise client documents",
        description:
          "Upload and categorise the documents received from the client.",
        priority: "MEDIUM",
        status: "TODO",
      },
      {
        matterId: litigationMatter.id,
        assignedToId: clerk.id,
        title: "Check upcoming cause list",
        description:
          "Confirm the next listed date and prepare the matter file.",
        priority: "HIGH",
        status: "TODO",
      },
    ],
  });

  // --------------------------------------------------
  // DEADLINE
  // --------------------------------------------------

  await prisma.deadline.create({
    data: {
      matterId: litigationMatter.id,
      title: "Prepare hearing bundle",
      description: "Prepare documents required for the upcoming hearing.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // --------------------------------------------------
  // HEARING
  // --------------------------------------------------

  await prisma.hearing.create({
    data: {
      matterId: litigationMatter.id,
      title: "Case Management Conference",
      court: "High Court of Lagos State",
      courtroom: "Court 12",
      hearingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      purpose: "Case management and further directions.",
    },
  });

  // --------------------------------------------------
  // CONVERSATION
  // --------------------------------------------------

  const conversation = await prisma.conversation.create({
    data: {
      firmId: firm.id,
      matterId: matter.id,
      userId: seniorAssociate.id,
      type: "MATTER",
      title: "SaaS Agreement Review",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: "USER",
        content:
          "What documents do we currently have for this matter?",
      },
      {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content:
          "The matter has been opened, but no documents have been uploaded yet.",
      },
    ],
  });

  // --------------------------------------------------
  // MATTER MEMORY
  // --------------------------------------------------

  await prisma.memory.create({
    data: {
      matterId: matter.id,
      type: "MATTER_FACT",
      content:
        "Client is a Nigerian technology company reviewing a SaaS agreement with an external cloud services provider.",
      importance: 0.9,
    },
  });

  // --------------------------------------------------
  // TEMPLATE
  // --------------------------------------------------

  await prisma.documentTemplate.create({
    data: {
      firmId: firm.id,
      name: "Client Update Letter",
      type: "CORRESPONDENCE",
      description:
        "Standard template for providing clients with matter progress updates.",
      content:
        "# Client Update\n\nDear {{clientName}},\n\nWe write to provide an update regarding {{matterTitle}}.\n\n{{update}}\n\nKind regards,\n{{lawyerName}}",
    },
  });

  console.log("✅ Seed completed.");
  console.log("");
  console.log("Demo users:");
  console.log("Principal:", principal.email);
  console.log("Associate:", seniorAssociate.email);
  console.log("Clerk:", clerk.email);
  console.log("");
  console.log("Password for all users: Password123!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });