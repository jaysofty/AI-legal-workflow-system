# LegalFlow AI

LegalFlow AI is a law-firm workflow platform for managing matters, clients, tasks, and document workflows with AI-assisted drafting and retrieval layered on top of firm-scoped records.

> AI prepares; humans decide.

The project currently combines a React frontend with an Express API, Prisma-backed PostgreSQL data model, and Groq-based generation for matter assistance and document drafting. The codebase is designed around firm-level tenancy, matter-scoped retrieval, and approval gates that keep consequential legal decisions under human control. It is a working foundation for legal workflow support rather than an autonomous legal decision engine.

---

## Current Features

### Legal Matter Management

- Firm-scoped matters with unique reference numbers per firm.
- Matter metadata including title, description, type, status, jurisdiction, court, court number, and limitation/opened dates.
- Matter membership via `MatterUser` records and matter-level user association.
- Client linkage, parties, deadlines, hearings, conversations, and follow-up records.
- Matter detail views and list endpoints in the backend and frontend.

### Client Management

- Client records with individual/company/government/NGO support.
- Client ownership, firm isolation, and client detail pages in the UI.
- Client creation, retrieval, and updates through authenticated API routes.

### Task Management

- Task creation, listing, updates, deletion, and assignment to users.
- Task fields for status, priority, due date, and completion timestamps.
- Matter-linked tasks and task detail pages in the frontend.

### Document Management

- PDF and DOCX upload support through the backend upload pipeline.
- Stored document metadata: name, type, matterId, file URL, MIME type, and size.
- Extracted text storage in `Document.extractedText` for retrieval and review.
- Archive, list, fetch, and update document operations.
- Document detail pages in the frontend.

### AI Matter Assistant

- Matter-scoped retrieval using semantic search over document chunks.
- Responds to lawyer questions grounded in retrieved matter document context.
- Available as both a standard JSON API route and a streaming NDJSON endpoint.

### AI Document Drafting

- Draft legal document generation using matter metadata, retrieved context, templates, and optional source documents.
- Generated documents are created with `approved: false` and require explicit human approval.
- Supported document types include pleadings, motions, affidavits, written addresses, witness statements, contracts, agreements, correspondence, internal memos, and other custom types.

### Human Review & Approval

- `Approval` records are created when a generated document is produced.
- Only a restricted set of lawyer/admin roles may approve a document.
- `updateApproval` enforces approval-role checks and a pending-only approval flow.
- Approval updates also toggle `GeneratedDocument.approved`.

### Workflow Automation

- Matter intake workflow with validation, conflict check, and human review states.
- Workflow execution records with step-level status tracking.
- Conflict review prompts a human decision before continuing or cancelling intake.

### Authentication & Authorization

- JWT-based authentication with `Bearer` token validation.
- Firm-level user registration and login.
- Per-request `req.user` identity with `id`, `firmId`, and `role`.
- Tool-level role checks and matter/firm access enforcement.

---

## AI Matter Agent

The project includes a structured Matter Agent in `server/src/agents/matter/matter-agent.js`.

The runtime flow is:

1. The user sends a matter question from the frontend or API.
2. The agent validates the request and authenticated user context.
3. It asks a model to decide whether the request can be answered directly or requires a tool.
4. It parses the model output as JSON and validates it against `matterAgentDecisionSchema`.
5. It calls `ToolRunner` for authorized tool execution.
6. It asks the model to transform the verified tool result into a human-readable response.

The registered tools are:

- `getMatter`
- `searchMatterDocuments`
- `getMatterTimeline`
- `createTask`
- `generateDocument`

They are registered centrally in `server/src/tools/index.js` and dispatched via `server/src/tools/tool-runner.js`.

The ToolRunner does three important checks before executing a tool:

- tool exists in the registry
- the authenticated user has a role allowed by `TOOL_PERMISSION`
- the tool arguments validate against the tool `inputSchema`

This means the model cannot claim it performed an action unless the tool result confirms it. The backend records AI execution and tool execution metadata in the Prisma models `AIExecution` and `ToolExecution`.

