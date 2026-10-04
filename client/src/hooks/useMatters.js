import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createMatter,
  getMatter,
  getMatters,
  updateMatter,
} from "../services/matter.service.js";

export const matterKeys = {
  all: ["matters"],
  detail: (matterId) => ["matters", matterId],
};

export function useMatters() {
  return useQuery({
    queryKey: matterKeys.all,
    queryFn: getMatters,
    staleTime: 30 * 1000,
  });
}

export function useMatter(matterId) {
  return useQuery({
    queryKey: matterKeys.detail(matterId),
    queryFn: () => getMatter(matterId),
    enabled: Boolean(matterId),
  });
}

export function useCreateMatter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMatter,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matterKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useUpdateMatter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matterId, matterData }) =>
      updateMatter(matterId, matterData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matterKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: matterKeys.detail(
          variables.matterId,
        ),
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}