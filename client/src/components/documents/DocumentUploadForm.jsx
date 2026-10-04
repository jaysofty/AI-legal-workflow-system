import { useEffect, useRef, useState } from "react";
import { FileUp, Upload } from "lucide-react";

import { useMatters } from "../../hooks/useMatters.js";
import { useUploadDocument } from "../../hooks/useDocuments.js";

import FormField from "../forms/FormField.jsx";
import FormSelect from "../forms/FormSelect.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";

import {
  DOCUMENT_TYPES,
  formatDocumentType,
} from "../../utils/document.utils.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const EMPTY_FORM = {
  name: "",
  matterId: "",
  type: "OTHER",
};

function getMatterItems(response) {
  const payload = response?.data ?? response;

  return (
    payload?.matters ||
    payload?.items ||
    payload?.data ||
    (Array.isArray(payload) ? payload : [])
  );
}

function getMatterLabel(matter) {
  if (matter.referenceNumber && matter.title) {
    return `${matter.referenceNumber} — ${matter.title}`;
  }

  return matter.title || matter.referenceNumber || "Unnamed matter";
}

function DocumentUploadForm({ onClose }) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");

  const uploadMutation = useUploadDocument();
  const mattersQuery = useMatters();

  const matters = getMatterItems(mattersQuery.data);

  useEffect(() => {
    if (file?.name && !form.name) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");

      setForm((current) => ({
        ...current,
        name: nameWithoutExtension,
      }));
    }
  }, [file, form.name]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setFormError("");

    if (!ALLOWED_FILE_TYPES.has(selectedFile.type)) {
      setFile(null);
      event.target.value = "";
      setFormError("Only PDF and DOCX files are supported.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      event.target.value = "";
      setFormError("The document must be 10 MB or smaller.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!file) {
      setFormError("Select a PDF or DOCX document.");
      return;
    }

    if (!form.name.trim()) {
      setFormError("Enter a document name.");
      return;
    }

    if (!form.matterId) {
      setFormError("Select the matter this document belongs to.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("matterId", form.matterId);
    formData.append("name", form.name.trim());
    formData.append("type", form.type);

    try {
      await uploadMutation.mutateAsync(formData);
      onClose?.();
    } catch (error) {
      setFormError(error?.message || "Unable to upload this document.");
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Upload document"
      description="Upload a PDF or DOCX document and attach it to a matter."
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 p-6">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <p className="mb-1.5 block text-sm font-medium text-slate-700">
              Document file
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="sr-only"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FileUp size={20} />
              </span>

              {file ? (
                <>
                  <p className="mt-3 text-sm font-medium text-slate-900">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm font-medium text-slate-900">
                    Choose a document
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PDF or DOCX, up to 10 MB
                  </p>
                </>
              )}
            </button>
          </div>

          <FormField
            id="name"
            name="name"
            label="Document name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. Statement of Claim"
          />
          <FormSelect
            id="matterId"
            name="matterId"
            label="Matter"
            value={form.matterId}
            onChange={handleChange}
            options={matters}
            getOptionLabel={getMatterLabel}
            placeholder={
              mattersQuery.isLoading ? "Loading matters..." : "Select a matter"
            }
            required
          />

          <FormSelect
            id="type"
            name="type"
            label="Document type"
            value={form.type}
            onChange={handleChange}
            options={DOCUMENT_TYPES}
            getOptionLabel={formatDocumentType}
          />

          {mattersQuery.isError && (
            <p className="text-sm text-red-600">
              Unable to load matters. Try refreshing the page and upload again.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={uploadMutation.isPending}
            icon={<Upload size={16} />}
            disabled={mattersQuery.isLoading}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default DocumentUploadForm;
