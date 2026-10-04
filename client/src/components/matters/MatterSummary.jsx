import { FileText } from "lucide-react";

function MatterSummary({
  total,
  active,
  intake,
  loading,
}) {
  const items = [
    {
      label: "Total matters",
      value: total,
      icon: <FileText size={18} />,
    },
    {
      label: "Active",
      value: active,
      dot: "bg-emerald-500",
    },
    {
      label: "Intake",
      value: intake,
      dot: "bg-amber-500",
    },
  ];

  return (
    <div className="mb-6 grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 p-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            {item.dot ? (
              <span
                className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
              />
            ) : (
              item.icon
            )}
          </div>

          <div>
            <p className="text-xl font-semibold text-slate-900">
              {loading ? "—" : item.value}
            </p>

            <p className="text-xs text-slate-500">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MatterSummary;