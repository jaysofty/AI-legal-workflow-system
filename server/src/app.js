import express from "express";
import cors from "cors";
import helmet from "helmet";
import matterRoutes from "./routes/matter.routes.js";
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import documentRoutes from "./routes/document.routes.js";
import approvalRoutes from "./routes/approval.routes.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "2mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LegalFlow AI API is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/matters", matterRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/workflows", workflowRoutes);

app.use(errorHandler);

export default app;
