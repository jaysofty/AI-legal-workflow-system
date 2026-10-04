
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createClient,
  getClient,
  getClients,
  updateClient,
} from "../services/client.service.js";

export const clientKeys = {
  all: ["clients"],
  detail: (clientId) => ["clients", clientId],
};

export function useClients() {
  return useQuery({
    queryKey: clientKeys.all,
    queryFn: getClients,
    staleTime: 30 * 1000,
  });
}

export function useClient(clientId) {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: () => getClient(clientId),
    enabled: Boolean(clientId),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.all,
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, clientData }) =>
      updateClient(clientId, clientData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.clientId),
      });
    },
  });
}