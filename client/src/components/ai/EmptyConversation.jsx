import { Scale } from "lucide-react";

const suggestions = [
  "Summarize this matter",
  "What is the current status?",
  "Show me the matter timeline",
  "Search the matter documents",
];

function EmptyConversation({ hasMatter, onSuggestionClick }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Scale size={22} />
      </div>

      <h2 className="mt-4 text-base font-semibold text-slate-900">
        {hasMatter
          ? "How can the Matter Agent help?"
          : "Select a matter to begin"}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasMatter
          ? "Ask questions about the matter, retrieve verified information, search documents, or review the matter timeline."
          : "Choose a matter from the Matter Context panel so the agent can work within the correct legal context."}
      </p>

      {hasMatter && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              {suggestion}
            </Suggestion>
          ))}
        </div>
      )}
    </div>
  );
}

function Suggestion({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
    >
      {children}
    </button>
  );
}

export default EmptyConversation;
