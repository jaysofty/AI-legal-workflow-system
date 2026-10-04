import "dotenv/config";

import { embedDocumentChunks } from "./document-embedding.service.js";

const documentId = "cmuoiddon0003fczzr0citbui";
const firmId = "cmuo5i6yh00001gzzf7u1ubs9";

try {
  console.log("Embedding document chunks...\n");

  const chunks = await embedDocumentChunks(
    documentId,
    firmId,
  );

  console.log(
    `Successfully embedded ${chunks.length} chunks.`,
  );

  for (const chunk of chunks) {
    console.log("\n==============================");
    console.log(`Chunk ${chunk.chunkIndex}`);
    console.log(`Chunk ID: ${chunk.id}`);
    console.log("==============================");
    console.log(chunk.content.slice(0, 200));
  }
} catch (error) {
  console.error("Document embedding failed:", error);
} finally {
  process.exit(0);
}