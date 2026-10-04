import {
  startStep,
  completeStep,
  waitForHumanStep,
  failStep,
  getStepById,
} from "../../services/workflow-step.service.js";

import { waitForHuman } from "../../services/workflow.service.js";

import { runConflictCheck } from "../../services/conflict-check.service.js";

export async function executeConflictCheckStep({ workflowId, firmId, input }) {
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }

  if (!firmId) {
    throw new Error("Firm ID is required");
  }

  let step;

  try {
    step = await startStep({
      executionId: workflowId,
      stepKey: "CONFLICT_CHECK",
      name: "Conflict Check",
      input: {
        clientName: input.client.name,
        opposingParties: input.intake.opposingParties,
      },
    });

    const result = await runConflictCheck({
      firmId,
      input,
    });

    if (result.result === "POTENTIAL_MATCH") {
      await waitForHumanStep({
        stepId: step.id,
        output: result,
      });

      await waitForHuman({
        workflowId,
        output: {
          reason: "Potential conflict requires human review",
          conflictCheck: result,
        },
      });

      return {
        status: "WAITING_FOR_HUMAN",
        stepId: step.id,
        result,
      };
    }

    await completeStep({
      stepId: step.id,
      output: result,
    });

    return {
      status: "COMPLETED",
      stepId: step.id,
      result,
    };
  } catch (error) {
    if (step?.id) {
      const currentStep = await getStepById({
        stepId: step.id,
      }).catch(() => null);

      if (currentStep && currentStep.status === "RUNNING") {
        await failStep({
          stepId: step.id,
          error,
        }).catch((loggingError) => {
          console.error(
            "Failed to record conflict-check failure:",
            loggingError,
          );
        });
      }
    }

    throw error;
  }
}
