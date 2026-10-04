import express from "express";

import {
  createTaskController,
  getTasksController,
  getTaskController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/task.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  createTaskSchema,
  updateTaskSchema,
} from "../validation/task.validation.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  validate(createTaskSchema),
  createTaskController
);

router.get(
  "/",
  getTasksController
);

router.get(
  "/:id",
  getTaskController
);

router.patch(
  "/:id",
  validate(updateTaskSchema),
  updateTaskController
);

router.delete(
  "/:id",
  deleteTaskController
);

export default router;