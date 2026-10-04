import { searchDocumentChunks } from "./vector-search.service.js";

export async function retrieveMatterContext({
  question,
  firmId,
  matterId,
  documentId,
  limit = 5,
}) {
  if (!question || typeof question !== "string") {
    throw new Error("Question is required");
  }

  if (!firmId) {
    throw new Error("Firm ID is required");
  }

  const results = await searchDocumentChunks({
    question,
    firmId,
    matterId,
    documentId,
    limit,
  });

  return results.map((result) => ({
    content: result.content,
    source: {
      documentId: result.documentId,
      documentName: result.documentName,
      documentType: result.documentType,
      chunkIndex: result.chunkIndex,
    },
    similarity: Number(result.similarity),
  }));
}

export function formatRetrievedContext(results) {
  if (!results || results.length === 0) {
    return "No relevant matter documents were found.";
  }

  return results
    .map((result, index) => {
      return [
        `SOURCE ${index + 1}`,
        `Document: ${result.source.documentName}`,
        `Document Type: ${result.source.documentType}`,
        `Chunk: ${result.source.chunkIndex}`,
        `Similarity: ${result.similarity.toFixed(4)}`,
        "",
        result.content,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}