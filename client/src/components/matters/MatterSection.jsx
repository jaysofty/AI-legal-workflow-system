function MatterSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </span>

          <div>
            <h2 className="font-semibold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-0.5 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

export default MatterSection;