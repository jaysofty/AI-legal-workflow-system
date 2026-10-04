const tools = new Map();

export function registerTool(tool) {
  if (!tool?.name) {
    throw new Error("Tool name is required");
  }

  if (tools.has(tool.name)) {
    throw new Error(`Tool "${tool.name}" is already registered`);
  }

  tools.set(tool.name, tool);
}

export function getTool(name) {
  return tools.get(name);
}

export function hasTool(name) {
  return tools.has(name);
}

export function listTools() {
  return Array.from(tools.values()).map((tool) => ({
    name: tool.name,
    description: tool.description,
  }));
}