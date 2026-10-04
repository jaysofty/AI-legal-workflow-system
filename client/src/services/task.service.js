import { api } from "./api.js";

export async function getTasks(filters = {}) {
  const query = Object.entries(filters)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

  return api.get(`/tasks${query ? `?${query}` : ""}`);
}

export async function getTaskById(taskId) {
  return api.get(`/tasks/${taskId}`);
}

export async function createTask(taskData) {
  return api.post("/tasks", taskData);
}

export async function updateTask(taskId, taskData) {
  return api.patch(`/tasks/${taskId}`, taskData);
}

export async function deleteTask(taskId) {
  return api.delete(`/tasks/${taskId}`);
}