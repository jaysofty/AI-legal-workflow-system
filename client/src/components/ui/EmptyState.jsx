function EmptyState({
  icon,
  title,
  message,
  action,
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {icon}
        </div>
      )}

      {title && (
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          {title}
        </h3>
      )}

      {message && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {message}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;