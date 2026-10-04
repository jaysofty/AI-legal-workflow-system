
import { useMemo, useState } from "react";
import {
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useMatters } from "../../hooks/useMatters.js";
import MatterSummary from "../../components/matters/MatterSummary.jsx";
import Button from "../../components/ui/Button.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";

import {
  formatMatterDate,
  formatMatterStatus,
  formatMatterType,
  getMatterClientName,
  getMatterStatusClass,
} from "../../utils/matter.utils.js";

const STATUSES = [
  "ALL",
  "INTAKE",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
];

const TYPES = [
  "ALL",
  "LITIGATION",
  "CORPORATE",
  "REAL_ESTATE",
  "EMPLOYMENT",
  "FAMILY",
  "CRIMINAL",
  "IMMIGRATION",
  "INTELLECTUAL_PROPERTY",
  "TAX",
  "OTHER",
];

function getMatterItems(response) {
  const payload = response?.data ?? response;

  return (
    payload?.matters ||
    payload?.items ||
    payload?.data ||
    (Array.isArray(payload) ? payload : [])
  );
}

function Matters() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");

  const query = useMatters();

  const matters = useMemo(
    () => getMatterItems(query.data),
    [query.data],
  );

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();

    return matters.filter((matter) => {
      const searchable = [
        matter.title,
        matter.referenceNumber,
        matter.description,
        matter.court,
        matter.courtNumber,
        matter.jurisdiction,
        getMatterClientName(matter.client),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!text || searchable.includes(text)) &&
        (status === "ALL" || matter.status === status) &&
        (type === "ALL" || matter.type === type)
      );
    });
  }, [matters, search, status, type]);

  const active = matters.filter(
    (matter) => matter.status === "ACTIVE",
  ).length;

  const intake = matters.filter(
    (matter) => matter.status === "INTAKE",
  ).length;

  const hasFilters =
    Boolean(search.trim()) ||
    status !== "ALL" ||
    type !== "ALL";

  const columns = [
    {
      key: "matter",
      header: "Matter",
      render: (matter) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {matter.title || "Untitled matter"}
            </p>

            <p className="text-xs text-slate-500">
              {matter.referenceNumber || "No reference"}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "client",
      header: "Client",
      render: (matter) =>
        getMatterClientName(matter.client),
    },

    {
      key: "type",
      header: "Type",
      render: (matter) =>
        formatMatterType(matter.type),
    },

    {
      key: "status",
      header: "Status",
      render: (matter) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getMatterStatusClass(
            matter.status,
          )}`}
        >
          {formatMatterStatus(matter.status)}
        </span>
      ),
    },

    {
      key: "court",
      header: "Court",
      render: (matter) => (
        <div className="max-w-48">
          <p className="truncate">
            {matter.court || "No court"}
          </p>

          {matter.courtNumber && (
            <p className="truncate text-xs text-slate-400">
              {matter.courtNumber}
            </p>
          )}
        </div>
      ),
    },

    {
      key: "openedAt",
      header: "Opened",
      render: (matter) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <RefreshCw
            size={14}
            className="hidden"
          />

          {formatMatterDate(matter.openedAt)}
        </span>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-7xl p-4 sm:p-6">
      <PageHeader
        eyebrow="MATTER MANAGEMENT"
        title="Matters"
        description="Manage your firm's legal matters, clients, and case information."
        action={
          <Button
            onClick={() => navigate("/matters/intake")}
            icon={<Plus size={17} />}
          >
            New Matter
          </Button>
        }
      />

      <MatterSummary
        total={matters.length}
        active={active}
        intake={intake}
        loading={query.isLoading}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search matters, clients, references..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3">
            <Filter size={16} className="mr-2 text-slate-400" />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="bg-transparent py-2.5 text-sm outline-none"
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item === "ALL" ? "All statuses" : formatMatterStatus(item)}
                </option>
              ))}
            </select>
          </div>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
          >
            {TYPES.map((item) => (
              <option key={item} value={item}>
                {item === "ALL" ? "All types" : formatMatterType(item)}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
            className="px-3"
            icon={
              <RefreshCw
                size={17}
                className={query.isFetching ? "animate-spin" : ""}
              />
            }
          />
        </div>
      </div>

      {query.isError && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load matters
            </p>

            <p className="text-sm text-red-700">
              {query.error?.message || "Please try again."}
            </p>
          </div>

          <Button variant="secondary" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              All matters
            </h2>

            <p className="text-xs text-slate-500">
              Your firm's matter directory
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {filtered.length} records
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(matter) => matter.id}
          onRowClick={(matter) => navigate(`/matters/${matter.id}`)}
          isLoading={query.isLoading}
          loadingMessage="Loading matter records..."
          emptyTitle={hasFilters ? "No matching matters" : "No matters yet"}
          emptyMessage={
            hasFilters
              ? "Try changing your search or filters."
              : "Matter records will appear here when they are created."
          }
        />
      </div>
    </section>
  );
}

export default Matters;

