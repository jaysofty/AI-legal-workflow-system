import { Bot } from "lucide-react";

function AgentLoading() {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Bot size={18} />
      </div>

      <div className="rounded-2xl rounded-tl-md bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <TypingDots />

          <span className="text-xs text-slate-500">
            Matter Agent is working
          </span>
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
    </div>
  );
}

export default AgentLoading;
