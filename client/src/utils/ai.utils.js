export function getMatters(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.matters)) return response.matters;
  if (Array.isArray(response?.data?.matters)) {
    return response.data.matters;
  }

  return [];
}

export function formatToolName(toolName) {
  const names = {
    getMatter: "Matter details",
    searchMatterDocuments: "Document search",
    getMatterTimeline: "Matter timeline",
    createTask: "Task creation",
    generateDocument: "Document drafting",
  };

  return names[toolName] || toolName;
}
