import {
  generateText,
  streamText,
} from "../../ai/generate-text.service.js";
import { AI_CONFIG } from "../../config/ai.config.js";

import {
  startAIExecution,
  completeAIExecution,
  failAIExecution,
} from "../../services/ai-execution.service.js";

import { runTool } from "../../tools/tool-runner.js";

import { MATTER_AGENT_SYSTEM_PROMPT } from "./matter-agent.prompt.js";

import { matterAgentDecisionSchema } from "./matter-agent.validation.js";

const TOOL_DESCRIPTIONS = [
  {
    name: "getMatter",
    description:
      "Retrieve core matter information including client, parties, status, type, assigned users, court information, and matter metadata. The matter ID is supplied automatically by the application.",
    arguments: {},
  },

  {
    name: "searchMatterDocuments",
    description:
      "Search documents belonging to this matter using semantic vector search. The application supplies the matter ID automatically.",
    arguments: {
      query: "string",
      limit: "number (optional, 1-10)",
    },
  },

  {
    name: "getMatterTimeline",
    description:
      "Retrieve matter tasks, deadlines, hearings, and timeline information.",
    arguments: {},
  },

  {
    name: "createTask",
    description:
      "Create an internal task associated with this matter. The application supplies the matter ID automatically. Only provide an assignee when the user explicitly identifies an existing user.",
    arguments: {
      title: "string",
      description: "string (optional)",
      priority: "LOW | MEDIUM | HIGH | URGENT (optional)",
      dueDate: "ISO date string (optional)",
      assignedToId: "string (optional)",
    },
  },

  {
    name: "generateDocument",
    description:
      "Generate an AI-assisted legal document draft for this matter. The application supplies the matter ID automatically. The generated document is always created as unapproved and requires human lawyer review.",
    arguments: {
      documentType:
        "PLEADING | MOTION | AFFIDAVIT | WRITTEN_ADDRESS | WITNESS_STATEMENT | CONTRACT | AGREEMENT | CORRESPONDENCE | INTERNAL_MEMO | OTHER",

      title: "string",

      instructions: "string",

      templateId: "string (optional)",

      sourceDocumentId: "string (optional)",

      limit: "number (optional, 1-10)",
    },
  },
];

function buildDecisionPrompt({ question, matterId }) {
  return `
MATTER ID:
${matterId}

USER REQUEST:
${question}

AVAILABLE TOOLS:
${JSON.stringify(TOOL_DESCRIPTIONS, null, 2)}

Determine the correct next action.

Return ONLY valid JSON.

If the request can be answered without a tool:

{
  "action": "RESPOND",
  "toolName": null,
  "toolArguments": null,
  "response": "response to the user"
}

If a tool is required:

{
  "action": "USE_TOOL",
  "toolName": "tool name",
  "toolArguments": {},
  "response": null
}

IMPORTANT:

- Do not execute the tool.
- Do not fabricate tool results.
- Do not claim that an action has already happened.
- Select only one tool.
Tool arguments must contain only information supported by the user's request.

The application automatically supplies the matterId.
Do NOT include matterId in toolArguments.

Use the EXACT argument names defined by the selected tool.

For searchMatterDocuments:
- use "query", not "question".

For createTask:
- only provide assignedToId if the user explicitly supplies an existing user ID.
- do not invent user IDs.

For generateDocument:
- documentType, title, and instructions must be supported by the user's request.
- do not invent templateId or sourceDocumentId.

Do not invent dates, names, IDs, priorities, or other values.
`;
}

function buildFinalResponsePrompt({
  question,
  matterId,
  toolName,
  toolResult,
}) {
  return `
MATTER ID:
${matterId}

USER REQUEST:
${question}

TOOL USED:
${toolName}

TOOL RESULT:
${JSON.stringify(toolResult, null, 2)}

Using the tool result above, answer the user's request.

RULES:

- Treat the tool result as the authoritative source for the action performed.
- Do not invent information that is not present in the tool result.
- Do not claim an action occurred unless the tool result confirms it.
- If information is missing, say so.
- Do not fabricate legal authorities, dates, names, court requirements, or legal conclusions.
- If the result involves a generated legal document, clearly state that human approval is required if it has not been approved.
- Keep the response concise and professional.
`;
}

