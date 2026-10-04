import { prisma } from "../config/database.js";

export async function startToolExecution({
  aiExecutionId,
  toolName,
  arguments: toolArguments,
}) {
  return prisma.toolExecution.create({
    data: {
      aiExecutionId,
      toolName,
      arguments: toolArguments,
      status: "STARTED",
    },
  });
}

export async function completeToolExecution({
  executionId,
  result,
}) {
  return prisma.toolExecution.update({
    where: {
      id: executionId,
    },
    data: {
      result,
      status: "COMPLETED",
    },
  });
}

export async function failToolExecution({
  executionId,
  result,
}) {
  return prisma.toolExecution.update({
    where: {
      id: executionId,
    },
    data: {
      result,
      status: "FAILED",
    },
  });
}