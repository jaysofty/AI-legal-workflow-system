import "dotenv/config";

import { searchDocumentChunks } from "./vector-search.service.js";

const firmId = "cmuo5i6yh00001gzzf7u1ubs9";

const matterId = "cmuofwq6u00008czz36wfdhpy";

const question =
  "Why was a /27 subnet chosen instead of a /28 subnet?";

try {
  console.log("Searching legal matter knowledge...\n");

  const results = await searchDocumentChunks({
    question,
    firmId,
    matterId,
    limit: 5,
  });

  console.log(`Found ${results.length} results.\n`);

  for (const result of results) {
    console.log("==============================");
    console.log(`Similarity: ${Number(result.similarity).toFixed(4)}`);
    console.log(`Document: ${result.documentName}`);
    console.log(`Chunk: ${result.chunkIndex}`);
    console.log("==============================");
    console.log(result.content);
    console.log();
  }
} catch (error) {
  console.error("Vector search failed:", error);
} finally {
  process.exit(0);
}