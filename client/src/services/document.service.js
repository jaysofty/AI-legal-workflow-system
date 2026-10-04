import { api } from "./api.js";

export async function getDocuments(filters = {}) {
  const query = Object.entries(filters)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

  return api.get(`/documents${query ? `?${query}` : ""}`);
}

export async function getDocumentById(documentId) {
  return api.get(`/documents/${documentId}`);
}

export async function uploadDocument(formData) {
  return api.post("/documents/upload", formData);
}

export async function createDocument(documentData) {
  return api.post("/documents", documentData);
}

export async function updateDocument(documentId, documentData) {
  return api.patch(`/documents/${documentId}`, documentData);
}

export async function archiveDocument(documentId) {
  return api.delete(`/documents/${documentId}`);
}