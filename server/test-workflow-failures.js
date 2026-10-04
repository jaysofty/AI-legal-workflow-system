import "dotenv/config";

import {
  startWorkflow,
  failWorkflow,
  cancelWorkflow,
} from "./src/workflows/index.js";

import {
  startStep,
  failStep,
} from "./src/workflows/index.js";

import { prisma } from "./src/config/database.js";

const TEST_USER_ID = "cmuo5i6zc00011gzz3taoptt5";

async function run() {
  console.log("\n=== WORKFLOW FAILURE TEST ===\n");

  try {
    // ---------------------------------------------
    // 1. START WORKFLOW
    // ---------------------------------------------

    const failedWorkflow = await startWorkflow({
      workflowKey: "TEST_FAILURE_WORKFLOW",
      userId: TEST_USER_ID,
      input: {
        source: "failure-test",
      },
    });

    console.log("1. Workflow started:");
    console.log({
      id: failedWorkflow.id,
      status: failedWorkflow.status,
    });

    // ---------------------------------------------
    // 2. START STEP
    // ---------------------------------------------

    const failedStep = await startStep({
      executionId: failedWorkflow.id,
      stepKey: "FAILING_STEP",
      name: "Failing Test Step",
    });

    console.log("\n2. Step started:");
    console.log({
      id: failedStep.id,
      status: failedStep.status,
    });

    // ---------------------------------------------
    // 3. FAIL STEP
    // ---------------------------------------------

    const stepAfterFailure = await failStep({
      stepId: failedStep.id,
      error: new Error(
        "Simulated workflow step failure",
      ),
    });

    console.log("\n3. Step failed:");
    console.log({
      id: stepAfterFailure.id,
      status: stepAfterFailure.status,
      error: stepAfterFailure.error,
    });

    // ---------------------------------------------
    // 4. FAIL WORKFLOW
    // ---------------------------------------------

    const workflowAfterFailure = await failWorkflow({
      workflowId: failedWorkflow.id,
      error: new Error(
        "Workflow stopped because a step failed",
      ),
    });

    console.log("\n4. Workflow failed:");
    console.log({
      id: workflowAfterFailure.id,
      status: workflowAfterFailure.status,
      error: workflowAfterFailure.error,
    });

    // ---------------------------------------------
    // 5. TEST CANCELLATION
    // ---------------------------------------------

    const cancelledWorkflow = await startWorkflow({
      workflowKey: "TEST_CANCEL_WORKFLOW",
      userId: TEST_USER_ID,
      input: {
        source: "cancellation-test",
      },
    });

    console.log("\n5. Second workflow started:");
    console.log({
      id: cancelledWorkflow.id,
      status: cancelledWorkflow.status,
    });

    const cancelled = await cancelWorkflow({
      workflowId: cancelledWorkflow.id,
      reason: "Cancelled by test",
    });

    console.log("\n6. Workflow cancelled:");
    console.log({
      id: cancelled.id,
      status: cancelled.status,
      error: cancelled.error,
    });

    console.log(
      "\n=== WORKFLOW FAILURE TEST PASSED ===\n",
    );
  } catch (error) {
    console.error(
      "\n=== WORKFLOW FAILURE TEST FAILED ===\n",
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();