The AI workflows are also streamed from the backend using NDJSON on the endpoint `POST /api/matters/:matterId/agent/stream`, and the frontend updates the chat experience as `status`, `tool_start`, `tool_complete`, `content`, and `done` events arrive.

---

## Human-in-the-Loop Design

The central operating principle of the project is the same as the product principle stated in the repository:

> AI prepares; humans decide.

The document-generation flow is explicitly designed around draft review:

```text
Draft request
      ↓
Matter Agent
      ↓
generateDocument
      ↓
GeneratedDocument
approved = false
      ↓
Approval
PENDING
      ↓
Human review
   ↙       ↘
APPROVED   REJECTED
```

The actual `generateDocumentTool` creates a `GeneratedDocument` with `approved: false` and then creates an `Approval` row with `status: "PENDING"`. The approval route enforces that only approved roles can act on the document. The frontend also includes a draft review modal and approval controls in the AI workspace.

This is not a free-form autonomous legal decision system. Generated documents are treated as drafts until a human lawyer explicitly approves them.

---

## RAG / Document Retrieval

The repository implements a document retrieval pipeline that is grounded in matter-scoped document content.

```text
Legal Document
      ↓
Text Extraction
      ↓
Chunking
      ↓
Embedding generation
      ↓
PostgreSQL / pgvector similarity search
      ↓
Matter-scoped retrieval
      ↓
Matter Agent / Document generation
```

Confirmed implementation details:

- PDF and DOCX extraction is handled by `server/src/services/document-extraction.service.js` using `pdf-parse` and `mammoth`.
- Chunking logic is implemented in `server/src/rag/chunking.service.js` using a configurable chunk size and overlap.
- Embeddings use `@huggingface/transformers` and the model `Xenova/all-MiniLM-L6-v2`, with 384 dimensions, as configured in `server/src/config/embedding.config.js`.
- `DocumentChunk` stores text chunks and a `vector(384)` embedding in PostgreSQL.
- `searchDocumentChunks` in `server/src/rag/vector-search.service.js` runs a pgvector similarity search and restricts results by `firmId` and optionally `matterId` and `documentId`.
- `retrieveMatterContext` wraps this and returns `Document -> chunk -> similarity` data used by document generation and assistant queries.

The system uses strict tenant and matter scoping: search queries require a `firmId`, and document searches can additionally be limited to a given matter or document.

---

## Streaming AI Responses

The backend exposes a real streaming endpoint at `POST /api/matters/:matterId/agent/stream`.

Actual behavior in the code:

- Response content type is `application/x-ndjson; charset=utf-8`.
- The server writes each event as a single JSON object terminated by a newline.
- Event types used by the app include:
  - `status`
  - `tool_start`
  - `tool_complete`
  - `content`
  - `done`
  - `error`
- The frontend `streamMatterAgent` function reads the stream, parses newline-delimited JSON, and updates the conversation incrementally.

This is real streaming behavior implemented over HTTP, not simulated typing.

---

## Workflow Engine

The repository includes a matter intake workflow with a human-review gate.

```text
Matter Intake
      ↓
VALIDATE_INTAKE
      ↓
CONFLICT_CHECK
   ↙       ↘
NO MATCH   POTENTIAL MATCH
   ↓             ↓
Create matter  WAITING_FOR_HUMAN
                    ↙      ↘
                CONTINUE   CANCEL
                    ↓         ↓
               Complete workflow  Cancel workflow
```

Confirmed workflow implementation:

- `MATTER_INTAKE_WORKFLOW_KEY = "MATTER_INTAKE"`
- `startMatterIntakeWorkflow` validates input, normalizes it, and starts a workflow execution.
- `executeConflictCheckStep` runs a conflict check against existing firm clients.
- If potential matches are found, the workflow enters `WAITING_FOR_HUMAN` and requires a human decision.
- The controller `reviewMatterIntakeConflictController` accepts `decision` values `CONTINUE` or `CANCEL`.
- If `CANCEL`, the workflow ends in `CANCELLED`.
- If `CONTINUE`, the system resumes the workflow and executes the create-matter step.

The workflow engine records `WorkflowExecution` and `WorkflowStep` data, plus statuses like `PENDING`, `RUNNING`, `WAITING_FOR_HUMAN`, `COMPLETED`, `FAILED`, and `CANCELLED`.

