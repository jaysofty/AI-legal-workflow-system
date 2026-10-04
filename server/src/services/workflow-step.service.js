import { prisma } from "../config/database.js";

const STEP_STATUSES = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  WAITING_FOR_HUMAN: "WAITING_FOR_HUMAN",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
};

async function getStep(stepId) {
  const step = await prisma.workflowStep.findUnique({
    where: {
      id: stepId,
    },
  });

  if (!step) {
    throw new Error("Workflow step not found");
  }

  return step;
}

export async function startStep({
  executionId,
  stepKey,
  name,
  input = null,
}) {
  if (!executionId) {
    throw new Error("Workflow execution ID is required");
  }

  if (!stepKey) {
    throw new Error("Workflow step key is required");
  }

  if (!name) {
    throw new Error("Workflow step name is required");
  }

  const workflow = await prisma.workflowExecution.findUnique({
    where: {
      id: executionId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow execution not found");
  }

  if (workflow.status !== "RUNNING") {
    throw new Error(
      `Cannot start a step while workflow is ${workflow.status}`,
    );
  }

  return prisma.workflowStep.create({
    data: {
      executionId,
      stepKey,
      name,
      input,
      status: STEP_STATUSES.RUNNING,
      startedAt: new Date(),
    },
  });
}

export async function completeStep({
  stepId,
  output = null,
}) {
  const step = await getStep(stepId);

  if (step.status !== STEP_STATUSES.RUNNING) {
    throw new Error(
      `Step cannot be completed from status ${step.status}`,
    );
  }

  return prisma.workflowStep.update({
    where: {
      id: stepId,
    },
    data: {
      status: STEP_STATUSES.COMPLETED,
      output,
      completedAt: new Date(),
    },
  });
}

export async function waitForHumanStep({
  stepId,
  output = null,
}) {
  const step = await getStep(stepId);

  if (step.status !== STEP_STATUSES.RUNNING) {
    throw new Error(
      `Step cannot wait for human review from status ${step.status}`,
    );
  }

  return prisma.workflowStep.update({
    where: {
      id: stepId,
    },
    data: {
      status: STEP_STATUSES.WAITING_FOR_HUMAN,
      output,
    },
  });
}

export async function failStep({
  stepId,
  error,
}) {
  if (!error) {
    throw new Error("Step error is required");
  }

  const step = await getStep(stepId);

  if (
    [
      STEP_STATUSES.COMPLETED,
      STEP_STATUSES.SKIPPED,
    ].includes(step.status)
  ) {
    throw new Error(
      `Step cannot be failed from status ${step.status}`,
    );
  }

  return prisma.workflowStep.update({
    where: {
      id: stepId,
    },
    data: {
      status: STEP_STATUSES.FAILED,
      error:
        error instanceof Error
          ? error.message
          : String(error),
      completedAt: new Date(),
    },
  });
}

export async function skipStep({
  stepId,
  reason = "Step skipped",
}) {
  const step = await getStep(stepId);

  if (
    [
      STEP_STATUSES.COMPLETED,
      STEP_STATUSES.FAILED,
    ].includes(step.status)
  ) {
    throw new Error(
      `Step cannot be skipped from status ${step.status}`,
    );
  }

  return prisma.workflowStep.update({
    where: {
      id: stepId,
    },
    data: {
      status: STEP_STATUSES.SKIPPED,
      output: {
        reason,
      },
      completedAt: new Date(),
    },
  });
}

export async function getStepById({
  stepId,
}) {
  if (!stepId) {
    throw new Error("Workflow step ID is required");
  }

  return getStep(stepId);
}

export async function getWorkflowSteps({
  executionId,
}) {
  if (!executionId) {
    throw new Error("Workflow execution ID is required");
  }

  return prisma.workflowStep.findMany({
    where: {
      executionId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function completeHumanReviewStep({
  stepId,
  output = null,
}) {
  const step = await getStep(stepId);

  if (step.status !== STEP_STATUSES.WAITING_FOR_HUMAN) {
    throw new Error(
      `Human review step cannot be completed from status ${step.status}`,
    );
  }

  return prisma.workflowStep.update({
    where: {
      id: stepId,
    },
    data: {
      status: STEP_STATUSES.COMPLETED,
      output,
      completedAt: new Date(),
    },
  });
}

export async function resumeStep({
  stepId,
}) {
  const step = await getStep(stepId);

  if (step.status !== STEP_STATUSES.WAITING_FOR_HUMAN) {
    throw new Error(
      `Step cannot be resumed from status ${step.status}`,
    );
  }

  return prisma.workflowStep.update({
    where: {
      id: stepId,
    },
    data: {
      status: STEP_STATUSES.RUNNING,
    },
  });
}

export { STEP_STATUSES };