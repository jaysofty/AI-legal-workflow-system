import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function GeneratedDraftCard({ generatedDocument, approval, onReview }) {
  if (!generatedDocument) {
    return null;
  }

  const isPending = approval?.status === "PENDING";
  const isApproved = approval?.status === "APPROVED";
  const isRejected = approval?.status === "REJECTED";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <FileText size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              AI-generated draft
            </p>

            <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-900">
              {generatedDocument.name}
            </h3>
          </div>
        </div>

        <ApprovalBadge status={approval?.status} />
      </div>

      <div className="p-4">
        <DraftPreview content={generatedDocument.content} />

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-600" />

          <p className="text-xs leading-5 text-amber-800">
            {isPending &&
              "This document was prepared by AI and requires human lawyer review before use."}

            {isApproved &&
              "This document has been reviewed and approved by an authorized user."}

            {isRejected &&
              "This document was reviewed and rejected and should not be used."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 size={14} />

            <span>
              {isPending ? "Human review required" : "Human review completed"}
            </span>
          </div>

          <button
            type="button"
            onClick={onReview}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            {isPending ? "Review Draft" : "View Draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DraftPreview({ content }) {
  if (!content) {
    return (
      <p className="text-sm text-slate-500">No draft content available.</p>
    );
  }

  return (
    <div className="relative max-h-48 overflow-hidden">
      <div className="min-w-0 text-sm leading-6 text-slate-600">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <p className="mb-2 font-semibold text-slate-900">{children}</p>
            ),

            h2: ({ children }) => (
              <p className="mb-2 font-semibold text-slate-900">{children}</p>
            ),

            h3: ({ children }) => (
              <p className="mb-2 font-semibold text-slate-900">{children}</p>
            ),

            h4: ({ children }) => (
              <p className="mb-2 font-semibold text-slate-900">{children}</p>
            ),

            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,

            strong: ({ children }) => (
              <strong className="font-semibold text-slate-800">
                {children}
              </strong>
            ),

            ul: ({ children }) => (
              <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>
            ),

            ol: ({ children }) => (
              <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>
            ),

            li: ({ children }) => <li>{children}</li>,

            blockquote: ({ children }) => (
              <blockquote className="mb-2 border-l-2 border-slate-300 pl-3 text-slate-500">
                {children}
              </blockquote>
            ),

            hr: () => <hr className="my-3 border-slate-200" />,

            code: ({ children }) => (
              <code className="whitespace-pre-wrap break-words font-mono text-xs text-slate-700">
                {children}
              </code>
            ),

            pre: ({ children }) => (
              <pre className="mb-2 overflow-hidden whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                {children}
              </pre>
            ),

            table: ({ children }) => (
              <div className="mb-3 overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-xs">
                  {children}
                </table>
              </div>
            ),

            thead: ({ children }) => (
              <thead className="bg-slate-50">{children}</thead>
            ),

            th: ({ children }) => (
              <th className="border border-slate-200 px-2 py-1.5 font-semibold text-slate-700">
                {children}
              </th>
            ),

            td: ({ children }) => (
              <td className="border border-slate-200 px-2 py-1.5 align-top">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

function ApprovalBadge({ status }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",

    APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",

    REJECTED: "bg-red-50 text-red-700 ring-red-200",
  };

  const labels = {
    PENDING: "Pending review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };

  const currentStatus = status || "PENDING";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${
        styles[currentStatus] || styles.PENDING
      }`}
    >
      {labels[currentStatus] || currentStatus}
    </span>
  );
}

export default GeneratedDraftCard;
