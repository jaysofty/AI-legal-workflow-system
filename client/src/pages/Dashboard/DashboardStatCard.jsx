import { ArrowUpRight } from "lucide-react";

function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon size={19} />
        </div>

        <ArrowUpRight
          size={17}
          className="text-slate-400"
        />
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default DashboardStatCard;