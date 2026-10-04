import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "../services/dashboard.service.js";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    staleTime: 30 * 1000,
  });
}