import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import {
  useCreateClient,
  useUpdateClient,
} from "../../hooks/useClients.js";

import FormField from "../forms/FormField.jsx";
import FormSelect from "../forms/FormSelect.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";

import {
  CLIENT_TYPES,
  formatClientType,
} from "../../utils/client.utils.js";

const EMPTY_FORM = {
  type: "INDIVIDUAL",
  firstName: "",
  lastName: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
};

function getInitialForm(client) {
  if (!client) {
    return { ...EMPTY_FORM };
  }

  return {
    type: client.type || "INDIVIDUAL",
    firstName: client.firstName || "",
    lastName: client.lastName || "",
    companyName: client.companyName || "",
    email: client.email || "",
    phone: client.phone || "",
    address: client.address || "",
  };
}

function ClientForm({
  client,
  mode = "edit",
  onClose,
}) {
  const isCreate = mode === "create";

  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const [form, setForm] = useState(() =>
    getInitialForm(client),
  );

  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(client));
  }, [client]);

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

    const isCompany = form.type === "COMPANY";

    if (isCompany && !form.companyName.trim()) {
      setFormError("Enter the company name.");
      return;
    }

    if (!isCompany && !form.firstName.trim()) {
      setFormError("Enter the client's first name.");
      return;
    }

    const clientData = {
      type: form.type,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      companyName: form.companyName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    try {
      if (isCreate) {
        await createMutation.mutateAsync(clientData);
      } else {
        await updateMutation.mutateAsync({
          clientId: client.id,
          clientData,
        });
      }

      onClose?.();
    } catch (error) {
      setFormError(
        error?.message ||
          `Unable to ${
            isCreate ? "create" : "update"
          } this client.`,
      );
    }
  }

  const isCompany = form.type === "COMPANY";

  return (
    <Modal
      open
      onClose={onClose}
      title={
        isCreate ? "Add client" : "Edit client"
      }
      description={
        isCreate
          ? "Add a new client to your firm's directory."
          : "Update the client's information."
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

          <FormSelect
            id="type"
            name="type"
            label="Client type"
            value={form.type}
            onChange={handleChange}
            options={CLIENT_TYPES}
            getOptionLabel={formatClientType}
          />

          {isCompany ? (
            <FormField
              id="companyName"
              name="companyName"
              label="Company name"
              value={form.companyName}
              onChange={handleChange}
              required
              placeholder="Enter company name"
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="firstName"
                name="firstName"
                label="First name"
                value={form.firstName}
                onChange={handleChange}
                required
                placeholder="First name"
              />

              <FormField
                id="lastName"
                name="lastName"
                label="Last name"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="email"
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="client@example.com"
            />

            <FormField
              id="phone"
              name="phone"
              label="Phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234..."
            />
          </div>

          <FormField
            id="address"
            name="address"
            label="Address"
            value={form.address}
            onChange={handleChange}
            placeholder="Client address"
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
            {isCreate ? "Add client" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ClientForm;