import { api } from "./api.js";

export async function getDashboardData() {
  const [clientsResponse, mattersResponse] = await Promise.all([
    api.get("/clients"),
    api.get("/matters"),
  ]);

  return {
    clients: clientsResponse,
    matters: mattersResponse,
  };
}