import { prisma } from "../config/database.js";

import {
  retrieveMatterContext,
  formatRetrievedContext,
} from "../rag/retrieval.service.js";

import { generateText } from "./generate-text.service.js";

import {
  startAIExecution,
  completeAIExecution,
  failAIExecution,
} from "../services/ai-execution.service.js";

const MATTER_ASSISTANT_SYSTEM_PROMPT = `
You are the LegalFlow AI Matter Assistant.

LegalFlow AI is a legal workflow assistant for lawyers and law firms.

Your role is to help lawyers understand and work with information
contained in the firm's matter documents.

IMPORTANT RULES:

1. Use the supplied matter context as your primary factual source.

2. Do not invent facts, dates, parties, documents, events, case
   details, legal authorities, or conclusions that are not supported
   by the supplied context.

3. If the supplied context does not contain enough information to
   answer the question, clearly say that the available matter
   documents do not contain enough information.

4. Do not pretend that you reviewed documents that were not supplied
   in the context.

5. Clearly distinguish information found in the matter documents
   from general explanation.

6. Do not make autonomous legal decisions.

7. Do not claim that an answer constitutes legal advice or replaces
   professional legal judgment.

8. When useful, identify the source document and relevant chunk.

9. Be concise but useful. Lawyers should be able to quickly understand
   the answer and verify it against the underlying documents.

10. If the question concerns a potentially high-risk legal decision,
    filing, deadline, court procedure, or legal conclusion and the
    supplied context is insufficient, explicitly recommend human review.
`;

export async function askMatterAssistant({
  question,
  userId,
  firmId,
  matterId,
  documentId,
  limit = 5,
}) {
  /*
   * ---------------------------------------------------------
   * 1. Verify the authenticated user belongs to the firm
   * ---------------------------------------------------------
   */

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      firmId,
    },
    select: {
      id: true,
      firmId: true,
    },
  });

  if (!user) {
    const error = new Error(
      "User does not belong to this firm",
    );

    error.statusCode = 403;

    throw error;
  }

  /*
   * ---------------------------------------------------------
   * 2. Verify the matter belongs to the authenticated firm
   * ---------------------------------------------------------
   */

  const matter = await prisma.matter.findFirst({
    where: {
      id: matterId,
      firmId,
    },
    select: {
      id: true,
      referenceNumber: true,
      title: true,
      status: true,
    },
  });

  if (!matter) {
    const error = new Error(
      "Matter not found or does not belong to this firm",
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * ---------------------------------------------------------
   * 3. Start AI execution tracking
   * ---------------------------------------------------------
   */

  const model = "openai/gpt-oss-120b";

  const execution = await startAIExecution({
    userId,
    matterId,
    agent: "MATTER_ASSISTANT",
    model,
    input: {
      question,
      documentId: documentId || null,
      limit,
    },
  });

  const startedAt = Date.now();

  try {
    /*
     * -------------------------------------------------------
     * 4. Retrieve relevant matter context
     * -------------------------------------------------------
     */

    const retrievedResults = await retrieveMatterContext({
      question,
      firmId,
      matterId,
      documentId,
      limit,
    });

    const context = formatRetrievedContext(
      retrievedResults,
    );

    /*
     * -------------------------------------------------------
     * 5. Build grounded prompt
     * -------------------------------------------------------
     */

    const prompt = `
MATTER INFORMATION

Matter Reference: ${matter.referenceNumber}
Matter Title: ${matter.title}
Matter Status: ${matter.status}

MATTER CONTEXT

${context}

END MATTER CONTEXT


LAWYER'S QUESTION

${question}


INSTRUCTIONS

Answer the lawyer's question using the supplied matter context.

Where the answer is supported by the context, explain it clearly.

Where useful, mention the relevant source document.

If the context is insufficient, say so rather than inventing information.
`;

    /*
     * -------------------------------------------------------
     * 6. Generate answer
     * -------------------------------------------------------
     */

    const result = await generateText({
      systemPrompt: MATTER_ASSISTANT_SYSTEM_PROMPT,
      prompt,
      model,
    });

    const latencyMs = Date.now() - startedAt;

    /*
     * -------------------------------------------------------
     * 7. Complete execution
     * -------------------------------------------------------
     */

    await completeAIExecution({
      executionId: execution.id,
      output: {
        answer: result.text,
        sources: retrievedResults.map((item) => ({
          documentId: item.source.documentId,
          documentName: item.source.documentName,
          documentType: item.source.documentType,
          chunkIndex: item.source.chunkIndex,
          similarity: item.similarity,
        })),
      },
      latencyMs,
    });

    /*
     * -------------------------------------------------------
     * 8. Return API result
     * -------------------------------------------------------
     */

    return {
      answer: result.text,
      model: result.model,
      executionId: execution.id,
      sources: retrievedResults.map((item) => ({
        documentId: item.source.documentId,
        documentName: item.source.documentName,
        documentType: item.source.documentType,
        chunkIndex: item.source.chunkIndex,
        similarity: item.similarity,
      })),
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
      console.error(
        "Failed to update AI execution:",
        loggingError,
      );
    });

    throw error;
  }
}