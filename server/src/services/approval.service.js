import { prisma } from "../config/database.js";

const APPROVER_ROLES = [
  "SUPER_ADMIN",
  "FIRM_ADMIN",
  "PRINCIPAL_PARTNER",
  "SENIOR_ASSOCIATE",
  "CORPORATE_ASSOCIATE",
  "IN_HOUSE_COUNSEL",
];

export async function updateApproval({
  approvalId,
  userId,
  firmId,
  status,
  notes,
}) {
  // ---------------------------------------------------------
  // 1. Verify approver role
  // ---------------------------------------------------------

  const approver = await prisma.user.findFirst({
    where: {
      id: userId,
      firmId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!approver) {
    const error = new Error("User not found or does not belong to this firm");

    error.statusCode = 403;

    throw error;
  }

  if (!APPROVER_ROLES.includes(approver.role)) {
    const error = new Error(
      "Your role is not authorized to approve legal documents",
    );

    error.statusCode = 403;

    throw error;
  }

  // ---------------------------------------------------------
  // 2. Retrieve approval and its generated document
  // ---------------------------------------------------------

  const approval = await prisma.approval.findUnique({
    where: {
      id: approvalId,
    },

    select: {
      id: true,
      userId: true,
      resourceType: true,
      resourceId: true,
      status: true,
      notes: true,

      createdAt: true,
      updatedAt: true,
    },
  });

  if (!approval) {
    const error = new Error("Approval request not found");

    error.statusCode = 404;

    throw error;
  }

  // ---------------------------------------------------------
  // 3. Verify approval resource type
  // ---------------------------------------------------------

  if (approval.resourceType !== "GeneratedDocument") {
    const error = new Error(
      "This approval request is not associated with a generated document",
    );

    error.statusCode = 400;

    throw error;
  }

  // ---------------------------------------------------------
  // 4. Retrieve generated document and verify firm ownership
  // ---------------------------------------------------------

  const generatedDocument =
    await prisma.generatedDocument.findUnique({
      where: {
        id: approval.resourceId,
      },

      select: {
        id: true,
        matterId: true,
        name: true,
        content: true,
        approved: true,

        matter: {
          select: {
            id: true,
            firmId: true,
            referenceNumber: true,
            title: true,
          },
        },
      },
    });

  if (!generatedDocument) {
    const error = new Error(
      "Generated document associated with this approval was not found",
    );

    error.statusCode = 404;

    throw error;
  }

  if (generatedDocument.matter.firmId !== firmId) {
    const error = new Error(
      "You are not authorized to approve a document belonging to another firm",
    );

    error.statusCode = 403;

    throw error;
  }

  // ---------------------------------------------------------
  // 5. Approval must still be pending
  // ---------------------------------------------------------

  if (approval.status !== "PENDING") {
    const error = new Error(
      `This approval request has already been ${approval.status.toLowerCase()}`,
    );

    error.statusCode = 409;

    throw error;
  }

  // ---------------------------------------------------------
  // 6. Prevent approving an already-approved document
  // ---------------------------------------------------------

  if (status === "APPROVED" && generatedDocument.approved) {
    const error = new Error(
      "This generated document has already been approved",
    );

    error.statusCode = 409;

    throw error;
  }

  // ---------------------------------------------------------
  // 7. Update approval and document atomically
  // ---------------------------------------------------------

  const result = await prisma.$transaction(async (tx) => {
    const updatedApproval = await tx.approval.update({
      where: {
        id: approvalId,
      },

      data: {
        status,
        notes,
      },

      select: {
        id: true,
        userId: true,
        resourceType: true,
        resourceId: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const updatedDocument =
      await tx.generatedDocument.update({
        where: {
          id: generatedDocument.id,
        },

        data: {
          approved: status === "APPROVED",
        },

        select: {
          id: true,
          matterId: true,
          name: true,
          approved: true,
          updatedAt: true,
        },
      });

    return {
      approval: updatedApproval,
      generatedDocument: updatedDocument,
    };
  });

  return {
    ...result,
    approver: {
      id: approver.id,
      name: `${approver.firstName} ${approver.lastName}`,
      role: approver.role,
    },
    matter: generatedDocument.matter,
  };
}