import { useMemo, useState } from "react";
import {
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useClients } from "../../hooks/useClients.js";

import ClientForm from "../../components/clients/ClientForm.jsx";
import DataTable from "../../components/ui/DataTable.jsx";

import {
  formatClientDate,
  formatClientType,
  getClientItems,
  getClientName,
} from "../../utils/client.utils.js";

function Clients() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useClients();

  const clients = useMemo(
    () => getClientItems(data),
    [data],
  );

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) => {
      const searchable = [
        client.firstName,
        client.lastName,
        client.companyName,
        client.email,
        client.phone,
        client.address,
        client.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [clients, search]);

  const columns = [
    {
      key: "client",
      header: "Client",
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
            {getClientName(client)
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {getClientName(client)}
            </p>

            <p className="truncate text-xs text-slate-500">
              {client.email || "No email"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (client) =>
        formatClientType(client.type),
    },
    {
      key: "phone",
      header: "Phone",
      render: (client) =>
        client.phone || "Not provided",
    },
    {
      key: "address",
      header: "Address",
      render: (client) => (
        <span className="block max-w-56 truncate">
          {client.address || "Not provided"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Added",
      render: (client) =>
        formatClientDate(client.createdAt),
    },
  ];

  function handleClientClick(client) {
    if (client?.id) {
      navigate(`/clients/${client.id}`);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            DIRECTORY
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Clients
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your firm's client records and contact information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-xl flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            aria-label="Search clients"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh clients"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              isFetching ? "animate-spin" : ""
            }
          />
        </button>
      </div>

      <div className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Users size={20} />
        </div>

        <div>
          <strong className="block text-lg font-semibold text-slate-900">
            {isLoading ? "—" : clients.length}
          </strong>

          <span className="text-xs text-slate-500">
            Total clients
          </span>
        </div>

        <div className="h-9 w-px bg-slate-200" />

        <div>
          <strong className="block text-lg font-semibold text-slate-900">
            {isLoading ? "—" : filteredClients.length}
          </strong>

          <span className="text-xs text-slate-500">
            Showing
          </span>
        </div>
      </div>

      {isError && (
        <div
          className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <div>
            <strong className="text-sm font-semibold text-red-900">
              Unable to load clients
            </strong>

            <p className="mt-1 text-sm text-red-700">
              {error?.message ||
                "Please check your connection and try again."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              All clients
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Your firm's client directory
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {filteredClients.length} records
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredClients}
          getRowKey={(client) => client.id}
          onRowClick={handleClientClick}
          isLoading={isLoading}
          loadingMessage="Loading client records..."
          emptyTitle={
            search
              ? "No matching clients"
              : "No clients yet"
          }
          emptyMessage={
            search
              ? "Try another name, email address, or phone number."
              : "Add your first client to start building your firm's directory."
          }
        />
      </div>

      {isModalOpen && (
        <ClientForm
          mode="create"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}

export default Clients;