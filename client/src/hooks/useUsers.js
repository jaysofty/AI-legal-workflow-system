import { useQuery } from "@tanstack/react-query";

import { getUsers } from "../services/user.service.js";

export const userKeys = {
  all: ["users"],
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: getUsers,
    staleTime: 30 * 1000,
  });
}