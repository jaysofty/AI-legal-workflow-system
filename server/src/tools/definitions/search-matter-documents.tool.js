import { z } from "zod";

import { searchDocumentChunks } from "../../rag/vector-search.service.js";

export const searchMatterDocumentsTool = {
  name: "searchMatterDocuments",

  description:
    "Search documents belonging to a specific matter using semantic vector search.",

  inputSchema: z.object({
    matterId: z.string().min(1, "Matter ID is required"),
    query: z
      .string()
      .trim()
      .min(3, "Search query must be at least 3 characters")
      .max(2000, "Search query must not exceed 2000 characters"),
    limit: z.coerce.number().int().min(1).max(10).default(5),
  }),

  async execute({ matterId, query, limit, user }) {
    if (!user?.id || !user?.firmId) {
      const error = new Error("Authenticated user context is required");
      error.statusCode = 401;
      throw error;
    }

    const results = await searchDocumentChunks({
      question: query,
      firmId: user.firmId,
      matterId,
      limit,
    });

    return results.map((result) => ({
      documentId: result.documentId,
      documentName: result.documentName,
      documentType: result.documentType,
      chunkIndex: result.chunkIndex,
      content: result.content,
      similarity: Number(result.similarity),
    }));
  },
};