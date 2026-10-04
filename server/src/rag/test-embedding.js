import { embedText } from "./embedding.service.js";

const text = `
The claimant acquired the property in 2018 pursuant
to a deed of assignment. The property is located in
Lagos State and measures approximately 650 square metres.
`;

try {
  console.log("Generating embedding...");

  const embedding = await embedText(text);

  console.log("Embedding generated successfully.");
  console.log("Dimensions:", embedding.length);

  console.log("\nFirst 10 values:");

  console.log(embedding.slice(0, 10));

  console.log("\nLast 10 values:");

  console.log(embedding.slice(-10));
} catch (error) {
  console.error("Embedding test failed:", error);
} finally {
  process.exit(0);
}