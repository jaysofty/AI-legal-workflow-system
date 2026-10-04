import { api } from "./api.js";

export async function getUsers() {
  return api.get("/users");
}