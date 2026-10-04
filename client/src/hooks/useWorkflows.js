import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  startMatterIntake,
  getWorkflow,
  reviewMatterIntakeConflict,
} from "../services/workflow.service";

export function useStartMatterIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startMatterIntake,

    onSuccess: (data) => {
      if (data?.status === "COMPLETED") {
        queryClient.invalidateQueries({
          queryKey: ["matters"],
        });

        queryClient.invalidateQueries({
          queryKey: ["clients"],
        });
      }
    },
  });
}

export function useWorkflow(workflowId) {
  return useQuery({
    queryKey: ["workflow", workflowId],

    queryFn: () => getWorkflow(workflowId),

    enabled: Boolean(workflowId),
  });
}

export function useReviewMatterIntakeConflict() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewMatterIntakeConflict,

    onSuccess: (data) => {
      if (data?.workflowId) {
        queryClient.invalidateQueries({
          queryKey: ["workflow", data.workflowId],
        });
      }

      if (data?.status === "COMPLETED") {
        queryClient.invalidateQueries({
          queryKey: ["matters"],
        });

        queryClient.invalidateQueries({
          queryKey: ["clients"],
        });
      }
    },
  });
}