import "dotenv/config";

import { askMatterAssistant } from "./matter-assistant.service.js";

const firmId = "cmuo5i6yh00001gzzf7u1ubs9";

const matterId = "cmuofwq6u00008czz36wfdhpy";

const question =
  "What exact date did the court deliver judgment in this matter?";

try {
  console.log("Asking Matter Assistant...\n");

  const result = await askMatterAssistant({
    question,
    firmId,
    matterId,
    limit: 5,
  });

  console.log("==============================");
  console.log("MATTER ASSISTANT ANSWER");
  console.log("==============================\n");

  console.log(result.answer);

  console.log("\n==============================");
  console.log("SOURCES");
  console.log("==============================\n");

  for (const source of result.sources) {
    console.log(
      `${source.documentName} | ` +
        `Chunk ${source.chunkIndex} | ` +
        `Similarity ${source.similarity.toFixed(4)}`,
    );
  }

  console.log("\nModel:", result.model);
} catch (error) {
  console.error("Matter Assistant failed:", error);
} finally {
  process.exit(0);
}