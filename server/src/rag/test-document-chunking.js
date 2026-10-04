import "dotenv/config";

import { createDocumentChunks } from "./chunking.service.js";

const documentId = "cmuoiddon0003fczzr0citbui";
const firmId = "cmuo5i6yh00001gzzf7u1ubs9";

try {
  const chunks = await createDocumentChunks(
    documentId,
    firmId,
    {
      chunkSize: 1200,
      chunkOverlap: 200,
    },
  );

  console.log(`Created ${chunks.length} chunks.`);

  for (const chunk of chunks) {
    console.log("\n==============================");
    console.log(`Chunk ${chunk.chunkIndex}`);
    console.log(`Characters: ${chunk.content.length}`);
    console.log("==============================");
    console.log(chunk.content);
  }
} catch (error) {
  console.error("Chunking failed:", error);
} finally {
  process.exit(0);
}