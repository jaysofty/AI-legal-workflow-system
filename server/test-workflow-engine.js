import "dotenv/config";

import {
  startWorkflow,
  completeWorkflow,
  waitForHuman,
  resumeWorkflow,
  completeHumanReviewStep,
  failWorkflow,
} from "./src/workflows/index.js";

import {
  startStep,
  completeStep,
  waitForHumanStep,
  getWorkflowSteps,
} from "./src/workflows/index.js";

import { prisma } from "./src/config/database.js";

const TEST_USER_ID = "cmuo5i6zc00011gzz3taoptt5";

async function run() {
  console.log("\n=== WORKFLOW ENGINE TEST ===\n");

  let workflow;

  try {
    // ---------------------------------------------
    // 1. START WORKFLOW
    // ---------------------------------------------

    workflow = await startWorkflow({
      workflowKey: "TEST_WORKFLOW",
      userId: TEST_USER_ID,
      input: {
        source: "workflow-engine-test",
      },
    });

    console.log("1. Workflow started:");
    console.log({
      id: workflow.id,
      status: workflow.status,
    });

    // ---------------------------------------------
    // 2. START STEP
    // ---------------------------------------------

    const step = await startStep({
      executionId: workflow.id,
      stepKey: "TEST_STEP",
      name: "Test Workflow Step",
      input: {
        message: "Testing workflow engine",
      },
    });

    console.log("\n2. Step started:");
    console.log({
      id: step.id,
      status: step.status,
    });

    // ---------------------------------------------
    // 3. COMPLETE STEP
    // ---------------------------------------------

    const completedStep = await completeStep({
      stepId: step.id,
      output: {
        success: true,
        message: "Step completed successfully",
      },
    });

    console.log("\n3. Step completed:");
    console.log({
      id: completedStep.id,
      status: completedStep.status,
    });

    // ---------------------------------------------
    // 4. WAIT FOR HUMAN
    // ---------------------------------------------

    const humanStep = await startStep({
      executionId: workflow.id,
      stepKey: "HUMAN_REVIEW",
      name: "Human Review",
    });

    await waitForHumanStep({
      stepId: humanStep.id,
      output: {
        reason: "Human approval required",
      },
    });

    const waitingWorkflow = await waitForHuman({
      workflowId: workflow.id,
      output: {
        reason: "Human review required",
      },
    });

    console.log("\n4. Workflow waiting for human:");
    console.log({
      status: waitingWorkflow.status,
    });

    // ---------------------------------------------
    // 5. RESUME WORKFLOW
    // ---------------------------------------------

    const resumedWorkflow = await resumeWorkflow({
      workflowId: workflow.id,
    });

    const completedHumanStep = await completeHumanReviewStep({
  stepId: humanStep.id,
  output: {
    decision: "APPROVED",
    reviewedBy: TEST_USER_ID,
  },
});

console.log("\n6. Human review step completed:");
console.log({
  id: completedHumanStep.id,
  status: completedHumanStep.status,
});

    console.log("\n5. Workflow resumed:");
    console.log({
      status: resumedWorkflow.status,
    });


    
    // ---------------------------------------------
    // 6. COMPLETE WORKFLOW
    // ---------------------------------------------

    const completedWorkflow = await completeWorkflow({
      workflowId: workflow.id,
      output: {
        success: true,
        message: "Workflow completed successfully",
      },
    });

    console.log("\n6. Workflow completed:");
    console.log({
      id: completedWorkflow.id,
      status: completedWorkflow.status,
    });

    // ---------------------------------------------
    // 7. LOAD STEPS
    // ---------------------------------------------

    const steps = await getWorkflowSteps({
      executionId: workflow.id,
    });

    console.log("\n7. Workflow steps:");

    console.table(
      steps.map((item) => ({
        stepKey: item.stepKey,
        name: item.name,
        status: item.status,
      })),
    );

    console.log("\n=== WORKFLOW ENGINE TEST PASSED ===\n");
  } catch (error) {
    console.error("\n=== WORKFLOW ENGINE TEST FAILED ===\n");
    console.error(error);

    if (workflow?.id) {
      try {
        await failWorkflow({
          workflowId: workflow.id,
          error,
        });
      } catch (failureError) {
        console.error(
          "Failed to mark workflow as FAILED:",
          failureError,
        );
      }
    }

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();