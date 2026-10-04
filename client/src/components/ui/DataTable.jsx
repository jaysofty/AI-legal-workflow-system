import EmptyState from "./EmptyState.jsx";

function DataTable({
  columns,
  data = [],
  getRowKey,
  onRowClick,
  isLoading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No records found.",
  emptyTitle = "No records",
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500">
          {loadingMessage}
        </p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`whitespace-nowrap px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left"
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr
              key={getRowKey(row, index)}
              onClick={
                onRowClick
                  ? () => onRowClick(row)
                  : undefined
              }
              className={
                onRowClick
                  ? "cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                  : "border-b border-slate-100"
              }
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 text-sm text-slate-700 ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
                  {column.render
                    ? column.render(row)
                    : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;