---

## Engineering Architecture

```text
React / Vite Frontend
        |
        | REST + NDJSON streaming
        v
Express API (server/src)
        |
        +-- Authentication / JWT
        |
        +-- Prisma + PostgreSQL
        |
        +-- Matter & client services
        |
        +-- Workflow engine
        |
        +-- Matter Agent
        |      |
        |      +-- Tool registry
        |      +-- ToolRunner
        |      +-- Permission checks
        |      +-- AI execution logging
        |
        +-- RAG / document chunking + embeddings
        |
        +-- Groq AI provider
        |
        +-- Document extraction pipeline
        v
PostgreSQL + pgvector
```

The project is split into `client/` and `server/` in the repository root, with Docker Compose providing Postgres and Redis containers.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, React Query |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL |
| Vector search | pgvector |
| ORM | Prisma 7 |
| AI provider | Groq |
| Model | `openai/gpt-oss-120b` |
| Embedding model | `Xenova/all-MiniLM-L6-v2` |
| Validation | Zod |
| Authentication | JWT + bcryptjs |
| File extraction | `pdf-parse`, `mammoth` |
| Styling | Tailwind CSS v4 |
| Runtime container support | Docker Compose |

---

## Project Structure

```text
.
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # UI components, AI workspace panels, modals
│   │   ├── context/            # app context providers
│   │   ├── hooks/              # data access hooks
│   │   ├── pages/              # dashboard, auth, clients, matters, documents, tasks, AI
│   │   ├── routes/             # routing and guards
│   │   ├── services/           # API client code, including streaming Matter Agent client
│   │   └── utils/              # helper utilities
│   ├── package.json
│   └── .env
├── docker-compose.yml         # Postgres and Redis services
├── server/
│   ├── prisma/
│   │   └── schema.prisma       # database models and enums
│   ├── src/
│   │   ├── agents/             # Matter Agent and prompt/validation logic
│   │   ├── ai/                 # AI generation and testing helpers
│   │   ├── config/             # env, DB, AI, upload, and embedding config
│   │   ├── controllers/        # HTTP controllers
│   │   ├── middleware/          # auth and error middleware
│   │   ├── rag/                # chunking, embeddings, semantic search, retrieval
│   │   ├── routes/             # Express routes
│   │   ├── services/           # business logic for auth, matters, docs, approval, workflows
│   │   ├── tools/              # registry, permissions, ToolRunner, tool implementations
│   │   ├── validation/         # Zod validation schemas
│   │   ├── workflows/          # workflow definitions and workflow steps
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # startup entry point
│   ├── .env.example
│   └── package.json
├── roadmap.txt                 # project roadmap
├── legalflow-test.docx          # sample legal document used in testing
└── README.md                   # this file
```

---

## Security & Safety Design

The codebase contains several safeguards that are visible in the implementation:

- Authentication is required for protected routes via `authenticate` middleware.
- JWT tokens carry `sub`, `firmId`, and `role` claims.
- Database queries consistently filter by authenticated `firmId`.
- Matter access is checked before returning or editing records.
- Tool use is permission-gated using `TOOL_PERMISSION` and a `permission-checker`.
- The Matter Agent is required to validate tool arguments before execution.
- Generated legal documents are created as drafts and must be explicitly approved before being treated as accepted work.
- The document-generation prompt contains guardrails that forbid unsupported facts, invented dates, invented legal requirements, and unverified legal conclusions.
- `Approval` and `GeneratedDocument` records enforce that a human can review AI output before it becomes final.

This should be understood as a legal workflow assistant, not a replacement for professional legal judgment.

---

## Getting Started

### Prerequisites

- Node.js and npm (modern LTS version recommended)
- Docker Desktop or Docker Compose
- A Groq API key for the backend AI provider

### Clone

```bash
git clone <repository-url>
cd legal-flow-ai
```

Use the actual repository URL when cloning from your remote.

### Backend Setup

```bash
cd server
cp .env.example .env
npm install
```

Edit `server/.env` with the required values before starting the API:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/legal_flow"
JWT_SECRET="replace-with-a-secure-secret"
GROQ_API_KEY="your-groq-api-key"
PORT=5000
```

### Frontend Setup

```bash
cd client
npm install
```

The frontend expects the API URL in `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Database Setup

