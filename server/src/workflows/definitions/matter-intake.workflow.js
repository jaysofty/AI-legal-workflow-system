import { startWorkflow, completeWorkflow, } from "../../services/workflow.service.js";
import { executeConflictCheckStep } from "./conflict-check.step.js";
import { executeCreateMatterStep } from "./create-matter.step.js";
import {
  startStep,
  completeStep,
  failStep,
} from "../../services/workflow-step.service.js";

import { matterIntakeSchema } from "./matter-intake.validation.js";
import { normalizeMatterIntake } from "./matter-intake.normalizer.js";

export const MATTER_INTAKE_WORKFLOW_KEY = "MATTER_INTAKE";

export async function startMatterIntakeWorkflow({ user, input }) {
  if (!user?.id || !user?.firmId) {
    throw new Error("Authenticated user context is required");
  }

  const validation = matterIntakeSchema.safeParse(input);

  if (!validation.success) {
    const error = new Error("Invalid matter intake information");

    error.statusCode = 400;
    error.details = validation.error.flatten();

    throw error;
  }

  const normalizedInput = normalizeMatterIntake(validation.data);

  const workflow = await startWorkflow({
    workflowKey: MATTER_INTAKE_WORKFLOW_KEY,
    userId: user.id,
    input: normalizedInput,
  });

  let validationStep;

  try {
    validationStep = await startStep({
      executionId: workflow.id,
      stepKey: "VALIDATE_INTAKE",
      name: "Validate Matter Intake",
      input: normalizedInput,
    });

    await completeStep({
      stepId: validationStep.id,
      output: {
        valid: true,
        normalized: true,
      },
    });

    const conflictResult = await executeConflictCheckStep({
      workflowId: workflow.id,
      firmId: user.firmId,
      input: normalizedInput,
    });

    const isWaitingForHuman = conflictResult.status === "WAITING_FOR_HUMAN";

    if (isWaitingForHuman) {
      return {
        workflowId: workflow.id,
        workflowKey: MATTER_INTAKE_WORKFLOW_KEY,
        status: "WAITING_FOR_HUMAN",
        input: normalizedInput,
        nextStep: "HUMAN_REVIEW",
        conflictCheck: conflictResult.result,
      };
    }

    const matterResult = await executeCreateMatterStep({
      workflowId: workflow.id,
      user,
      input: normalizedInput,
    });

    await completeWorkflow({
      workflowId: workflow.id,
      output: {
        matterId: matterResult.matter.id,
        clientId: matterResult.client.id,
        referenceNumber: matterResult.matter.referenceNumber,
      },
    });

    return {
      workflowId: workflow.id,
      workflowKey: MATTER_INTAKE_WORKFLOW_KEY,
      status: "COMPLETED",
      input: normalizedInput,
      nextStep: null,
      conflictCheck: conflictResult.result,
      matter: {
        id: matterResult.matter.id,
        referenceNumber: matterResult.matter.referenceNumber,
        title: matterResult.matter.title,
      },
    };
  } catch (error) {
    if (validationStep?.id) {
      await failStep({
        stepId: validationStep.id,
        error,
      }).catch((loggingError) => {
        console.error(
          "Failed to mark intake validation step as failed:",
          loggingError,
        );
      });
    }

    throw error;
  }
}
