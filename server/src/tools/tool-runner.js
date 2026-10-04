import "./index.js";
import { getTool } from "./registry.js";
import { checkToolPermission } from "./permission-checker.js";

import {
  startToolExecution,
  completeToolExecution,
  failToolExecution,
} from "../services/tool-execution.service.js";

export async function runTool({
  toolName,
  arguments: rawArguments,
  user,
  aiExecutionId,
}) {
  if (!toolName || typeof toolName !== "string") {
    const error = new Error("Tool name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!user?.id || !user?.firmId || !user?.role) {
    const error = new Error("Authenticated user context is required");
    error.statusCode = 401;
    throw error;
  }

  if (!aiExecutionId) {
    const error = new Error("AI execution ID is required");
    error.statusCode = 400;
    throw error;
  }

const tool = getTool(toolName);

if (!tool) {
  const error = new Error(`Unknown tool: ${toolName}`);
  error.statusCode = 404;
  throw error;
}

checkToolPermission({
  toolName,
  user,
});

const validation = tool.inputSchema.safeParse(rawArguments ?? {});

  if (!validation.success) {
    const error = new Error("Invalid tool arguments");
    error.statusCode = 400;
    error.details = validation.error.flatten();
    throw error;
  }

  const toolExecution = await startToolExecution({
    aiExecutionId,
    toolName,
    arguments: validation.data,
  });

  try {
    const result = await tool.execute({
      ...validation.data,
      user,
    });

    await completeToolExecution({
      executionId: toolExecution.id,
      result,
    });

    return result;
  } catch (error) {
    await failToolExecution({
      executionId: toolExecution.id,
      result: {
        error: error.message,
      },
    }).catch((loggingError) => {
      console.error(
        "Failed to update tool execution:",
        loggingError,
      );
    });

    throw error;
  }
}