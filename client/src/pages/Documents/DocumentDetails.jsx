import { useState } from "react";
import { ArrowLeft, Archive, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useArchiveDocument,
  useDocument,
} from "../../hooks/useDocuments.js";

import DocumentInfo from "../../components/documents/DocumentInfo.jsx";
import DocumentStatusBadge from "../../components/documents/DocumentStatusBadge.jsx";

import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";

import {
  formatFileSize,
  getDocument,
} from "../../utils/document.utils.js";

function DocumentDetails() {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [archiveError, setArchiveError] = useState("");

  const documentQuery = useDocument(documentId);
  const archiveMutation = useArchiveDocument();

  const document = getDocument(documentQuery.data);

  function handleArchive() {
    setArchiveError("");

    const confirmed = window.confirm(
      "Are you sure you want to archive this document?",
    );

    if (!confirmed) return;

    archiveMutation.mutate(documentId, {
      onSuccess: () => {
        navigate("/documents");
      },
      onError: (error) => {
        setArchiveError(
          error?.message || "Unable to archive this document.",
        );
      },
    });
  }

  if (documentQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500">Loading document...</p>
      </div>
    );
  }

  if (documentQuery.isError || !document) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate("/documents")}
        >
          Back to documents
        </Button>

        <EmptyState
          icon={<FileText size={20} />}
          title="Document not found"
          message="The document may have been removed or you may not have access to it."
          action={
            <Button onClick={() => navigate("/documents")}>
              View documents
            </Button>
          }
        />
      </div>
    );
  }

  const isArchived = document.status === "ARCHIVED";
  const extractedText = document.extractedText?.trim();
  const chunksCount =
    document._count?.chunks ?? document.chunks?.length ?? 0;
  const generatedDocumentsCount =
    document._count?.generatedDocuments ??
    document.generatedDocuments?.length ??
    0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate("/documents")}
        >
          Back to documents
        </Button>

        {!isArchived && (
          <Button
            variant="danger"
            icon={<Archive size={16} />}
            loading={archiveMutation.isPending}
            onClick={handleArchive}
          >
            {archiveMutation.isPending
              ? "Archiving..."
              : "Archive document"}
          </Button>
        )}
      </div>

      {archiveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {archiveError}
        </div>
      )}

      <DocumentInfo document={document} />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Processing status
          </p>

          <div className="mt-3">
            <DocumentStatusBadge status={document.status} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            File size
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {formatFileSize(document.fileSize)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Text chunks
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {chunksCount}
          </p>

          {generatedDocumentsCount > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              {generatedDocumentsCount} generated document
              {generatedDocumentsCount === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Extracted text
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Text extracted from the uploaded document.
          </p>
        </div>

        <div className="p-6">
          {extractedText ? (
            <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              {extractedText}
            </pre>
          ) : (
            <EmptyState
              icon={<FileText size={20} />}
              title="No extracted text"
              message={
                document.status === "PROCESSING"
                  ? "This document is still being processed."
                  : "No readable text is currently available for this document."
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default DocumentDetails;