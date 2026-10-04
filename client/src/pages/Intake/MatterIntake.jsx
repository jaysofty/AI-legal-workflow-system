import { useState } from "react";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import IntakeForm from "../../components/intake/IntakeForm.jsx";
import ConflictReview from "../../components/intake/ConflictReview.jsx";

import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";

import {
  useReviewMatterIntakeConflict,
  useStartMatterIntake,
} from "../../hooks/useWorkflows.js";

function MatterIntake() {
  const navigate = useNavigate();

  const startIntake = useStartMatterIntake();

  const reviewConflict = useReviewMatterIntakeConflict();

  const [workflow, setWorkflow] = useState(null);

  const [pageError, setPageError] = useState("");

  async function handleStartIntake(intakeData) {
    setPageError("");

    try {
      const result = await startIntake.mutateAsync(intakeData);

      if (result.status === "COMPLETED" && result.matter?.id) {
        navigate(`/matters/${result.matter.id}`);

        return;
      }

      if (result.status === "WAITING_FOR_HUMAN") {
        setWorkflow(result);
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      setPageError(`Unexpected workflow status: ${result.status || "UNKNOWN"}`);
    } catch (error) {
      setPageError(
        error?.message || "Unable to start the matter intake workflow.",
      );

      throw error;
    }
  }

  async function handleContinue(notes) {
    if (!workflow?.workflowId) {
      return;
    }

    setPageError("");

    try {
      const result = await reviewConflict.mutateAsync({
        workflowId: workflow.workflowId,

        decision: "CONTINUE",

        notes,
      });

      if (result.status === "COMPLETED" && result.matter?.id) {
        navigate(`/matters/${result.matter.id}`);

        return;
      }

      setPageError("The workflow did not complete as expected.");
    } catch (error) {
      setPageError(error?.message || "Unable to continue this matter intake.");

      throw error;
    }
  }

  async function handleCancel(notes) {
    if (!workflow?.workflowId) {
      return;
    }

    setPageError("");

    try {
      const result = await reviewConflict.mutateAsync({
        workflowId: workflow.workflowId,

        decision: "CANCEL",

        notes,
      });

      if (result.status === "CANCELLED") {
        navigate("/matters");
        return;
      }

      setPageError("The workflow was not cancelled as expected.");
    } catch (error) {
      setPageError(error?.message || "Unable to cancel this matter intake.");

      throw error;
    }
  }

  const waitingForReview = workflow?.status === "WAITING_FOR_HUMAN";

  const isSubmitting = startIntake.isPending || reviewConflict.isPending;

  return (
    <section className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader
        eyebrow="MATTER INTAKE"
        title={waitingForReview ? "Conflict Review" : "New Matter Intake"}
        description={
          waitingForReview
            ? "Review potential conflicts before deciding whether this matter should proceed."
            : "Capture prospective client and matter information. LegalFlow will run a conflict check before creating the matter."
        }
        action={
          <Button
            variant="secondary"
            onClick={() => navigate("/matters")}
            disabled={isSubmitting}
            icon={<ArrowLeft size={16} />}
          >
            Back to matters
          </Button>
        }
      />

      {pageError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">
            Something went wrong
          </p>

          <p className="mt-1 text-sm text-red-700">{pageError}</p>
        </div>
      )}

      {!waitingForReview && (
        <>
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ClipboardCheck size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Conflict-aware intake
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                The prospective matter will only be created automatically when
                no potential conflict is detected. Potential matches require
                human review.
              </p>
            </div>
          </div>

          <IntakeForm
            onSubmit={handleStartIntake}
            isSubmitting={startIntake.isPending}
          />
        </>
      )}

      {waitingForReview && (
        <ConflictReview
          workflow={workflow}
          onContinue={handleContinue}
          onCancel={handleCancel}
          isSubmitting={reviewConflict.isPending}
        />
      )}
    </section>
  );
}

export default MatterIntake;
