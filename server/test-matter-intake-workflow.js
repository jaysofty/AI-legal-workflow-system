import "dotenv/config";

import { startMatterIntakeWorkflow } from "./src/workflows/definitions/matter-intake.workflow.js";

import { prisma } from "./src/config/database.js";

const TEST_USER = {
  id: "cmuo5i6zc00011gzz3taoptt5",
  firmId: "cmuo5i6yh00001gzzf7u1ubs9",
  role: "FIRM_ADMIN",
};

async function run() {
  console.log("\n=== MATTER INTAKE WORKFLOW CLEAN-PATH TEST ===\n");

  try {
    const result = await startMatterIntakeWorkflow({
      user: TEST_USER,

      input: {
        client: {
          name: "Kelechi Adeyemi",
          email: "kelechi.adeyemi@example.com",
          phone: "08077776666",
          address: "Ibadan, Nigeria",
        },

        matter: {
          title: "Technology Services Contract Dispute",
          type: "commercial",
          description:
            "Client contacted the firm regarding a dispute arising from a technology services contract.",
          court: "High Court of Lagos State",
          courtNumber: "LD/8912/2026",
        },

        intake: {
          source: "Website",
          summary:
            "Client contacted the firm regarding a dispute arising from a technology services contract.",

          opposingParties: [
            {
              name: "Tunde Akinwale",
            },
          ],

          requestedServices: [
            "Legal representation",
            "Contract dispute review",
          ],
        },
      },
    });

    console.log("1. Workflow created:");
    console.log({
      workflowId: result.workflowId,
      workflowKey: result.workflowKey,
      status: result.status,
      nextStep: result.nextStep,
    });

    console.log("\n2. Normalized intake:");
    console.dir(result.input, {
      depth: null,
    });

    console.log("\n3. Conflict check:");
    console.dir(result.conflictCheck, {
      depth: null,
    });

    const workflow = await prisma.workflowExecution.findUnique({
      where: {
        id: result.workflowId,
      },
      include: {
        steps: true,
      },
    });

    console.log("\n4. Database workflow:");
    console.log({
      id: workflow.id,
      workflowKey: workflow.workflowKey,
      status: workflow.status,
    });

    console.log("\n5. Workflow steps:");

    console.table(
      workflow.steps.map((step) => ({
        stepKey: step.stepKey,
        name: step.name,
        status: step.status,
      })),
    );

    console.log("\n=== MATTER INTAKE CLEAN-PATH TEST PASSED ===\n");
  } catch (error) {
    console.error("\n=== MATTER INTAKE CLEAN-PATH TEST FAILED ===\n");

    console.error(error);

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
