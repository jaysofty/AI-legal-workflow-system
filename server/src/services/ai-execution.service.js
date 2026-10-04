import { prisma } from "../config/database.js";

export async function startAIExecution({
  userId,
  matterId,
  agent,
  model,
  input,
}) {
  return prisma.aIExecution.create({
    data: {
      userId,
      matterId,
      agent,
      model,
      input,
      status: "STARTED",
    },
  });
}

export async function completeAIExecution({
  executionId,
  output,
  tokensUsed,
  latencyMs,
}) {
  return prisma.aIExecution.update({
    where: {
      id: executionId,
    },
    data: {
      output,
      tokensUsed,
      latencyMs,
      status: "COMPLETED",
    },
  });
}

export async function failAIExecution({
  executionId,
  output,
  latencyMs,
}) {
  return prisma.aIExecution.update({
    where: {
      id: executionId,
    },
    data: {
      output,
      latencyMs,
      status: "FAILED",
    },
  });
}