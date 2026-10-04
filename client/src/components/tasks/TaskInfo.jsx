import {
  CalendarDays,
  ClipboardList,
  FileText,
  UserRound,
} from "lucide-react";

import {
  formatTaskDateTime,
  getTaskAssigneeName,
  getTaskMatterName,
  getTaskPriorityClass,
  formatTaskPriority,
} from "../../utils/task.utils.js";

import TaskStatusBadge from "./TaskStatusBadge.jsx";

function TaskInfo({ task }) {
  if (!task) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <ClipboardList size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </p>

            <div className="mt-2">
              <TaskStatusBadge status={task.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Priority
            </p>

            <span
              className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTaskPriorityClass(
                task.priority,
              )}`}
            >
              {formatTaskPriority(task.priority)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <UserRound size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Assigned to
            </p>

            <p className="mt-2 truncate text-sm font-medium text-slate-900">
              {getTaskAssigneeName(task.assignedTo)}
            </p>

            {task.assignedTo?.email && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {task.assignedTo.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <CalendarDays size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Due date
            </p>

            <p className="mt-2 text-sm font-medium text-slate-900">
              {formatTaskDateTime(task.dueDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:col-span-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Matter
        </p>

        <p className="mt-2 text-sm font-medium text-slate-900">
          {getTaskMatterName(task.matter)}
        </p>

        {task.matter?.status && (
          <p className="mt-1 text-xs text-slate-500">
            Matter status:{" "}
            {task.matter.status
              .toLowerCase()
              .replaceAll("_", " ")}
          </p>
        )}
      </div>
    </div>
  );
}

export default TaskInfo;