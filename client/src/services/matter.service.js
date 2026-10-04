import { api } from "./api.js";

export async function getMatters() {
  return api.get("/matters");
}

export async function getMatter(matterId) {
  return api.get(`/matters/${matterId}`);
}

export async function createMatter(matterData) {
  return api.post("/matters", matterData);
}

export async function updateMatter(matterId, matterData) {
  return api.patch(`/matters/${matterId}`, matterData);
}