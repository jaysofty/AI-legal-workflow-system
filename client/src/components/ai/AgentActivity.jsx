import { Bot, Check, FileSearch, LoaderCircle, Wrench } from "lucide-react";

function AgentActivity({ activity }) {
  if (!activity) {
    return null;
  }

  const config = getActivityConfig(activity);

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Icon
        size={14}
        className={
          config.animate ? "animate-spin text-emerald-600" : "text-emerald-600"
        }
      />

      <span>{config.label}</span>
    </div>
  );
}

function getActivityConfig(activity) {
  switch (activity.status) {
    case "CONNECTING":
      return {
        icon: LoaderCircle,
        label: "Connecting to Matter Agent...",
        animate: true,
      };

    case "ANALYZING":
      return {
        icon: Bot,
        label: "Analyzing your request...",
        animate: false,
      };

    case "TOOL_RUNNING":
      return {
        icon:
          activity.toolName === "searchMatterDocuments" ? FileSearch : Wrench,

        label: getToolRunningLabel(activity.toolName),

        animate: false,
      };

    case "TOOL_COMPLETED":
      return {
        icon: Check,

        label: `${getToolLabel(activity.toolName)} completed`,

        animate: false,
      };

    case "GENERATING":
      return {
        icon: LoaderCircle,
        label: "Preparing response...",
        animate: true,
      };

    case "COMPLETED":
      return {
        icon: Check,
        label: "Response complete",
        animate: false,
      };

    default:
      return {
        icon: LoaderCircle,
        label: "Matter Agent is working...",
        animate: true,
      };
  }
}

function getToolRunningLabel(toolName) {
  const labels = {
    getMatter: "Retrieving matter details...",
    searchMatterDocuments: "Searching matter documents...",
    getMatterTimeline: "Retrieving matter timeline...",
    createTask: "Creating task...",
    generateDocument: "Preparing document draft...",
  };

  return labels[toolName] || "Using Matter Agent tool...";
}

function getToolLabel(toolName) {
  const labels = {
    getMatter: "Matter details",
    searchMatterDocuments: "Document search",
    getMatterTimeline: "Matter timeline",
    createTask: "Task creation",
    generateDocument: "Document drafting",
  };

  return labels[toolName] || "Tool";
}

export default AgentActivity;
