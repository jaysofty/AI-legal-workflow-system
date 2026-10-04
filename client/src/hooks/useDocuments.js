import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  archiveDocument,
  createDocument,
  getDocumentById,
  getDocuments,
  updateDocument,
  uploadDocument,
} from "../services/document.service.js";

export const documentKeys = {
  all: ["documents"],
  detail: (documentId) => ["documents", documentId],
};

export function useDocuments(filters = {}) {
  return useQuery({
    queryKey: [...documentKeys.all, filters],
    queryFn: () => getDocuments(filters),
    staleTime: 30 * 1000,
  });
}

export function useDocument(documentId) {
  return useQuery({
    queryKey: documentKeys.detail(documentId),
    queryFn: () => getDocumentById(documentId),
    enabled: Boolean(documentId),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["matters"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDocument,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["matters"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, documentData }) =>
      updateDocument(documentId, documentData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.documentId),
      });
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveDocument,

    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(documentId),
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}