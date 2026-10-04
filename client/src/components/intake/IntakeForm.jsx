import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Plus,
  Trash2,
  UserRound,
  ClipboardList,
} from "lucide-react";

import FormField from "../forms/FormField.jsx";
import FormSelect from "../forms/FormSelect.jsx";
import FormTextArea from "../forms/FormTextArea.jsx";
import Button from "../ui/Button.jsx";

import { MATTER_TYPES, formatMatterType } from "../../utils/matter.utils.js";

const EMPTY_FORM = {
  client: {
    name: "",
    email: "",
    phone: "",
    address: "",
  },

  matter: {
    title: "",
    type: "LITIGATION",
    description: "",
    court: "",
    courtNumber: "",
  },

  intake: {
    source: "",
    summary: "",
    opposingParties: [],
    requestedServices: [],
  },
};

function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function IntakeForm({ onSubmit, isSubmitting = false }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const [opposingParty, setOpposingParty] = useState("");

  const [requestedService, setRequestedService] = useState("");

  const [formError, setFormError] = useState("");

  function updateSection(section, name, value) {
    setForm((current) => ({
      ...current,

      [section]: {
        ...current[section],
        [name]: value,
      },
    }));

    setFormError("");
  }

  function handleClientChange(event) {
    const { name, value } = event.target;

    updateSection("client", name, value);
  }

  function handleMatterChange(event) {
    const { name, value } = event.target;

    updateSection("matter", name, value);
  }

  function handleIntakeChange(event) {
    const { name, value } = event.target;

    updateSection("intake", name, value);
  }

  function addOpposingParty() {
    const name = opposingParty.trim();

    if (!name) {
      return;
    }

    const alreadyExists = form.intake.opposingParties.some(
      (party) => party.name.toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      setFormError("This opposing party has already been added.");

      return;
    }

    setForm((current) => ({
      ...current,

      intake: {
        ...current.intake,

        opposingParties: [
          ...current.intake.opposingParties,
          {
            name,
          },
        ],
      },
    }));

    setOpposingParty("");
    setFormError("");
  }

  function removeOpposingParty(index) {
    setForm((current) => ({
      ...current,

      intake: {
        ...current.intake,

        opposingParties: current.intake.opposingParties.filter(
          (_, partyIndex) => partyIndex !== index,
        ),
      },
    }));
  }

  function addRequestedService() {
    const service = requestedService.trim();

    if (!service) {
      return;
    }

    const alreadyExists = form.intake.requestedServices.some(
      (item) => item.toLowerCase() === service.toLowerCase(),
    );

    if (alreadyExists) {
      setFormError("This requested service has already been added.");

      return;
    }

    setForm((current) => ({
      ...current,

      intake: {
        ...current.intake,

        requestedServices: [...current.intake.requestedServices, service],
      },
    }));

    setRequestedService("");
    setFormError("");
  }

  function removeRequestedService(index) {
    setForm((current) => ({
      ...current,

      intake: {
        ...current.intake,

        requestedServices: current.intake.requestedServices.filter(
          (_, serviceIndex) => serviceIndex !== index,
        ),
      },
    }));
  }

  function handleListKeyDown(event, callback) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    callback();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!form.client.name.trim()) {
      setFormError("Enter the client's name.");
      return;
    }

    if (!form.matter.title.trim()) {
      setFormError("Enter a matter title.");
      return;
    }

    if (!form.matter.type) {
      setFormError("Select a matter type.");
      return;
    }

    if (form.intake.summary.trim().length < 10) {
      setFormError("Enter an intake summary of at least 10 characters.");

      return;
    }

    const intakeData = {
      client: {
        name: form.client.name.trim(),
        email: form.client.email.trim(),
        phone: form.client.phone.trim(),
        address: form.client.address.trim(),
      },

      matter: {
        title: form.matter.title.trim(),
        type: form.matter.type,
        description: form.matter.description.trim(),
        court: form.matter.court.trim(),
        courtNumber: form.matter.courtNumber.trim(),
      },

      intake: {
        source: form.intake.source.trim(),
        summary: form.intake.summary.trim(),

        opposingParties: form.intake.opposingParties,

        requestedServices: form.intake.requestedServices,
      },
    };

    try {
      await onSubmit(intakeData);
    } catch (error) {
      setFormError(error?.message || "Unable to submit this matter intake.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Client information */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={<UserRound size={19} />}
          title="Client information"
          description="Enter the details of the prospective client."
        />

        <div className="mt-5 space-y-5">
          <FormField
            id="clientName"
            name="name"
            label="Client name"
            value={form.client.name}
            onChange={handleClientChange}
            required
            maxLength={200}
            placeholder="Individual or company name"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="clientEmail"
              name="email"
              label="Email"
              type="email"
              value={form.client.email}
              onChange={handleClientChange}
              placeholder="client@example.com"
            />

            <FormField
              id="clientPhone"
              name="phone"
              label="Phone"
              value={form.client.phone}
              onChange={handleClientChange}
              maxLength={50}
              placeholder="+234..."
            />
          </div>

          <FormField
            id="clientAddress"
            name="address"
            label="Address"
            value={form.client.address}
            onChange={handleClientChange}
            maxLength={500}
            placeholder="Client address"
          />
        </div>
      </section>

      {/* Matter information */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={<BriefcaseBusiness size={19} />}
          title="Matter information"
          description="Provide the initial information about the prospective matter."
        />

        <div className="mt-5 space-y-5">
          <FormField
            id="matterTitle"
            name="title"
            label="Matter title"
            value={form.matter.title}
            onChange={handleMatterChange}
            required
            maxLength={300}
            placeholder="e.g. ABC Ltd v. XYZ Ltd"
          />

          <FormSelect
            id="matterType"
            name="type"
            label="Matter type"
            value={form.matter.type}
            onChange={handleMatterChange}
            options={MATTER_TYPES}
            getOptionLabel={formatMatterType}
            required
          />

          <FormTextArea
            id="matterDescription"
            name="description"
            label="Description"
            value={form.matter.description}
            onChange={handleMatterChange}
            rows={4}
            placeholder="Brief description of the prospective matter..."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="court"
              name="court"
              label="Court"
              value={form.matter.court}
              onChange={handleMatterChange}
              maxLength={300}
              placeholder="e.g. High Court of Lagos"
            />

            <FormField
              id="courtNumber"
              name="courtNumber"
              label="Court number"
              value={form.matter.courtNumber}
              onChange={handleMatterChange}
              maxLength={200}
              placeholder="e.g. LD/1234/2026"
            />
          </div>
        </div>
      </section>

      {/* Intake information */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={<ClipboardList size={19} />}
          title="Intake information"
          description="Record how the enquiry arrived, the client's needs, and relevant parties."
        />

        <div className="mt-5 space-y-5">
          <FormField
            id="intakeSource"
            name="source"
            label="Intake source"
            value={form.intake.source}
            onChange={handleIntakeChange}
            maxLength={100}
            placeholder="e.g. Referral, website, phone call"
          />

          <FormTextArea
            id="intakeSummary"
            name="summary"
            label="Intake summary"
            value={form.intake.summary}
            onChange={handleIntakeChange}
            rows={5}
            required
            maxLength={10000}
            placeholder="Summarize the client's enquiry, key facts, and what they need help with..."
          />

          {/* Opposing parties */}

          <div>
            <label
              htmlFor="opposingParty"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Opposing parties
            </label>

            <p className="mb-3 text-sm text-slate-500">
              Add known opposing parties so LegalFlow can perform a conflict
              check.
            </p>

            <div className="flex gap-2">
              <input
                id="opposingParty"
                type="text"
                value={opposingParty}
                onChange={(event) => {
                  setOpposingParty(event.target.value);

                  setFormError("");
                }}
                onKeyDown={(event) =>
                  handleListKeyDown(event, addOpposingParty)
                }
                maxLength={200}
                placeholder="Enter opposing party name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={addOpposingParty}
                icon={<Plus size={16} />}
              >
                Add
              </Button>
            </div>

            {form.intake.opposingParties.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.intake.opposingParties.map((party, index) => (
                  <div
                    key={`${party.name}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                  >
                    <span className="text-sm text-slate-700">{party.name}</span>

                    <button
                      type="button"
                      onClick={() => removeOpposingParty(index)}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-white hover:text-red-600"
                      aria-label={`Remove ${party.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requested services */}

          <div>
            <label
              htmlFor="requestedService"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Requested services
            </label>

            <p className="mb-3 text-sm text-slate-500">
              Add the legal services the prospective client is requesting.
            </p>

            <div className="flex gap-2">
              <input
                id="requestedService"
                type="text"
                value={requestedService}
                onChange={(event) => {
                  setRequestedService(event.target.value);

                  setFormError("");
                }}
                onKeyDown={(event) =>
                  handleListKeyDown(event, addRequestedService)
                }
                maxLength={300}
                placeholder="e.g. Contract review"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <Button
                type="button"
                variant="secondary"
                onClick={addRequestedService}
                icon={<Plus size={16} />}
              >
                Add
              </Button>
            </div>

            {form.intake.requestedServices.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.intake.requestedServices.map((service, index) => (
                  <div
                    key={`${service}-${index}`}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pr-2 pl-3"
                  >
                    <span className="text-sm text-slate-700">{service}</span>

                    <button
                      type="button"
                      onClick={() => removeRequestedService(index)}
                      className="rounded-full p-0.5 text-slate-400 transition hover:text-red-600"
                      aria-label={`Remove ${service}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Submit */}

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4">
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-700">
            Ready to run intake?
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            A conflict check will run before the matter is created.
          </p>
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          icon={<ArrowRight size={16} />}
        >
          Submit intake
        </Button>
      </div>
    </form>
  );
}

export default IntakeForm;
