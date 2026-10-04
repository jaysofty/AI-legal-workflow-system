import { X } from "lucide-react";

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`flex max-h-[90vh] w-full ${sizeClasses[size] || sizeClasses.md} flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="min-w-0 pr-6">
            <h2
              id="modal-title"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1.5 text-sm leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;