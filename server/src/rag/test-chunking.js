import { createTextChunks } from "./chunking.service.js";

const text = `
The claimant acquired the property in 2018 pursuant to a deed of assignment.

The property is located in Lagos State and measures approximately 650 square metres.

The claimant subsequently applied for Governor's Consent.

The application was delayed because certain title documents were incomplete.

The defendant disputes the claimant's ownership of the property.

The parties are currently considering alternative dispute resolution before commencing litigation.
`;

const chunks = createTextChunks(text, {
  chunkSize: 300,
  chunkOverlap: 50,
});

console.log(`Created ${chunks.length} chunks.`);

for (const chunk of chunks) {
  console.log("\n------------------------------");
  console.log(`Chunk ${chunk.chunkIndex}`);
  console.log(`Characters: ${chunk.characterCount}`);
  console.log("------------------------------");
  console.log(chunk.content);
}