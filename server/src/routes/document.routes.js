import express from "express";

import {
  uploadDocumentController,
  createDocumentController,
  getDocumentsController,
  getDocumentController,
  updateDocumentController,
  archiveDocumentController,
} from "../controllers/document.controller.js";

import { documentUpload } from "../config/upload.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  createDocumentSchema,
  updateDocumentSchema,
} from "../validation/document.validation.js";

const router = express.Router();

router.use(authenticate);

router.post(
  "/upload",
  documentUpload.single("file"),
  uploadDocumentController
);

router.post(
  "/",
  validate(createDocumentSchema),
  createDocumentController
);

router.get(
  "/",
  getDocumentsController
);

router.get(
  "/:id",
  getDocumentController
);

router.patch(
  "/:id",
  validate(updateDocumentSchema),
  updateDocumentController
);

router.delete(
  "/:id",
  archiveDocumentController
);

export default router;