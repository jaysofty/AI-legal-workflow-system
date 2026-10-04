import { api } from "./api.js";

export async function startMatterIntake(data) {
  const response = await api.post(
    "/workflows/matter-intake",
    data,
  );

  return response.data;
}

export async function getWorkflow(workflowId) {
  const response = await api.get(
    `/workflows/${workflowId}`,
  );

  return response.data;
}

export async function reviewMatterIntakeConflict({
  workflowId,
  decision,
  notes,
}) {
  const response = await api.post(
    `/workflows/${workflowId}/conflict-review`,
    {
      decision,
      notes,
    },
  );

  return response.data;
}