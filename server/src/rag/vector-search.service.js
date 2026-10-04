import { prisma } from "../config/database.js";
import { embedText } from "./embedding.service.js";

export async function searchDocumentChunks({
  question,
  firmId,
  matterId,
  documentId,
  limit = 5,
}) {
  if (!question || typeof question !== "string") {
    throw new Error("Search question is required");
  }

  if (!firmId) {
    throw new Error("Firm ID is required");
  }

  if (limit < 1 || limit > 20) {
    throw new Error("Limit must be between 1 and 20");
  }

  const embedding = await embedText(question);

  const vector = `[${embedding.join(",")}]`;

  let results;

  if (matterId && documentId) {
    results = await prisma.$queryRaw`
      SELECT
        dc.id,
        dc."documentId",
        dc."chunkIndex",
        dc.content,
        dc.metadata,
        d.name AS "documentName",
        d.type AS "documentType",
        d."matterId",
        1 - (dc.embedding <=> ${vector}::vector) AS similarity
      FROM "DocumentChunk" dc
      INNER JOIN "Document" d
        ON d.id = dc."documentId"
      WHERE d."firmId" = ${firmId}
        AND d."matterId" = ${matterId}
        AND d.id = ${documentId}
        AND dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> ${vector}::vector
      LIMIT ${limit}
    `;
  } else if (matterId) {
    results = await prisma.$queryRaw`
      SELECT
        dc.id,
        dc."documentId",
        dc."chunkIndex",
        dc.content,
        dc.metadata,
        d.name AS "documentName",
        d.type AS "documentType",
        d."matterId",
        1 - (dc.embedding <=> ${vector}::vector) AS similarity
      FROM "DocumentChunk" dc
      INNER JOIN "Document" d
        ON d.id = dc."documentId"
      WHERE d."firmId" = ${firmId}
        AND d."matterId" = ${matterId}
        AND dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> ${vector}::vector
      LIMIT ${limit}
    `;
  } else if (documentId) {
    results = await prisma.$queryRaw`
      SELECT
        dc.id,
        dc."documentId",
        dc."chunkIndex",
        dc.content,
        dc.metadata,
        d.name AS "documentName",
        d.type AS "documentType",
        d."matterId",
        1 - (dc.embedding <=> ${vector}::vector) AS similarity
      FROM "DocumentChunk" dc
      INNER JOIN "Document" d
        ON d.id = dc."documentId"
      WHERE d."firmId" = ${firmId}
        AND d.id = ${documentId}
        AND dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> ${vector}::vector
      LIMIT ${limit}
    `;
  } else {
    results = await prisma.$queryRaw`
      SELECT
        dc.id,
        dc."documentId",
        dc."chunkIndex",
        dc.content,
        dc.metadata,
        d.name AS "documentName",
        d.type AS "documentType",
        d."matterId",
        1 - (dc.embedding <=> ${vector}::vector) AS similarity
      FROM "DocumentChunk" dc
      INNER JOIN "Document" d
        ON d.id = dc."documentId"
      WHERE d."firmId" = ${firmId}
        AND dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> ${vector}::vector
      LIMIT ${limit}
    `;
  }

  return results;
}