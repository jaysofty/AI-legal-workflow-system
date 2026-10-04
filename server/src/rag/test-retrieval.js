import "dotenv/config";

import {
  retrieveMatterContext,
  formatRetrievedContext,
} from "./retrieval.service.js";

const firmId = "cmuo5i6yh00001gzzf7u1ubs9";

const matterId = "cmuofwq6u00008czz36wfdhpy";

const question =
  "Why was a /27 subnet chosen instead of a /28 subnet?";

try {
  console.log("Retrieving matter context...\n");

  const results = await retrieveMatterContext({
    question,
    firmId,
    matterId,
    limit: 5,
  });

  console.log(`Retrieved ${results.length} sources.\n`);

  const context = formatRetrievedContext(results);

  console.log("==============================");
  console.log("FORMATTED RAG CONTEXT");
  console.log("==============================\n");

  console.log(context);
} catch (error) {
  console.error("RAG retrieval failed:", error);
} finally {
  process.exit(0);
}