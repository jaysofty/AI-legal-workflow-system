import { prisma } from "../config/database.js";

const WORKFLOW_STATUSES = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  WAITING_FOR_HUMAN: "WAITING_FOR_HUMAN",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

export async function startWorkflow({
  workflowKey,
  userId,
  matterId = null,
  clientId = null,
  input = null,
}) {
  if (!workflowKey) {
    throw new Error("Workflow key is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  return prisma.workflowExecution.create({
    data: {
      workflowKey,
      userId,
      matterId,
      clientId,
      input,
      status: WORKFLOW_STATUSES.RUNNING,
      startedAt: new Date(),
    },
  });
}

export async function completeWorkflow({ workflowId, output = null }) {
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }

  const workflow = await prisma.workflowExecution.findUnique({
    where: {
      id: workflowId,
    },
    include: {
      steps: true,
    },
  });

  if (!workflow) {
    throw new Error("Workflow execution not found");
  }

  if (
    ![WORKFLOW_STATUSES.RUNNING, WORKFLOW_STATUSES.WAITING_FOR_HUMAN].includes(
      workflow.status,
    )
  ) {
    throw new Error(
      `Workflow cannot be completed from status ${workflow.status}`,
    );
  }

  const unfinishedSteps = workflow.steps.filter(
    (step) => !["COMPLETED", "SKIPPED"].includes(step.status),
  );

  if (unfinishedSteps.length > 0) {
    throw new Error(
      `Workflow cannot be completed because ${unfinishedSteps.length} step(s) are still unfinished`,
    );
  }

  return prisma.workflowExecution.update({
    where: {
      id: workflowId,
    },
    data: {
      status: WORKFLOW_STATUSES.COMPLETED,
      output,
      completedAt: new Date(),
    },
  });
}

export async function waitForHuman({ workflowId, output = null }) {
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }

  const workflow = await prisma.workflowExecution.findUnique({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow execution not found");
  }

  if (workflow.status !== WORKFLOW_STATUSES.RUNNING) {
    throw new Error(
      `Workflow cannot wait for human review from status ${workflow.status}`,
    );
  }

  return prisma.workflowExecution.update({
    where: {
      id: workflowId,
    },
    data: {
      status: WORKFLOW_STATUSES.WAITING_FOR_HUMAN,
      output,
    },
  });
}

export async function failWorkflow({ workflowId, error }) {
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }

  if (!error) {
    throw new Error("Workflow error is required");
  }

  const workflow = await prisma.workflowExecution.findUnique({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow execution not found");
  }

  if (
    [WORKFLOW_STATUSES.COMPLETED, WORKFLOW_STATUSES.CANCELLED].includes(
      workflow.status,
    )
  ) {
    throw new Error(`Workflow cannot be failed from status ${workflow.status}`);
  }

  return prisma.workflowExecution.update({
    where: {
      id: workflowId,
    },
    data: {
      status: WORKFLOW_STATUSES.FAILED,
      error: error instanceof Error ? error.message : String(error),
      completedAt: new Date(),
    },
  });
}

export async function cancelWorkflow({
  workflowId,
  reason = "Workflow cancelled",
}) {
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }

  const workflow = await prisma.workflowExecution.findUnique({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow execution not found");
  }

  if (
    [
      WORKFLOW_STATUSES.COMPLETED,
      WORKFLOW_STATUSES.FAILED,
      WORKFLOW_STATUSES.CANCELLED,
    ].includes(workflow.status)
  ) {
    throw new Error(
      `Workflow cannot be cancelled from status ${workflow.status}`,
    );
  }

  return prisma.workflowExecution.update({
    where: {
      id: workflowId,
    },
    data: {
      status: WORKFLOW_STATUSES.CANCELLED,
      error: reason,
      completedAt: new Date(),
    },
  });
}

export async function getWorkflowById({ workflowId, userId }) {
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  return prisma.workflowExecution.findFirst({
    where: {
      id: workflowId,
      userId,
    },
    include: {
      steps: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function resumeWorkflow({ workflowId }) {
  if (!workflowId) {
    throw new Error("Workflow ID is required");
  }

  const workflow = await prisma.workflowExecution.findUnique({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow execution not found");
  }

  if (workflow.status !== WORKFLOW_STATUSES.WAITING_FOR_HUMAN) {
    throw new Error(
      `Workflow cannot be resumed from status ${workflow.status}`,
    );
  }

  return prisma.workflowExecution.update({
    where: {
      id: workflowId,
    },
    data: {
      status: WORKFLOW_STATUSES.RUNNING,
    },
  });
}

export { WORKFLOW_STATUSES };
