import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import FormSelect from "../../components/forms/FormSelect.jsx";
import Modal from "../../components/ui/Modal.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";

import TaskForm from "../../components/tasks/TaskForm.jsx";
import TaskStatusBadge from "../../components/tasks/TaskStatusBadge.jsx";

import { useCreateTask, useTasks } from "../../hooks/useTasks.js";

import { useMatters } from "../../hooks/useMatters.js";
import { useUsers } from "../../hooks/useUsers.js";

import {
  formatTaskDate,
  getTaskAssigneeName,
  getTaskItems,
  getTaskMatterName,
  getTaskPriorityClass,
  formatTaskPriority,
} from "../../utils/task.utils.js";

function Tasks() {
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [matterId, setMatterId] = useState("");

  const filters = useMemo(
    () => ({
      ...(status && { status }),
      ...(priority && { priority }),
      ...(matterId && { matterId }),
    }),
    [status, priority, matterId],
  );

  const { data: tasksResponse, isLoading, isError, error } = useTasks(filters);

  const { data: mattersResponse } = useMatters();
  const { data: usersResponse } = useUsers();

  const createTaskMutation = useCreateTask();

  const tasks = getTaskItems(tasksResponse);
  const matters = mattersResponse?.data?.matters || [];
  const users = usersResponse?.data?.users || [];

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tasks;

    return tasks.filter((task) => {
      const assignee = getTaskAssigneeName(task.assignedTo);
      const matter = getTaskMatterName(task.matter);

      return [task.title, task.description, assignee, matter]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [tasks, search]);

  async function handleCreateTask(taskData) {
    await createTaskMutation.mutateAsync(taskData);

    setIsCreateOpen(false);
  }

  const columns = [
    {
      key: "title",
      header: "Task",
      render: (task) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{task.title}</p>

          {task.description && (
            <p className="mt-1 max-w-md truncate text-xs text-slate-500">
              {task.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "matter",
      header: "Matter",
      render: (task) => (
        <span className="text-sm text-slate-600">
          {getTaskMatterName(task.matter)}
        </span>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned to",
      render: (task) => (
        <span className="text-sm text-slate-600">
          {getTaskAssigneeName(task.assignedTo)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (task) => <TaskStatusBadge status={task.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (task) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTaskPriorityClass(
            task.priority,
          )}`}
        >
          {formatTaskPriority(task.priority)}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      render: (task) => (
        <span className="text-sm text-slate-600">
          {formatTaskDate(task.dueDate)}
        </span>
      ),
    },
  ];

  const statusOptions = [
    { id: "TODO", label: "To do" },
    { id: "IN_PROGRESS", label: "In progress" },
    { id: "BLOCKED", label: "Blocked" },
    { id: "COMPLETED", label: "Completed" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  const priorityOptions = [
    { id: "LOW", label: "Low" },
    { id: "MEDIUM", label: "Medium" },
    { id: "HIGH", label: "High" },
    { id: "URGENT", label: "Urgent" },
  ];

  const matterOptions = matters.map((matter) => ({
    id: matter.id,
    label: matter.referenceNumber
      ? `${matter.referenceNumber} — ${matter.title}`
      : matter.title,
  }));

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Manage work, assignments, priorities, and deadlines across your matters."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={17} />
            New task
          </Button>
        }
      />

      <div className="mt-6 space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[620px]">
            <FormSelect
              id="task-status-filter"
              name="status"
              label=""
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={statusOptions}
              getOptionLabel={(option) => option.label}
              placeholder="All statuses"
            />

            <FormSelect
              id="task-priority-filter"
              name="priority"
              label=""
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              options={priorityOptions}
              getOptionLabel={(option) => option.label}
              placeholder="All priorities"
            />

            <FormSelect
              id="task-matter-filter"
              name="matterId"
              label=""
              value={matterId}
              onChange={(event) => setMatterId(event.target.value)}
              options={matterOptions}
              getOptionLabel={(option) => option.label}
              placeholder="All matters"
            />
          </div>
        </div>

        {isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-700">
              Unable to load tasks.
            </p>
            <p className="mt-1 text-sm text-red-600">
              {error?.message || "Something went wrong. Please try again."}
            </p>
          </div>
        ) : !isLoading && filteredTasks.length === 0 ? (
          <EmptyState
            title={
              search || status || priority || matterId
                ? "No matching tasks"
                : "No tasks yet"
            }
            description={
              search || status || priority || matterId
                ? "Try adjusting your search or filters."
                : "Create your first task to start managing legal work."
            }
            action={
              !search && !status && !priority && !matterId ? (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus size={17} />
                  Create task
                </Button>
              ) : null
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredTasks}
            loading={isLoading}
            getRowKey={(task) => task.id}
            onRowClick={(task) => navigate(`/tasks/${task.id}`)}
          />
        )}
      </div>

      <Modal
        open={isCreateOpen}
        onClose={() => {
          if (!createTaskMutation.isPending) {
            setIsCreateOpen(false);
          }
        }}
        title="Create task"
        description="Create a task and assign it to a matter or team member."
        size="lg"
      >
        <div className="w-full min-w-0">
          <TaskForm
            matters={matters}
            users={users}
            onSubmit={handleCreateTask}
            onCancel={() => setIsCreateOpen(false)}
            isSubmitting={createTaskMutation.isPending}
          />
        </div>
      </Modal>
    </>
  );
}

export default Tasks;
