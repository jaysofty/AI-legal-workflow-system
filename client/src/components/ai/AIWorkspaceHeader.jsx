import { Sparkles } from "lucide-react";

function AIWorkspaceHeader() {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <Sparkles size={17} />

        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
          LegalFlow AI
        </span>
      </div>

      <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
        AI Workspace
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Work with your matters using AI-assisted retrieval, drafting and
        workflow tools.
      </p>
    </header>
  );
}

export default AIWorkspaceHeader;
