import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/ui/Button.jsx";
import Modal from "../../components/ui/Modal.jsx";
import TaskForm from "../../components/tasks/TaskForm.jsx";
import TaskInfo from "../../components/tasks/TaskInfo.jsx";

import {
  useDeleteTask,
  useTask,
  useUpdateTask,
} from "../../hooks/useTasks.js";
import { useMatters } from "../../hooks/useMatters.js";
import { useUsers } from "../../hooks/useUsers.js";

import {
  formatTaskDateTime,
  getTask,
} from "../../utils/task.utils.js";

function TaskDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: taskResponse,
    isLoading,
    isError,
    error,
  } = useTask(id);

const { data: mattersResponse } = useMatters();
const { data: usersResponse } = useUsers();

  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();

  const task = getTask(taskResponse);

  const matters = mattersResponse?.data?.matters || [];
const users = usersResponse?.data?.users || [];

  const statusOptions = [
    { value: "TODO", label: "To do" },
    { value: "IN_PROGRESS", label: "In progress" },
    { value: "BLOCKED", label: "Blocked" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  async function handleStatusChange(status) {
    if (!task || status === task.status) {
      setIsStatusOpen(false);
      return;
    }

    await updateTaskMutation.mutateAsync({
      taskId: task.id,
      taskData: {
        status,
      },
    });

    setIsStatusOpen(false);
  }

  async function handleEditTask(taskData) {
    await updateTaskMutation.mutateAsync({
      taskId: task.id,
      taskData,
    });

    setIsEditOpen(false);
  }

  async function handleDeleteTask() {
    await deleteTaskMutation.mutateAsync(task.id);

    navigate("/tasks", { replace: true });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />

        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="space-y-5">
        <Button
          variant="ghost"
          onClick={() => navigate("/tasks")}
        >
          <ArrowLeft size={17} />
          Back to tasks
        </Button>

        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            Unable to load this task.
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error?.message || "The task could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/tasks")}
          >
            <ArrowLeft size={17} />
            Back to tasks
          </Button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Task
                </p>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {task.title}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Created {formatTaskDateTime(task.createdAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditOpen(true)}
                  disabled={
                    updateTaskMutation.isPending ||
                    deleteTaskMutation.isPending
                  }
                >
                  <Pencil size={16} />
                  Edit
                </Button>

                <Button
                  variant="danger"
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={
                    updateTaskMutation.isPending ||
                    deleteTaskMutation.isPending
                  }
                >
                  <Trash2 size={16} />
                  Delete
                </Button>

                <div className="relative">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setIsStatusOpen((current) => !current)
                    }
                    disabled={
                      updateTaskMutation.isPending ||
                      deleteTaskMutation.isPending
                    }
                  >
                    {updateTaskMutation.isPending
                      ? "Updating..."
                      : "Change status"}

                    <ChevronDown size={16} />
                  </Button>

                  {isStatusOpen && (
                    <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
                      {statusOptions.map((option) => {
                        const isCurrent =
                          option.value === task.status;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                option.value,
                              )
                            }
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <span>{option.label}</span>

                            {isCurrent && (
                              <Check
                                size={16}
                                className="text-slate-900"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-slate-900">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {task.description ||
                  "No description provided."}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-semibold text-slate-900">
                Task information
              </h2>

              <TaskInfo task={task} />
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
              <span>
                Created {formatTaskDateTime(task.createdAt)}
              </span>

              <span>
                Updated {formatTaskDateTime(task.updatedAt)}
              </span>

              {task.completedAt && (
                <span>
                  Completed{" "}
                  {formatTaskDateTime(task.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isEditOpen}
        onClose={() => {
          if (!updateTaskMutation.isPending) {
            setIsEditOpen(false);
          }
        }}
        title="Edit task"
        description="Update the task details, assignment, priority, or deadline."
        size="lg"
      >
        <TaskForm
          initialValues={task}
          matters={matters}
          users={users}
          onSubmit={handleEditTask}
          onCancel={() => setIsEditOpen(false)}
          isSubmitting={updateTaskMutation.isPending}
          isEditing
        />
      </Modal>

      <Modal
        open={isDeleteOpen}
        onClose={() => {
          if (!deleteTaskMutation.isPending) {
            setIsDeleteOpen(false);
          }
        }}
        title="Delete task"
        description="This action cannot be undone."
        size="sm"
      >
        <div>
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">
              Delete "{task.title}"?
            </p>

            <p className="mt-1 text-sm leading-6 text-red-700">
              The task will be permanently removed from your
              workspace.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteTaskMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={handleDeleteTask}
              loading={deleteTaskMutation.isPending}
            >
              Delete task
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default TaskDetails;