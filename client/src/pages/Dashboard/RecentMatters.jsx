import { ArrowRight, BriefcaseBusiness, CalendarDays } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { formatLabel, formatDate } from "../../utils/formatters.js";
import { getClientName } from "../../utils/client.utils.js";
import { getMatterStatusClass } from "../../utils/matter.utils.js";

function RecentMatters({ matters = [] }) {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">Recent Matters</h2>

          <p className="mt-1 text-xs text-slate-500">
            Recently created or updated matters.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/matters")}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          View all
          <ArrowRight size={15} />
        </button>
      </div>

      {matters.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          No matters found.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {matters.map((matter) => (
            <button
              type="button"
              key={matter.id}
              onClick={() => navigate(`/matters/${matter.id}`)}
              className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <BriefcaseBusiness size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {matter.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {matter.referenceNumber} · {getClientName(matter.client)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-13 sm:pl-0">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${getMatterStatusClass(
                    matter.status,
                  )}`}
                >
                  {formatLabel(matter.status)}
                </span>

                <span className="hidden items-center gap-1 text-xs text-slate-400 md:flex">
                  <CalendarDays size={13} />
                  {formatDate(matter.updatedAt)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentMatters;
