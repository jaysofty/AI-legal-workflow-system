import express from "express";

import { getFirmUsersController } from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getFirmUsersController);

export default router;