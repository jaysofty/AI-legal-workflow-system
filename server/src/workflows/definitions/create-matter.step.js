import {
  startStep,
  completeStep,
  failStep,
} from "../../services/workflow-step.service.js";

import { prisma } from "../../config/database.js";
import { createMatterFromIntake } from "./create-matter.service.js";

export async function executeCreateMatterStep({ workflowId, user, input }) {
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }

  if (!user?.id || !user?.firmId) {
    throw new Error("Authenticated user context is required");
  }

  if (!input) {
    throw new Error("Matter intake input is required");
  }

  let step;

  try {
    step = await startStep({
      executionId: workflowId,
      stepKey: "CREATE_MATTER",
      name: "Create Matter",
      input,
    });

    const result = await createMatterFromIntake({
      user,
      input,
    });

    await prisma.workflowExecution.update({
      where: {
        id: workflowId,
      },
      data: {
        matterId: result.matter.id,
        clientId: result.client.id,
      },
    });

    await completeStep({
      stepId: step.id,
      output: {
        matterId: result.matter.id,
        clientId: result.client.id,
        referenceNumber: result.matter.referenceNumber,
        clientCreated: result.clientCreated,
        partyCount: result.parties.length,
      },
    });

    return {
      status: "COMPLETED",
      matter: result.matter,
      client: result.client,
      parties: result.parties,
      clientCreated: result.clientCreated,
      stepId: step.id,
    };
  } catch (error) {
    if (step?.id) {
      await failStep({
        stepId: step.id,
        error,
      }).catch((loggingError) => {
        console.error(
          "Failed to record create-matter step failure:",
          loggingError,
        );
      });
    }

    throw error;
  }
}
