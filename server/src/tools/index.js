import { registerTool } from "./registry.js";

import { getMatterTool } from "./definitions/get-matter.tool.js";

import {
  searchMatterDocumentsTool,
} from "./definitions/search-matter-documents.tool.js";

import {
  getMatterTimelineTool,
} from "./definitions/get-matter-timeline.tool.js";

import { createTaskTool } from "./definitions/create-task.tool.js";
import { generateDocumentTool } from "./definitions/generate-document.tool.js";



registerTool(getMatterTool);
registerTool(searchMatterDocumentsTool);
registerTool(getMatterTimelineTool);
registerTool(createTaskTool);
registerTool(generateDocumentTool);

export { getTool, hasTool, listTools } from "./registry.js";