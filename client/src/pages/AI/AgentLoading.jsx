import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function AgentResult({ result }) {
  if (!result?.response) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Bot size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="break-words text-sm leading-6 text-slate-700">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="mb-3 mt-4 text-lg font-semibold text-slate-900 first:mt-0">
                      {children}
                    </h1>
                  ),

                  h2: ({ children }) => (
                    <h2 className="mb-2 mt-4 text-base font-semibold text-slate-900 first:mt-0">
                      {children}
                    </h2>
                  ),

                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-3 text-sm font-semibold text-slate-900 first:mt-0">
                      {children}
                    </h3>
                  ),

                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0">{children}</p>
                  ),

                  ul: ({ children }) => (
                    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
                      {children}
                    </ul>
                  ),

                  ol: ({ children }) => (
                    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
                      {children}
                    </ol>
                  ),

                  li: ({ children }) => <li className="pl-1">{children}</li>,

                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900">
                      {children}
                    </strong>
                  ),

                  em: ({ children }) => <em className="italic">{children}</em>,

                  blockquote: ({ children }) => (
                    <blockquote className="my-3 border-l-2 border-emerald-300 pl-3 text-slate-600">
                      {children}
                    </blockquote>
                  ),

                  code: ({ children }) => (
                    <code className="rounded bg-slate-200 px-1 py-0.5 text-xs text-slate-800">
                      {children}
                    </code>
                  ),

                  hr: () => <hr className="my-4 border-slate-200" />,
                }}
              >
                {result.response}
              </ReactMarkdown>
            </div>
          </div>

          {result.action && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                {result.action === "USE_TOOL"
                  ? "Tool-assisted response"
                  : "AI response"}
              </span>

              {result.tool?.name && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                  {formatToolName(result.tool.name)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatToolName(toolName) {
  const names = {
    getMatter: "Matter details",
    searchMatterDocuments: "Document search",
    getMatterTimeline: "Matter timeline",
    createTask: "Task creation",
    generateDocument: "Document drafting",
  };

  return names[toolName] || toolName;
}

export default AgentResult;
