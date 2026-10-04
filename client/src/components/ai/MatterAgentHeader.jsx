import { Bot } from "lucide-react";

function MatterAgentHeader({ selectedMatter }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        <Bot size={19} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">Matter Agent</h2>

        <p className="text-xs text-slate-500">
          {selectedMatter
            ? `Working with ${selectedMatter.referenceNumber}`
            : "Select a matter to begin"}
        </p>
      </div>
    </div>
  );
}

export default MatterAgentHeader;
