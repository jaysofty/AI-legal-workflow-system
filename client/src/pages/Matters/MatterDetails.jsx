import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  FolderOpen,
  MapPin,
  Pencil,
  Scale,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useMatter } from "../../hooks/useMatters.js";
import MatterForm from "../../components/matters/MatterForm.jsx";
import MatterSection from "../../components/matters/MatterSection.jsx";

import {
  formatMatterDate,
  formatMatterStatus,
  formatMatterType,
  getMatterClientName,
  getMatterStatusClass,
} from "../../utils/matter.utils.js";

function getMatter(response) {
  return (
    response?.data?.matter ??
    response?.matter ??
    response?.data ??
    response ??
    null
  );
}

function MatterDetails() {
  const navigate = useNavigate();
  const { matterId } = useParams();
  const [editing, setEditing] = useState(false);

  const query = useMatter(matterId);
  const matter = getMatter(query.data);

  if (query.isLoading) {
    return <PageState message="Loading matter..." />;
  }

  if (query.isError) {
    return (
      <PageState
        title="Unable to load matter"
        message={
          query.error?.message ||
          "Something went wrong while loading this matter."
        }
        action={
          <button
            type="button"
            onClick={() => query.refetch()}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white"
          >
            Try again
          </button>
        }
      />
    );
  }

  if (!matter) {
    return (
      <PageState
        title="Matter not found"
        message="The matter may have been removed or you may not have access to it."
        action={
          <button
            type="button"
            onClick={() => navigate("/matters")}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
          >
            Back to matters
          </button>
        }
      />
    );
  }

  const client = matter.client;
  const parties = matter.parties || [];

  return (
    <section className="mx-auto max-w-7xl p-4 sm:p-6">
      <button
        type="button"
        onClick={() => navigate("/matters")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to matters
      </button>

      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            {matter.referenceNumber}
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {matter.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <StatusBadge status={matter.status} />

            <span>{formatMatterType(matter.type)}</span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} />
              Opened {formatMatterDate(matter.openedAt)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Pencil size={16} />
          Edit Matter
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <MatterSection
            icon={<FileText size={17} />}
            title="Matter Overview"
            description="Key information about this matter."
          >
            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <Detail label="Client">
                {client?.id ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/clients/${client.id}`)
                    }
                    className="font-medium hover:text-emerald-600"
                  >
                    {getMatterClientName(client)}
                  </button>
                ) : (
                  "No client"
                )}
              </Detail>

              <Detail label="Matter Type">
                {formatMatterType(matter.type)}
              </Detail>

              <Detail label="Jurisdiction">
                {matter.jurisdiction || "Not provided"}
              </Detail>

              <Detail label="Court">
                {matter.court || "Not provided"}
              </Detail>

              <Detail label="Court Number">
                {matter.courtNumber || "Not provided"}
              </Detail>

              <Detail label="Opened">
                {formatMatterDate(matter.openedAt)}
              </Detail>
            </div>

            <div className="border-t border-slate-100 p-6">
              <Detail label="Description">
                {matter.description || "No description has been added."}
              </Detail>
            </div>
          </MatterSection>

          <MatterSection
            icon={<Users size={17} />}
            title="Parties"
            description="People and organisations connected to this matter."
          >
            {parties.length ? (
              <div className="divide-y divide-slate-100">
                {parties.map((party) => (
                  <div
                    key={party.id}
                    className="flex items-center gap-3 px-6 py-4"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Users size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {party.name || "Unnamed party"}
                      </p>

                      {party.role && (
                        <p className="text-xs text-slate-500">
                          {party.role}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-sm text-slate-500">
                No opposing parties have been recorded.
              </p>
            )}
          </MatterSection>
        </div>

        <aside className="space-y-6">
          <MatterSection
            icon={<Scale size={17} />}
            title="Matter Status"
            description="Current lifecycle state."
          >
            <div className="p-6">
              <StatusBadge status={matter.status} large />

              <p className="mt-4 text-xs leading-5 text-slate-500">
                AI can assist with preparation and workflow,
                while important legal decisions remain with
                the legal team.
              </p>
            </div>
          </MatterSection>

          <MatterSection
            icon={<FolderOpen size={17} />}
            title="Workspace"
            description="Matter resources."
          >
            <WorkspaceItem
              icon={<FileText size={17} />}
              label="Documents"
              value={matter.documents?.length || 0}
            />

            <WorkspaceItem
              icon={<MapPin size={17} />}
              label="Tasks"
              value={matter.tasks?.length || 0}
            />
          </MatterSection>
        </aside>
      </div>

      {editing && (
        <MatterForm
          matter={matter}
          mode="edit"
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 text-sm text-slate-700">
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status, large = false }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 ${
        large ? "text-sm" : "text-xs"
      } font-medium ${getMatterStatusClass(status)}`}
    >
      {formatMatterStatus(status)}
    </span>
  );
}

function WorkspaceItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 last:border-0">
      <span className="text-slate-400">{icon}</span>
      <span className="text-sm text-slate-600">{label}</span>
      <strong className="ml-auto text-sm text-slate-900">
        {value}
      </strong>
    </div>
  );
}

function PageState({ title, message, action }) {
  return (
    <section className="mx-auto max-w-7xl p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        {title && (
          <h2 className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
        )}

        <p className="mt-2 text-sm text-slate-500">
          {message}
        </p>

        {action && <div className="mt-5">{action}</div>}
      </div>
    </section>
  );
}

export default MatterDetails;