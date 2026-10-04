import { embedText } from "./embedding.service.js";

function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same dimensions");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
}

const texts = [
  "The claimant acquired the property through a deed of assignment.",
  "The claimant obtained ownership of the land through a property assignment.",
  "The defendant was arrested by the police for a criminal offence.",
];

try {
  console.log("Generating embeddings...\n");

  const embeddings = [];

  for (const text of texts) {
    const embedding = await embedText(text);

    embeddings.push(embedding);

    console.log(
      `Generated ${embedding.length}-dimensional embedding`,
    );
  }

  const similarityOne = cosineSimilarity(
    embeddings[0],
    embeddings[1],
  );

  const similarityTwo = cosineSimilarity(
    embeddings[0],
    embeddings[2],
  );

  console.log("\nSemantic similarity results:");

  console.log(
    "Property sentence vs property sentence:",
    similarityOne.toFixed(4),
  );

  console.log(
    "Property sentence vs criminal sentence:",
    similarityTwo.toFixed(4),
  );
} catch (error) {
  console.error("Similarity test failed:", error);
} finally {
  process.exit(0);
}