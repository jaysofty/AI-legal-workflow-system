import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import {
  useCreateMatter,
  useUpdateMatter,
} from "../../hooks/useMatters.js";

import FormField from "../forms/FormField.jsx";
import FormSelect from "../forms/FormSelect.jsx";
import FormTextArea from "../forms/FormTextArea.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";

import {
  MATTER_TYPES,
  formatMatterType,
} from "../../utils/matter.utils.js";

const EMPTY_FORM = {
  title: "",
  type: "LITIGATION",
  jurisdiction: "",
  court: "",
  courtNumber: "",
  description: "",
};

function getInitialForm(matter) {
  if (!matter) {
    return { ...EMPTY_FORM };
  }

  return {
    title: matter.title || "",
    type: matter.type || "LITIGATION",
    jurisdiction: matter.jurisdiction || "",
    court: matter.court || "",
    courtNumber: matter.courtNumber || "",
    description: matter.description || "",
  };
}

function MatterForm({
  matter,
  mode = "edit",
  onClose,
}) {
  const isCreate = mode === "create";

  const createMutation = useCreateMatter();
  const updateMutation = useUpdateMatter();

  const [form, setForm] = useState(() =>
    getInitialForm(matter),
  );

  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(matter));
  }, [matter]);

  const mutation = isCreate
    ? createMutation
    : updateMutation;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Enter a matter title.");
      return;
    }

    const matterData = {
      title: form.title.trim(),
      type: form.type,
      jurisdiction: form.jurisdiction.trim(),
      court: form.court.trim(),
      courtNumber: form.courtNumber.trim(),
      description: form.description.trim(),
    };

    try {
      if (isCreate) {
        await createMutation.mutateAsync(matterData);
      } else {
        await updateMutation.mutateAsync({
          matterId: matter.id,
          matterData,
        });
      }

      onClose?.();
    } catch (error) {
      setFormError(
        error?.message ||
          `Unable to ${
            isCreate ? "create" : "update"
          } this matter.`,
      );
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={
        isCreate ? "Create matter" : "Edit matter"
      }
      description={
        isCreate
          ? "Add a new matter to your firm's records."
          : "Update the information for this matter."
      }
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 p-6">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <FormField
            id="title"
            name="title"
            label="Matter title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. ABC Ltd v. XYZ Ltd"
          />

          <FormSelect
            id="type"
            name="type"
            label="Matter type"
            value={form.type}
            onChange={handleChange}
            options={MATTER_TYPES}
            getOptionLabel={formatMatterType}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="jurisdiction"
              name="jurisdiction"
              label="Jurisdiction"
              value={form.jurisdiction}
              onChange={handleChange}
              placeholder="e.g. Lagos State"
            />

            <FormField
              id="court"
              name="court"
              label="Court"
              value={form.court}
              onChange={handleChange}
              placeholder="e.g. High Court of Lagos"
            />
          </div>

          <FormField
            id="courtNumber"
            name="courtNumber"
            label="Court number"
            value={form.courtNumber}
            onChange={handleChange}
            placeholder="e.g. LD/1234/2026"
          />

          <FormTextArea
            id="description"
            name="description"
            label="Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Brief description of the matter..."
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={mutation.isPending}
            icon={<Save size={16} />}
          >
            {isCreate ? "Create matter" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default MatterForm;