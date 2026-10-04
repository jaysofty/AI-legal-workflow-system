import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import Button from "../ui/Button.jsx";
import FormTextArea from "../forms/FormTextArea.jsx";

function ConflictReview({
  workflow,
  onContinue,
  onCancel,
  isSubmitting = false,
}) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const conflictCheck = workflow?.conflictCheck;

  const potentialMatches = conflictCheck?.potentialMatches ?? [];

  async function handleContinue() {
    setError("");

    try {
      await onContinue(notes.trim());
    } catch (requestError) {
      setError(
        requestError?.message || "Unable to continue this matter intake.",
      );
    }
  }

  async function handleCancel() {
    setError("");

    try {
      await onCancel(notes.trim());
    } catch (requestError) {
      setError(requestError?.message || "Unable to cancel this matter intake.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <ShieldAlert size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-amber-900">
              Potential conflict detected
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              LegalFlow found one or more records that may be related to the
              prospective client or opposing parties. Review the matches before
              deciding whether the matter should proceed.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={17} className="text-amber-600" />

            <h2 className="text-sm font-semibold text-slate-900">
              Potential matches
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {potentialMatches.length} possible{" "}
            {potentialMatches.length === 1 ? "match" : "matches"} found in your
            firm's records.
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {potentialMatches.map((match) => (
            <div key={`${match.recordType}-${match.recordId}`} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <UserRound size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {match.name || "Unnamed client"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {match.recordType || "CLIENT"}
                        {match.clientType ? ` • ${match.clientType}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <p className="mt-1 text-slate-700">
                        {match.email || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <p className="mt-1 text-slate-700">
                        {match.phone || "—"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Address
                      </p>

                      <p className="mt-1 text-slate-700">
                        {match.address || "—"}
                      </p>
                    </div>
                  </div>

                  {match.reason && (
                    <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {match.reason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {conflictCheck?.searchedTerms?.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Search terms checked
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            These names and terms were checked against your firm's client
            records.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {conflictCheck.searchedTerms.map((term) => (
              <span
                key={term}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                {term}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Human review</h2>

        <p className="mt-1 text-sm text-slate-500">
          Record your review before deciding whether this intake should proceed.
        </p>

        <div className="mt-5">
          <FormTextArea
            id="conflictReviewNotes"
            name="notes"
            label="Review notes"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setError("");
            }}
            rows={4}
            placeholder="Record the reason for your decision..."
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
          icon={<ArrowLeft size={16} />}
        >
          Cancel intake
        </Button>

        <Button
          type="button"
          onClick={handleContinue}
          loading={isSubmitting}
          icon={<CheckCircle2 size={16} />}
        >
          Continue with matter
        </Button>
      </div>

      <p className="text-center text-xs text-slate-400">
        A potential match is not automatically a confirmed conflict. The
        decision to proceed is made by the reviewing professional.
      </p>
    </div>
  );
}

export default ConflictReview;
