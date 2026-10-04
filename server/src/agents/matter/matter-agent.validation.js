import { z } from "zod";

export const matterAgentDecisionSchema = z.object({
  action: z.enum(["RESPOND", "USE_TOOL"]),

  toolName: z
    .enum([
      "getMatter",
      "searchMatterDocuments",
      "getMatterTimeline",
      "createTask",
      "generateDocument",
    ])
    .nullable(),

  toolArguments: z.record(z.string(), z.unknown()).nullable(),

  response: z.string().nullable(),
});