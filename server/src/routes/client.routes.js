import express from "express";

import {
  createClientController,
  getClientsController,
  getClientController,
  updateClientController,
} from "../controllers/client.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  createClientSchema,
  updateClientSchema,
} from "../validation/client.validation.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  validate(createClientSchema),
  createClientController
);

router.get("/", getClientsController);

router.get("/:id", getClientController);

router.patch(
  "/:id",
  validate(updateClientSchema),
  updateClientController
);

export default router;