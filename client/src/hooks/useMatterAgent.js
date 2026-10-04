import { useMutation } from "@tanstack/react-query";

import { runMatterAgent } from "../services/matter-agent.service.js";

export function useMatterAgent() {
  return useMutation({
    mutationFn: runMatterAgent,
  });
}