import { Bot, Wrench, Check, Copy, Sparkles, Terminal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import GeneratedDraftCard from "./GeneratedDraftCard.jsx";
import { formatToolName } from "../../utils/ai.utils.js";

function AgentResult({ result, isStreaming = false, onReviewDraft }) {
  if (!result?.response && !isStreaming) {
    return null;
  }

  const isGeneratedDocument =
    result?.action === "USE_TOOL" && result?.tool?.name === "generateDocument";

  const generatedDocument = result?.tool?.result?.generatedDocument;

  const approval = result?.tool?.result?.approval;

  return (
    <div className="w-full min-w-0 animate-fadeIn">
      <div className="flex min-w-0 items-start gap-3.5">
        {/* Avatar with subtle glow if streaming */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/20 transition-all ${
            isStreaming ? "animate-pulse ring-4 ring-emerald-500/10" : ""
          }`}
        >
          <Bot size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={`relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all ${
              isStreaming
                ? "border-emerald-300/60 shadow-md shadow-emerald-500/5"
                : ""
            }`}
          >
            {/* Streaming Indicator Banner */}
            {isStreaming && (
              <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-600">
                <Sparkles size={13} className="animate-spin" />

                <span>Thinking & generating response...</span>
              </div>
            )}

            <MarkdownResponse>{result?.response || ""}</MarkdownResponse>

            {/* Live Typing Cursor */}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-emerald-500" />
            )}
          </div>

          {/* Generated legal document */}
          {!isStreaming && isGeneratedDocument && generatedDocument && (
            <GeneratedDraftCard
              generatedDocument={generatedDocument}
              approval={approval}
              onReview={() =>
                onReviewDraft?.({
                  generatedDocument,
                  approval,
                })
              }
            />
          )}

          {result?.action && <AgentMetadata result={result} />}
        </div>
      </div>
    </div>
  );
}

function MarkdownResponse({ children }) {
  return (
    <div className="min-w-0 max-w-full break-words text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3.5 mt-5 text-xl font-bold tracking-tight text-slate-900 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-base font-semibold tracking-tight text-slate-900 first:mt-0 border-b border-slate-100 pb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-900 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3.5 break-words text-sm leading-relaxed text-slate-600 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3.5 list-disc space-y-1.5 pl-5 text-sm text-slate-600 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3.5 list-decimal space-y-1.5 pl-5 text-sm text-slate-600 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="break-words leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-slate-600 italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3.5 rounded-r-lg border-l-4 border-emerald-500 bg-emerald-50/60 px-4 py-2.5 text-sm text-slate-700">
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="break-all rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-emerald-700 font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          table: ({ children }) => (
            <div className="my-4 w-full max-w-full overflow-x-auto rounded-lg border border-slate-200 shadow-xs">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 text-slate-700">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-slate-50/50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border-b border-slate-200 px-4 py-3 align-middle font-semibold text-slate-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="max-w-md break-words px-4 py-3 align-middle text-slate-600">
              {children}
            </td>
          ),
          hr: () => <hr className="my-5 border-slate-100" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

// Upgraded CodeBlock with Copy Action
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl bg-slate-900 text-slate-100 shadow-md">
      <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2 text-xs text-slate-400 border-b border-slate-700/50">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Terminal size={13} className="text-emerald-400" />
          <span>code snippet</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md bg-slate-700/50 px-2 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          {copied ? (
            <Check size={12} className="text-emerald-400" />
          ) : (
            <Copy size={12} />
          )}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

function AgentMetadata({ result }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 border border-slate-200/60 shadow-2xs">
        {result.action === "USE_TOOL"
          ? "Tool-assisted response"
          : "AI response"}
      </span>

      {result.tool?.name && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200/50 shadow-2xs">
          <Wrench size={11} />
          <span>{formatToolName(result.tool.name)}</span>
        </span>
      )}
    </div>
  );
}

export default AgentResult;
