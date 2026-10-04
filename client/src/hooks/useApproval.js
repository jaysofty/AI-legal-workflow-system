import { useMutation } from "@tanstack/react-query";
import { updateApproval } from "../services/approval.service.js";

export function useUpdateApproval() {
  return useMutation({
    mutationFn: updateApproval,
  });
}
