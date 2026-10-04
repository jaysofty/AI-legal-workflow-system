import {
  startMatterIntakeWorkflow,
  MATTER_INTAKE_WORKFLOW_KEY,
} from "../workflows/definitions/matter-intake.workflow.js";

import {
  getWorkflowById,
  resumeWorkflow,
  completeWorkflow,
  cancelWorkflow,
} from "../services/workflow.service.js";

import {
  getStepById,
  completeHumanReviewStep,
} from "../services/workflow-step.service.js";

import { executeCreateMatterStep } from "../workflows/definitions/create-matter.step.js";

export async function startMatterIntakeController(req, res, next) {
  try {
    const result = await startMatterIntakeWorkflow({
      user: req.user,
      input: req.body,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWorkflowController(req, res, next) {
  try {
    const { workflowId } = req.params;

    const workflow = await getWorkflowById({
      workflowId,
      userId: req.user.id,
    });

    if (!workflow) {
      const error = new Error("Workflow not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
}

export async function reviewMatterIntakeConflictController(req, res, next) {
  try {
    const { workflowId } = req.params;
    const { decision, notes } = req.body;

    if (!["CONTINUE", "CANCEL"].includes(decision)) {
      const error = new Error(
        "Decision must be either CONTINUE or CANCEL",
      );
      error.statusCode = 400;
      throw error;
    }

    const workflow = await getWorkflowById({
      workflowId,
      userId: req.user.id,
    });

    if (!workflow) {
      const error = new Error("Workflow not found");
      error.statusCode = 404;
      throw error;
    }

    if (workflow.workflowKey !== MATTER_INTAKE_WORKFLOW_KEY) {
      const error = new Error(
        "Workflow is not a matter intake workflow",
      );
      error.statusCode = 400;
      throw error;
    }

    if (workflow.status !== "WAITING_FOR_HUMAN") {
      const error = new Error(
        `Workflow is not waiting for human review. Current status: ${workflow.status}`,
      );
      error.statusCode = 409;
      throw error;
    }

    const conflictStep = workflow.steps.find(
      (step) =>
        step.stepKey === "CONFLICT_CHECK" &&
        step.status === "WAITING_FOR_HUMAN",
    );

    if (!conflictStep) {
      const error = new Error(
        "No pending conflict review step was found",
      );
      error.statusCode = 409;
      throw error;
    }

    const currentStep = await getStepById({
      stepId: conflictStep.id,
    });

    if (currentStep.status !== "WAITING_FOR_HUMAN") {
      const error = new Error(
        "Conflict review has already been resolved",
      );
      error.statusCode = 409;
      throw error;
    }

    await completeHumanReviewStep({
      stepId: conflictStep.id,
      output: {
        ...(conflictStep.output ?? {}),
        humanReview: {
          decision,
          notes: notes?.trim() || null,
          reviewedBy: req.user.id,
          reviewedAt: new Date().toISOString(),
        },
      },
    });

    if (decision === "CANCEL") {
      await cancelWorkflow({
        workflowId,
        reason:
          notes?.trim() ||
          "Matter intake cancelled following conflict review",
      });

      return res.status(200).json({
        success: true,
        data: {
          workflowId,
          workflowKey: MATTER_INTAKE_WORKFLOW_KEY,
          status: "CANCELLED",
          decision,
          matter: null,
        },
      });
    }

    await resumeWorkflow({
      workflowId,
    });

    const matterResult = await executeCreateMatterStep({
      workflowId,
      user: req.user,
      input: workflow.input,
    });

    await completeWorkflow({
      workflowId,
      output: {
        matterId: matterResult.matter.id,
        clientId: matterResult.client.id,
        referenceNumber: matterResult.matter.referenceNumber,
        conflictReview: {
          decision,
          reviewedBy: req.user.id,
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        workflowId,
        workflowKey: MATTER_INTAKE_WORKFLOW_KEY,
        status: "COMPLETED",
        decision,
        matter: {
          id: matterResult.matter.id,
          referenceNumber: matterResult.matter.referenceNumber,
          title: matterResult.matter.title,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}