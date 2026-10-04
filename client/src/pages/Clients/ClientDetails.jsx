import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useClient,
  useUpdateClient,
} from "../../hooks/useClients.js";

import {
  formatClientType,
  getClientName,
} from "../../utils/client.utils.js";

import { formatDate } from "../../utils/formatters.js";

function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useClient(clientId);

  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          <p>Loading client...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="space-y-6">
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Clients
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <strong className="font-semibold text-red-900">
            Unable to load client
          </strong>

          <p className="mt-1 text-sm text-red-700">
            {error?.message ||
              "The client could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const client =
    data?.data?.client ??
    data?.client ??
    data?.data ??
    data;

  if (!client?.id) {
    return (
      <section className="space-y-6">
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Clients
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <strong className="font-semibold text-slate-900">
            Client not found
          </strong>

          <p className="mt-1 text-sm text-slate-500">
            This client record could not be found.
          </p>
        </div>
      </section>
    );
  }

  const clientName = getClientName(client);

  return (
    <section className="space-y-6">
      {/* Topbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate("/clients")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Clients
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Edit3 size={16} />
          Edit Client
        </button>
      </div>

      {/* Hero */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
            {clientName.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              CLIENT RECORD
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {clientName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span>{formatClientType(client.type)}</span>

              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                Added{" "}
                {formatDate(client.createdAt, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-semibold text-slate-900">
              Contact Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Client contact details
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <InfoRow
              icon={Mail}
              label="Email"
              value={client.email}
            />

            <InfoRow
              icon={Phone}
              label="Phone"
              value={client.phone}
            />

            <InfoRow
              icon={MapPin}
              label="Address"
              value={client.address}
            />
          </div>
        </section>

        {/* Client information */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-semibold text-slate-900">
              Client Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record information
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <InfoRow
              icon={
                client.type === "INDIVIDUAL"
                  ? Users
                  : Building2
              }
              label="Client type"
              value={formatClientType(client.type)}
            />

            <InfoRow
              icon={CalendarDays}
              label="Date added"
              value={formatDate(client.createdAt, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />

            <InfoRow
              icon={Users}
              label="Owner"
              value={
                client.owner
                  ? `${client.owner.firstName || ""} ${
                      client.owner.lastName || ""
                    }`.trim()
                  : "Not assigned"
              }
            />
          </div>
        </section>

        {/* Matters */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Related Matters
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Matters associated with this client
              </p>
            </div>

            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
              {client._count?.matters ??
                client.matters?.length ??
                0}
            </span>
          </div>

          {!client.matters ||
          client.matters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Building2 size={22} />
              </div>

              <strong className="mt-3 text-sm font-semibold text-slate-900">
                No matters yet
              </strong>

              <p className="mt-1 text-sm text-slate-500">
                Matters associated with this client will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {client.matters.map((matter) => (
                <div
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  key={matter.id}
                >
                  <div>
                    <strong className="block text-sm font-semibold text-slate-900">
                      {matter.title || "Untitled matter"}
                    </strong>

                    <span className="mt-1 block text-xs text-slate-500">
                      {matter.referenceNumber ||
                        "No reference"}
                    </span>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {formatClientType(matter.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-semibold text-slate-900">
              Internal Notes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Private notes associated with this client record
            </p>
          </div>

          <div className="pt-5 text-sm leading-6 text-slate-600">
            {client.notes || (
              <span className="text-slate-400">
                No internal notes have been added.
              </span>
            )}
          </div>
        </section>
      </div>

      {isEditing && (
        <EditClientModal
          client={client}
          onClose={() => setIsEditing(false)}
        />
      )}
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <span className="block text-xs font-medium text-slate-400">
          {label}
        </span>

        <strong className="mt-1 block break-words text-sm font-medium text-slate-700">
          {value || "Not provided"}
        </strong>
      </div>
    </div>
  );
}

function EditClientModal({ client, onClose }) {
  const updateClientMutation = useUpdateClient();

  const [form, setForm] = useState({
    type: client.type || "INDIVIDUAL",
    firstName: client.firstName || "",
    lastName: client.lastName || "",
    companyName: client.companyName || "",
    email: client.email || "",
    phone: client.phone || "",
    address: client.address || "",
    notes: client.notes || "",
  });

  const [formError, setFormError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const isIndividual = form.type === "INDIVIDUAL";

    if (
      isIndividual &&
      (!form.firstName.trim() ||
        !form.lastName.trim())
    ) {
      setFormError(
        "Enter the client's first and last name.",
      );
      return;
    }

    if (
      !isIndividual &&
      !form.companyName.trim()
    ) {
      setFormError("Enter the organization name.");
      return;
    }

    const clientData = {
      type: form.type,
    };

    if (isIndividual) {
      clientData.firstName = form.firstName.trim();
      clientData.lastName = form.lastName.trim();
    } else {
      clientData.companyName =
        form.companyName.trim();
    }

    if (form.email.trim()) {
      clientData.email = form.email.trim();
    }

    if (form.phone.trim()) {
      clientData.phone = form.phone.trim();
    }

    if (form.address.trim()) {
      clientData.address = form.address.trim();
    }

    if (form.notes.trim()) {
      clientData.notes = form.notes.trim();
    }

    try {
      await updateClientMutation.mutateAsync({
        clientId: client.id,
        clientData,
      });

      onClose();
    } catch (updateError) {
      setFormError(
        updateError?.message ||
          "Unable to update this client.",
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              CLIENT RECORD
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Edit client
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close edit form"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Client type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="INDIVIDUAL">
                Individual
              </option>
              <option value="COMPANY">Company</option>
              <option value="GOVERNMENT">
                Government
              </option>
              <option value="NGO">NGO</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {form.type === "INDIVIDUAL" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <EditField
                label="First name *"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />

              <EditField
                label="Last name *"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          ) : (
            <EditField
              label="Organization name *"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
            />
          )}

          <EditField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <EditField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <EditTextArea
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <EditTextArea
            label="Internal notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
          />

          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={updateClientMutation.isPending}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateClientMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Save size={16} />

              {updateClientMutation.isPending
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function EditField({
  label,
  name,
  type = "text",
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

function EditTextArea({
  label,
  name,
  value,
  onChange,
  rows = 2,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

export default ClientDetails;