export async function runMatterAgent({ question, matterId, user }) {
  if (!question || typeof question !== "string") {
    const error = new Error("Matter agent question is required");
    error.statusCode = 400;
    throw error;
  }

  if (!matterId) {
    const error = new Error("Matter ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!user?.id || !user?.firmId || !user?.role) {
    const error = new Error("Authenticated user context is required");
    error.statusCode = 401;
    throw error;
  }

  const startedAt = Date.now();

  const execution = await startAIExecution({
    userId: user.id,
    matterId,
    agent: "MATTER_AGENT",
    model: AI_CONFIG.models.matterAssistant,
    input: {
      question,
    },
  });

  try {
    const decisionResponse = await generateText({
      model: AI_CONFIG.models.matterAssistant,

      systemPrompt: MATTER_AGENT_SYSTEM_PROMPT,

      prompt: buildDecisionPrompt({
        question,
        matterId,
      }),
    });

    let parsedDecision;

    try {
      parsedDecision = JSON.parse(decisionResponse.text);
    } catch {
      const error = new Error("Matter agent returned invalid JSON");

      error.statusCode = 502;
      throw error;
    }

    const validation = matterAgentDecisionSchema.safeParse(parsedDecision);

    if (!validation.success) {
      const error = new Error("Matter agent returned an invalid decision");

      error.statusCode = 502;
      error.details = validation.error.flatten();

      throw error;
    }

    const decision = validation.data;

    /*
     * The agent can answer directly without using a tool.
     */
    if (decision.action === "RESPOND") {
      const latencyMs = Date.now() - startedAt;

      await completeAIExecution({
        executionId: execution.id,
        output: {
          action: "RESPOND",
          response: decision.response,
        },
        latencyMs,
      });

      return {
        executionId: execution.id,
        action: "RESPOND",
        response: decision.response,
        tool: null,
      };
    }

    /*
     * Tool execution must always go through ToolRunner.
     */
    const toolArguments = {
      ...(decision.toolArguments ?? {}),
    };

    delete toolArguments.matterId;

    toolArguments.matterId = matterId;

    const toolResult = await runTool({
      toolName: decision.toolName,
      arguments: toolArguments,
      user,
      aiExecutionId: execution.id,
    });

    /*
     * The tool has completed successfully.
     * Now ask the model to explain the verified result
     * to the user.
     */
    const finalResponse = await generateText({
      model: AI_CONFIG.models.matterAssistant,

      systemPrompt: MATTER_AGENT_SYSTEM_PROMPT,

      prompt: buildFinalResponsePrompt({
        question,
        matterId,
        toolName: decision.toolName,
        toolResult,
      }),
    });

    const latencyMs = Date.now() - startedAt;

    await completeAIExecution({
      executionId: execution.id,
      output: {
        action: "USE_TOOL",
        toolName: decision.toolName,
        toolArguments,
        toolResult,
        response: finalResponse.text,
      },
      latencyMs,
    });

    return {
      executionId: execution.id,
      action: "USE_TOOL",
      response: finalResponse.text,
      tool: {
        name: decision.toolName,
        arguments: toolArguments,
        result: toolResult,
      },
    };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;

    await failAIExecution({
      executionId: execution.id,
      output: {
        error: error.message,
      },
      latencyMs,
    }).catch((loggingError) => {
      console.error("Failed to update AI execution:", loggingError);
    });

    throw error;
  }
}


export async function* runMatterAgentStream({
  question,
  matterId,
  user,
}) {
  if (!question || typeof question !== "string") {
    const error = new Error(
      "Matter agent question is required",
    );
    error.statusCode = 400;
    throw error;
  }

  if (!matterId) {
    const error = new Error("Matter ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!user?.id || !user?.firmId || !user?.role) {
    const error = new Error(
      "Authenticated user context is required",
    );
    error.statusCode = 401;
    throw error;
  }

  const startedAt = Date.now();

  const execution = await startAIExecution({
    userId: user.id,
    matterId,
    agent: "MATTER_AGENT",
    model: AI_CONFIG.models.matterAssistant,
    input: {
      question,
    },
  });

  let accumulatedResponse = "";

  try {
    /*
     * Tell the frontend that the Matter Agent
     * has started analyzing the request.
     */
    yield {
      type: "status",
      status: "ANALYZING",
      executionId: execution.id,
    };

    /*
     * Tool selection remains non-streaming because
     * we need the complete JSON decision before
     * validating or executing anything.
     */
    const decisionResponse = await generateText({
      model: AI_CONFIG.models.matterAssistant,

      systemPrompt: MATTER_AGENT_SYSTEM_PROMPT,

      prompt: buildDecisionPrompt({
        question,
        matterId,
      }),
    });

    let parsedDecision;

    try {
      parsedDecision = JSON.parse(
        decisionResponse.text,
      );
    } catch {
      const error = new Error(
        "Matter agent returned invalid JSON",
      );

      error.statusCode = 502;
      throw error;
    }

    const validation =
      matterAgentDecisionSchema.safeParse(
        parsedDecision,
      );

    if (!validation.success) {
      const error = new Error(
        "Matter agent returned an invalid decision",
      );

      error.statusCode = 502;
      error.details =
        validation.error.flatten();

      throw error;
    }

    const decision = validation.data;

    /*
     * DIRECT RESPONSE
     *
     * The current decision model has already generated
     * the response as part of its JSON decision.
     *
     * We send that response as one content event.
     *
     * Tool-assisted final responses will use true
     * provider streaming below.
     */
    if (decision.action === "RESPOND") {
      accumulatedResponse =
        decision.response || "";

      yield {
        type: "status",
        status: "GENERATING",
      };

      yield {
        type: "content",
        content: accumulatedResponse,
      };

      const latencyMs =
        Date.now() - startedAt;

      await completeAIExecution({
        executionId: execution.id,

        output: {
          action: "RESPOND",
          response: accumulatedResponse,
        },

        latencyMs,
      });

      yield {
        type: "done",
        executionId: execution.id,
        action: "RESPOND",
        tool: null,
      };

      return;
    }

    /*
     * TOOL EXECUTION
     */

    const toolArguments = {
      ...(decision.toolArguments ?? {}),
    };

    delete toolArguments.matterId;

    toolArguments.matterId = matterId;

    /*
     * Tell the frontend which verified application
     * tool is about to run.
     */
    yield {
      type: "tool_start",
      toolName: decision.toolName,
    };

    const toolResult = await runTool({
      toolName: decision.toolName,
      arguments: toolArguments,
      user,
      aiExecutionId: execution.id,
    });

    /*
     * The ToolRunner completed successfully.
     */
    yield {
      type: "tool_complete",
      toolName: decision.toolName,
    };

    /*
     * The verified tool result is now available.
     * Start generating the human-readable response.
     */
    yield {
      type: "status",
      status: "GENERATING",
    };

    const responseStream = streamText({
      model: AI_CONFIG.models.matterAssistant,

      systemPrompt: MATTER_AGENT_SYSTEM_PROMPT,

      prompt: buildFinalResponsePrompt({
        question,
        matterId,
        toolName: decision.toolName,
        toolResult,
      }),
    });

    /*
     * Forward each Groq text chunk to the HTTP layer.
     */
    for await (const chunk of responseStream) {
      accumulatedResponse += chunk;

      yield {
        type: "content",
        content: chunk,
      };
    }

    const latencyMs =
      Date.now() - startedAt;

    /*
     * Store the complete response in the audit log,
     * even though the user received it incrementally.
     */
    await completeAIExecution({
      executionId: execution.id,

      output: {
        action: "USE_TOOL",
        toolName: decision.toolName,
        toolArguments,
        toolResult,
        response: accumulatedResponse,
      },

      latencyMs,
    });

    /*
     * Final event contains metadata needed by
     * the frontend.
     */
    yield {
      type: "done",
      executionId: execution.id,
      action: "USE_TOOL",

      tool: {
        name: decision.toolName,
        arguments: toolArguments,
        result: toolResult,
      },
    };
  } catch (error) {
    const latencyMs =
      Date.now() - startedAt;

    await failAIExecution({
      executionId: execution.id,

      output: {
        error: error.message,
      },

      latencyMs,
    }).catch((loggingError) => {
      console.error(
        "Failed to update AI execution:",
        loggingError,
      );
    });

    throw error;
  }
}
