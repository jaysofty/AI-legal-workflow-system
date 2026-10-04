import { prisma } from "../config/database.js";
import { embedTexts } from "./embedding.service.js";

export async function embedDocumentChunks(
  documentId,
  firmId,
) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      firmId,
    },
    select: {
      id: true,
      extractedText: true,
      status: true,
      chunks: {
        orderBy: {
          chunkIndex: "asc",
        },
        select: {
          id: true,
          chunkIndex: true,
          content: true,
        },
      },
    },
  });

  if (!document) {
    throw new Error(
      "Document not found or does not belong to this firm",
    );
  }

  if (document.chunks.length === 0) {
    throw new Error(
      "Document does not contain any chunks",
    );
  }

  const texts = document.chunks.map(
    (chunk) => chunk.content,
  );

  const embeddings = await embedTexts(texts);

  if (embeddings.length !== document.chunks.length) {
    throw new Error(
      "Embedding count does not match chunk count",
    );
  }

  for (let index = 0; index < document.chunks.length; index += 1) {
    const chunk = document.chunks[index];
    const embedding = embeddings[index];

    if (embedding.length !== 384) {
      throw new Error(
        `Invalid embedding dimension for chunk ${chunk.chunkIndex}`,
      );
    }

    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      UPDATE "DocumentChunk"
      SET "embedding" = ${vector}::vector
      WHERE "id" = ${chunk.id}
    `;
  }

  return prisma.documentChunk.findMany({
    where: {
      documentId,
    },
    orderBy: {
      chunkIndex: "asc",
    },
    select: {
      id: true,
      chunkIndex: true,
      content: true,
      metadata: true,
    },
  });
}