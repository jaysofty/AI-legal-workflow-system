import { BriefcaseBusiness, ChevronDown, ShieldCheck } from "lucide-react";

import {
  formatMatterStatus,
  formatMatterType,
} from "../../utils/matter.utils.js";

function MatterContextPanel({
  matters,
  selectedMatterId,
  selectedMatter,
  onMatterChange,
  isLoading,
  error,
}) {
  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness size={17} className="text-slate-400" />

          <h2 className="text-sm font-semibold text-slate-900">
            Matter Context
          </h2>
        </div>

        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          Select the legal matter the AI should work with.
        </p>
      </div>

      <div className="p-5">
        <label
          htmlFor="ai-matter"
          className="text-xs font-semibold uppercase tracking-wide text-slate-400"
        >
          Matter
        </label>

        <div className="relative mt-2">
          <select
            id="ai-matter"
            value={selectedMatterId}
            onChange={(event) => onMatterChange(event.target.value)}
            disabled={isLoading}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
          >
            <option value="">
              {isLoading ? "Loading matters..." : "Select a matter"}
            </option>

            {matters.map((matter) => (
              <option key={matter.id} value={matter.id}>
                {matter.referenceNumber} — {matter.title}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        {selectedMatter ? (
          <MatterContext matter={selectedMatter} />
        ) : (
          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-xs leading-5 text-slate-500">
              Matter-specific AI tools remain unavailable until you select a
              matter.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-5">
        <div className="flex gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-xs font-semibold text-slate-700">
              Human-controlled workflow
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              AI prepares. Humans decide. Legal judgment and approval remain
              with the legal team.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MatterContext({ matter }) {
  return (
    <div className="mt-5 space-y-4 rounded-lg border border-slate-100 p-4">
      <div>
        <p className="text-xs font-semibold text-emerald-600">
          {matter.referenceNumber}
        </p>

        <p className="mt-1 text-sm font-medium leading-5 text-slate-900">
          {matter.title}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ContextItem label="Type" value={formatMatterType(matter.type)} />

        <ContextItem label="Status" value={formatMatterStatus(matter.status)} />
      </div>
    </div>
  );
}

function ContextItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-700">{value || "Not provided"}</p>
    </div>
  );
}

export default MatterContextPanel;
