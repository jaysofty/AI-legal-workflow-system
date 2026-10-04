
import { api } from "./api.js";

export async function getClients() {
  return api.get("/clients");
}

export async function getClient(clientId) {
  return api.get(`/clients/${clientId}`);
}

export async function createClient(clientData) {
  return api.post("/clients", clientData);
}

export async function updateClient(clientId, clientData) {
  return api.patch(`/clients/${clientId}`, clientData);
}