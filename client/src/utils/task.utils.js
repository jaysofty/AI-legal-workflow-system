export const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
];

export const TASK_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export function formatTaskStatus(status = "") {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatTaskPriority(priority = "") {
  return priority
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatTaskDate(date) {
  if (!date) return "Not provided";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTaskDateTime(date) {
  if (!date) return "Not provided";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getTaskAssigneeName(user) {
  if (!user) return "Unassigned";

  return (
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    "Unknown user"
  );
}

export function getTaskMatterName(matter) {
  if (!matter) return "No matter";

  if (matter.referenceNumber && matter.title) {
    return `${matter.referenceNumber} — ${matter.title}`;
  }

  return (
    matter.title ||
    matter.referenceNumber ||
    "Unnamed matter"
  );
}

export function getTaskStatusClass(status = "") {
  const classes = {
    TODO: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    BLOCKED: "bg-red-50 text-red-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-slate-100 text-slate-500",
  };

  return classes[status] || "bg-slate-100 text-slate-600";
}

export function getTaskPriorityClass(priority = "") {
  const classes = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-50 text-blue-700",
    HIGH: "bg-amber-50 text-amber-700",
    URGENT: "bg-red-50 text-red-700",
  };

  return classes[priority] || "bg-slate-100 text-slate-600";
}

export function getTaskItems(response) {
  const payload = response?.data ?? response;

  return (
    payload?.tasks ||
    payload?.items ||
    payload?.data ||
    (Array.isArray(payload) ? payload : [])
  );
}

export function getTask(response) {
  return (
    response?.data?.task ??
    response?.task ??
    response?.data ??
    response ??
    null
  );
}