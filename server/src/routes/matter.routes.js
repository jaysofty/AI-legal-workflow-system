import express from "express";

import {
  createMatterController,
  getMattersController,
  getMatterController,
  updateMatterController,
} from "../controllers/matter.controller.js";
import { askMatterAssistantController } from "../controllers/matter-assistant.controller.js";
import { askMatterAssistantSchema } from "../validation/matter-assistant.validation.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  runMatterAgentController,
  runMatterAgentStreamController,
} from "../controllers/matter-agent.controller.js";
import { askMatterAgentSchema } from "../validation/matter-agent.validation.js";
import {
  createMatterSchema,
  updateMatterSchema,
} from "../validation/matter.validation.js";

const router = express.Router();

router.use(authenticate);

router.post("/", validate(createMatterSchema), createMatterController);

router.post(
  "/:matterId/assistant",
  validate(askMatterAssistantSchema),
  askMatterAssistantController,
);

router.post(
  "/:matterId/agent",
  validate(askMatterAgentSchema),
  runMatterAgentController,
);

router.post(
  "/:matterId/agent/stream",
  validate(askMatterAgentSchema),
  runMatterAgentStreamController,
);

router.get("/", getMattersController);

router.get("/:id", getMatterController);

router.patch("/:id", validate(updateMatterSchema), updateMatterController);

export default router;
