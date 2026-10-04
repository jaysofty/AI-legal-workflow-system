import {
  AlertTriangle,
  Check,
  FileText,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function DraftReviewModal({
  draft,
  approval,
  isSubmitting = false,
  onClose,
  onApprove,
  onReject,
}) {
  const [decision, setDecision] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!draft) {
      return;
    }

    setDecision(null);
    setNotes("");
  }, [draft?.id]);

  useEffect(() => {
    if (!draft) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [draft, isSubmitting, onClose]);

  if (!draft) {
    return null;
  }

  const status = approval?.status || "PENDING";
  const isPending = status === "PENDING";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";

  function handleConfirm() {
    if (decision === "APPROVED") {
      onApprove(notes);
      return;
    }

    if (decision === "REJECTED") {
      onReject(notes);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileText size={20} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900">
                  Review AI-Generated Draft
                </h2>

                <StatusBadge status={status} />
              </div>

              <p className="mt-1 truncate text-sm text-slate-500">
                {draft.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close draft review"
          >
            <X size={19} />
          </button>
        </div>

        {/* Human review warning */}
        <div className="shrink-0 border-b border-amber-100 bg-amber-50 px-6 py-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-amber-600" />

            <div>
              <p className="text-xs font-semibold text-amber-900">
                AI prepares; humans decide.
              </p>

              <p className="mt-0.5 text-xs leading-5 text-amber-800">
                Review the complete draft and verify its factual and legal
                content before approving it for use.
              </p>
            </div>
          </div>
        </div>

        {/* Document */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">
            <DraftContent content={draft.content} />
          </div>
        </div>

        {/* Review controls */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
          {isPending ? (
            <>
              {decision && (
                <div className="mb-4">
                  <label
                    htmlFor="approval-notes"
                    className="mb-1.5 block text-xs font-medium text-slate-700"
                  >
                    {decision === "REJECTED"
                      ? "Reason for rejection"
                      : "Review notes"}
                  </label>

                  <textarea
                    id="approval-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    placeholder={
                      decision === "REJECTED"
                        ? "Explain what needs to be corrected or revised..."
                        : "Add optional notes about your review..."
                    }
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <AlertTriangle
                    size={15}
                    className="mt-0.5 shrink-0 text-amber-500"
                  />

                  <span>
                    Approval confirms that a human reviewer has reviewed this
                    AI-generated draft.
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!decision && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDecision("REJECTED")}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => setDecision("APPROVED")}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={16} />
                        Approve Draft
                      </button>
                    </>
                  )}

                  {decision && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDecision(null);
                          setNotes("");
                        }}
                        disabled={isSubmitting}
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={
                          isSubmitting ||
                          (decision === "REJECTED" && !notes.trim())
                        }
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          decision === "APPROVED"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {isSubmitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : decision === "APPROVED" ? (
                          <Check size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}

                        {isSubmitting
                          ? "Saving..."
                          : decision === "APPROVED"
                            ? "Confirm Approval"
                            : "Confirm Rejection"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <CompletedReview
              approved={isApproved}
              rejected={isRejected}
              notes={approval?.notes}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DraftContent({ content }) {
  return (
    <div className="min-w-0 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-xl font-bold text-slate-900 first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 first:mt-0">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-base font-semibold text-slate-900">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="mb-4 text-sm leading-7 text-slate-700 last:mb-0">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-700">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-2 pl-6 text-sm leading-7 text-slate-700">
              {children}
            </ol>
          ),

          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
              {children}
            </blockquote>
          ),

          table: ({ children }) => (
            <div className="my-5 max-w-full overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-slate-50">{children}</thead>
          ),

          th: ({ children }) => (
            <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-800">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-b border-slate-100 px-4 py-3 align-top leading-6 text-slate-600">
              {children}
            </td>
          ),

          hr: () => <hr className="my-6 border-slate-200" />,
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-red-200 bg-red-50 text-red-700",
  };

  const labels = {
    PENDING: "Pending review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || styles.PENDING
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function CompletedReview({ approved, rejected, notes, onClose }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div
          className={`flex items-center gap-2 text-sm font-medium ${
            approved ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {approved ? <Check size={16} /> : <XCircle size={16} />}

          {approved
            ? "This draft has been approved."
            : rejected
              ? "This draft has been rejected."
              : "Review completed."}
        </div>

        {notes && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            {notes}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        Close
      </button>
    </div>
  );
}

export default DraftReviewModal;
