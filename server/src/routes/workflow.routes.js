import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  startMatterIntakeController,
  getWorkflowController,
  reviewMatterIntakeConflictController,
} from "../controllers/workflow.controller.js";

import { conflictReviewSchema } from "../validation/workflow.validation.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/matter-intake",
  startMatterIntakeController,
);

router.get(
  "/:workflowId",
  getWorkflowController,
);

router.post(
  "/:workflowId/conflict-review",
  validate(conflictReviewSchema),
  reviewMatterIntakeConflictController,
);

export default router;