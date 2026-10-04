import express from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { updateApprovalController } from "../controllers/approval.controller.js";

import { updateApprovalSchema } from "../validation/approval.validation.js";

const router = express.Router();

router.use(authenticate);

router.patch(
  "/:approvalId",
  validate(updateApprovalSchema),
  updateApprovalController,
);

export default router;