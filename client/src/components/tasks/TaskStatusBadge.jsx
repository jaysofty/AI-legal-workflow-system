import {
  formatTaskStatus,
  getTaskStatusClass,
} from "../../utils/task.utils.js";

function TaskStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTaskStatusClass(
        status,
      )}`}
    >
      {formatTaskStatus(status)}
    </span>
  );
}

export default TaskStatusBadge;