import { runTool } from "./tool-runner.js";
import "./index.js";

const user = {
  id: "cmuo5i6zc00011gzz3taoptt5",
  firmId: "cmuo5i6yh00001gzzf7u1ubs9",
  role: "FIRM_ADMIN",
};

const aiExecutionId = "cmuolo9g4000018zzo8q5mczh";

const matter = await runTool({
  toolName: "getMatter",

  arguments: {
    matterId: "cmuofwq6u00008czz36wfdhpy",
  },

  user,
  aiExecutionId,
});

console.log("\nGET MATTER RESULT\n");
console.log(JSON.stringify(matter, null, 2));

const documents = await runTool({
  toolName: "searchMatterDocuments",

  arguments: {
    matterId: "cmuofwq6u00008czz36wfdhpy",
    query: "Why was a /27 subnet chosen instead of a /28?",
    limit: 5,
  },

  user,
  aiExecutionId,
});

console.log("\nSEARCH MATTER DOCUMENTS RESULT\n");
console.log(JSON.stringify(documents, null, 2));

const timeline = await runTool({
  toolName: "getMatterTimeline",

  arguments: {
    matterId: "cmuofwq6u00008czz36wfdhpy",
    limit: 20,
  },

  user,

  aiExecutionId,
});

console.log("\nGET MATTER TIMELINE RESULT\n");
console.log(JSON.stringify(timeline, null, 2));

const task = 

await runTool({
  toolName: "createTask",

  arguments: {
    matterId: "cmuofwq6u00008czz36wfdhpy",
    title: "Review property title documents",
    description:
      "Review the available title documents and identify missing records.",
    priority: "HIGH",
  },

  user,
  aiExecutionId,
});

console.log("\nCREATE TASK RESULT\n");
console.log(JSON.stringify(task, null, 2));

console.log("\nGENERATE DOCUMENT TEST");

const generatedDocumentResult = await runTool({
  toolName: "generateDocument",

  arguments: {
    matterId: "cmuofwq6u00008czz36wfdhpy",

    documentType: "INTERNAL_MEMO",

    title: "Property Matter Internal Review Memo",

    instructions:
      "Prepare an internal legal review memo summarizing the known facts of this property matter, the relevant information contained in the supplied matter documents, and any important information that appears to be missing. Do not invent facts or legal authorities.",

    limit: 5,
  },

  user: {
    id: "cmuo5i6zc00011gzz3taoptt5",
    firmId: "cmuo5i6yh00001gzzf7u1ubs9",
    role: "FIRM_ADMIN",
  },

  // Use a real AIExecution ID from the database.
  aiExecutionId: "cmuolo9g4000018zzo8q5mczh",
});

console.log(
  JSON.stringify(generatedDocumentResult, null, 2),
);