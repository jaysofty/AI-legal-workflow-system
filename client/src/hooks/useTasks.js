import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../services/task.service.js";

export const taskKeys = {
  all: ["tasks"],
  detail: (taskId) => ["tasks", taskId],
};

export function useTasks(filters = {}) {
  return useQuery({
    queryKey: [...taskKeys.all, filters],
    queryFn: () => getTasks(filters),
    staleTime: 30 * 1000,
  });
}

export function useTask(taskId) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTaskById(taskId),
    enabled: Boolean(taskId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, taskData }) =>
      updateTask(taskId, taskData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.taskId),
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,

    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });

      queryClient.removeQueries({
        queryKey: taskKeys.detail(taskId),
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}