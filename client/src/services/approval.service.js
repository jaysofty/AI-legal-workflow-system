import { api } from "./api.js";

export async function updateApproval({ approvalId, status, notes }) {
  if (!approvalId) {
    throw new Error("Approval ID is required.");
  }

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new Error("Invalid approval status.");
  }

  const response = await api.patch(`/approvals/${approvalId}`, {
    status,
    notes: notes?.trim() || undefined,
  });

  return response.data;
}
