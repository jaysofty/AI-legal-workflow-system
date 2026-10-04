import { RefreshCw } from "lucide-react";

function DashboardHeader({ greeting, onRefresh, isRefreshing }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Overview
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {greeting}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s what&apos;s happening across your firm.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />

        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}

export default DashboardHeader;
