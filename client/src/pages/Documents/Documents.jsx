import { useMemo, useState } from "react";
import { FileText, Search, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useDocuments } from "../../hooks/useDocuments.js";
import { useMatters } from "../../hooks/useMatters.js";

import DocumentStatusBadge from "../../components/documents/DocumentStatusBadge.jsx";
import DocumentUploadForm from "../../components/documents/DocumentUploadForm.jsx";

import Button from "../../components/ui/Button.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";

import {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  formatDocumentDate,
  formatDocumentType,
  getDocumentItems,
  getDocumentMatterName,
  getDocumentTypeClass,
} from "../../utils/document.utils.js";

const EMPTY_FILTERS = {
  search: "",
  matterId: "",
  type: "",
  status: "",
};

function getMatterItems(response) {
  const payload = response?.data ?? response;

  return (
    payload?.matters ||
    payload?.items ||
    payload?.data ||
    (Array.isArray(payload) ? payload : [])
  );
}

function getMatterLabel(matter) {
  if (matter.referenceNumber && matter.title) {
    return `${matter.referenceNumber} — ${matter.title}`;
  }

  return matter.title || matter.referenceNumber || "Unnamed matter";
}

function Documents() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const documentFilters = useMemo(
    () => ({
      matterId: filters.matterId,
      type: filters.type,
      status: filters.status,
    }),
    [filters.matterId, filters.type, filters.status],
  );

  const documentsQuery = useDocuments(documentFilters);
  const mattersQuery = useMatters();

  const documents = getDocumentItems(documentsQuery.data);
  const matters = getMatterItems(mattersQuery.data);

  const filteredDocuments = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    if (!search) {
      return documents;
    }

    return documents.filter((document) => {
      const documentName = document.name?.toLowerCase() || "";
      const matterName = getDocumentMatterName(document.matter).toLowerCase();

      return (
        documentName.includes(search) ||
        matterName.includes(search)
      );
    });
  }, [documents, filters.search]);

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  const hasActiveFilters =
    filters.search ||
    filters.matterId ||
    filters.type ||
    filters.status;

  const columns = [
    {
      key: "name",
      header: "Document",
      render: (document) => (
        <div className="flex min-w-56 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {document.name || "Unnamed document"}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {formatDocumentDate(document.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "matter",
      header: "Matter",
      render: (document) => (
        <span className="block max-w-64 truncate">
          {getDocumentMatterName(document.matter)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (document) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getDocumentTypeClass(
            document.type,
          )}`}
        >
          {formatDocumentType(document.type)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (document) => (
        <DocumentStatusBadge status={document.status} />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Document management"
        title="Documents"
        description="Manage matter documents, track processing status, and review extracted content."
        action={
          <Button
            icon={<Upload size={16} />}
            onClick={() => setShowUploadForm(true)}
          >
            Upload document
          </Button>
        }
      />

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search documents or matters..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              name="matterId"
              value={filters.matterId}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">All matters</option>

              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {getMatterLabel(matter)}
                </option>
              ))}
            </select>

            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">All types</option>

              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatDocumentType(type)}
                </option>
              ))}
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">All statuses</option>

              {DOCUMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatDocumentType(status)}
                </option>
              ))}
            </select>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                Clear
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredDocuments}
          getRowKey={(document) => document.id}
          onRowClick={(document) =>
            navigate(`/documents/${document.id}`)
          }
          isLoading={documentsQuery.isLoading}
          loadingMessage="Loading documents..."
          emptyTitle={
            hasActiveFilters
              ? "No matching documents"
              : "No documents yet"
          }
          emptyMessage={
            hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Upload your first document to get started."
          }
        />
      </section>

      {showUploadForm && (
        <DocumentUploadForm
          onClose={() => setShowUploadForm(false)}
        />
      )}
    </div>
  );
}

export default Documents;