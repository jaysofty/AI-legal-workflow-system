import { SendHorizontal } from "lucide-react";

function AgentComposer({
  message,
  onMessageChange,
  onSubmit,
  disabled,
  isPending,
}) {
  const cannotSend = disabled || !message.trim() || isPending;

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      if (!cannotSend) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <form onSubmit={onSubmit} className="mx-auto max-w-4xl">
        <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-50">
          <textarea
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isPending}
            rows={1}
            placeholder={
              disabled
                ? "Select a matter to begin..."
                : isPending
                  ? "Matter Agent is working..."
                  : "Ask the Matter Agent..."
            }
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
          />

          <button
            type="submit"
            disabled={cannotSend}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <SendHorizontal size={17} />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4 px-1">
          <p className="text-[11px] text-slate-400">
            Enter to send · Shift + Enter for a new line
          </p>

          <p className="text-right text-[11px] text-slate-400">
            AI prepares. Humans decide.
          </p>
        </div>
      </form>
    </div>
  );
}

export default AgentComposer;
