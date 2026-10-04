
import { useEffect, useState } from "react";

import Button from "../ui/Button.jsx";
import FormField from "../forms/FormField.jsx";
import FormSelect from "../forms/FormSelect.jsx";
import FormTextArea from "../forms/FormTextArea.jsx";

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../../utils/task.utils.js";

function TaskForm({
  initialValues,
  matters = [],
  users = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    matterId: "",
    assignedToId: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  });

  useEffect(() => {
    if (!initialValues) return;

    setForm({
      title: initialValues.title || "",
      description: initialValues.description || "",
      matterId: initialValues.matterId || "",
      assignedToId: initialValues.assignedToId || "",
      status: initialValues.status || "TODO",
      priority: initialValues.priority || "MEDIUM",
      dueDate: initialValues.dueDate
        ? initialValues.dueDate.slice(0, 10)
        : "",
    });
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      matterId: form.matterId || undefined,
      assignedToId: form.assignedToId || undefined,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate
        ? new Date(`${form.dueDate}T12:00:00`).toISOString()
        : undefined,
    });
  }

  const matterOptions = matters.map((matter) => ({
    id: matter.id,
    label: matter.referenceNumber
      ? `${matter.referenceNumber} — ${matter.title}`
      : matter.title,
  }));

  const userOptions = users.map((user) => ({
    id: user.id,
    label:
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.email,
  }));

  const statusOptions = TASK_STATUSES.map((status) => ({
    id: status,
    label: status
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));

  const priorityOptions = TASK_PRIORITIES.map((priority) => ({
    id: priority,
    label:
      priority.charAt(0) + priority.slice(1).toLowerCase(),
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 space-y-6"
    >
      {/* Task details */}
      <div className="grid grid-cols-1 gap-5">
        <div className="min-w-0">
          <FormField
            id="title"
            name="title"
            label="Task title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Review statement of claim"
            required
          />
        </div>

        <div className="min-w-0">
          <FormTextArea
            id="description"
            name="description"
            label="Description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add any relevant instructions or notes..."
            rows={4}
          />
        </div>
      </div>

      {/* Matter and assignment */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <FormSelect
            id="matterId"
            name="matterId"
            label="Matter"
            value={form.matterId}
            onChange={handleChange}
            options={matterOptions}
            getOptionLabel={(option) => option.label}
            placeholder="Select a matter"
          />
        </div>

        <div className="min-w-0">
          <FormSelect
            id="assignedToId"
            name="assignedToId"
            label="Assigned to"
            value={form.assignedToId}
            onChange={handleChange}
            options={userOptions}
            getOptionLabel={(option) => option.label}
            placeholder="Select a team member"
          />
        </div>
      </div>

      {/* Priority and status */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <FormSelect
            id="priority"
            name="priority"
            label="Priority"
            value={form.priority}
            onChange={handleChange}
            options={priorityOptions}
            getOptionLabel={(option) => option.label}
          />
        </div>

        <div className="min-w-0">
          <FormSelect
            id="status"
            name="status"
            label="Status"
            value={form.status}
            onChange={handleChange}
            options={statusOptions}
            getOptionLabel={(option) => option.label}
          />
        </div>
      </div>

      {/* Deadline */}
      <div className="min-w-0">
        <FormField
          id="dueDate"
          name="dueDate"
          label="Due date"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!form.title.trim()}
        >
          {isEditing ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}

export default TaskForm;