The repository includes a Docker Compose file for PostgreSQL and Redis:

```bash
cd ..
docker compose up -d
```

Then run Prisma generation and migrations from the server folder:

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### Start Development Servers

Start the API:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

The API listens on `http://localhost:5000` by default, and the frontend runs on the Vite default port `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma and the app |
| `JWT_SECRET` | Yes | Secret used to sign JWT access tokens |
| `GROQ_API_KEY` | Yes | Groq API key for generation and streaming |
| `PORT` | No | Optional override for the Express server port |

### Client (`client/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Base URL used by the frontend to call the backend API |

---

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Create a firm and admin user |
| POST | `/api/auth/login` | Authenticate and return a JWT |
| GET | `/api/auth/me` | Fetch current authenticated user |
| GET | `/api/users` | Get users for the authenticated firm |
| POST | `/api/clients` | Create a client |
| GET | `/api/clients` | List clients |
| GET | `/api/clients/:id` | Get a specific client |
| PATCH | `/api/clients/:id` | Update a client |
| POST | `/api/matters` | Create a matter |
| GET | `/api/matters` | List accessible matters |
| GET | `/api/matters/:id` | Get a matter |
| PATCH | `/api/matters/:id` | Update a matter |
| POST | `/api/matters/:matterId/assistant` | Ask the earlier matter-assistant endpoint |
| POST | `/api/matters/:matterId/agent` | Run the tool-using Matter Agent |
| POST | `/api/matters/:matterId/agent/stream` | Stream Matter Agent events over NDJSON |
| POST | `/api/documents/upload` | Upload PDF/DOCX and extract text |
| POST | `/api/documents` | Create a document record |
| GET | `/api/documents` | List documents |
| GET | `/api/documents/:id` | Get a document |
| PATCH | `/api/documents/:id` | Update a document |
| DELETE | `/api/documents/:id` | Archive a document |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/:id` | Get a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH | `/api/approvals/:approvalId` | Approve or reject a generated document |
| POST | `/api/workflows/matter-intake` | Start a matter intake workflow |
| GET | `/api/workflows/:workflowId` | Get workflow execution details |
| POST | `/api/workflows/:workflowId/conflict-review` | Continue or cancel a human conflict review |

---

## Roles

The Prisma schema defines the following user roles:

- `SUPER_ADMIN`
- `FIRM_ADMIN`
- `PRINCIPAL_PARTNER`
- `SENIOR_ASSOCIATE`
- `CORPORATE_ASSOCIATE`
- `IN_HOUSE_COUNSEL`
- `LITIGATION_CLERK`
- `CHAMBERS_PUPIL`
- `NYSC_INTERN`

These roles are enforced in the backend through authorization policies and are used in approval checks and tool-permission checks. The current approval policy is narrower than the tool-access policy: only `SUPER_ADMIN`, `FIRM_ADMIN`, `PRINCIPAL_PARTNER`, `SENIOR_ASSOCIATE`, `CORPORATE_ASSOCIATE`, and `IN_HOUSE_COUNSEL` can approve generated legal documents.

---

## Roadmap

The repository includes a roadmap in `roadmap.txt` that clearly separates implemented features from planned work. At the time of this writing, the implemented foundation includes:

- Express backend and Prisma/PostgreSQL foundation
- firm-based auth and tenant isolation
- clients, matters, tasks, and documents
- AI generation and document retrieval
- Matter Agent tool architecture and approvals
- client-side dashboard, matter, task, and AI workspace screens

Planned work still listed in the repo includes:

- broader specialized agent set
- more complete matter-agent UX and review experiences
- agent-to-agent orchestration and routing
- client portal experience
- production hardening, observability, and deployment work

---

## Notes on Current State

This repository is a real, functional base for legal workflow software, but it is not a complete production legal platform. The implementation currently emphasizes:

- law-firm record management
- document extraction and retrieval
- AI-assisted drafting and matter support
- controlled human approval workflows
- streaming tool-based agent interactions

The codebase intentionally treats AI output as draft evidence and not as final legal action.
