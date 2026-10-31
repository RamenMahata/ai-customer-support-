
import { requestRefund } from "./src/tools/refundTools.js";

import {
  approveRefund,
  rejectRefund,
} from "./src/services/approvalService.js";

import {
  processRefund,
} from "./src/services/refundExecutionService.js";

// Helper to test expected failures
const expectFailure = async (label, operation) => {
  try {
    await operation();
    console.log(`❌ ${label}: Unexpected success`);
  } catch (error) {
    console.log(`✅ ${label}: ${error.message}`);
  }
};

// TEST 1: Valid refund lifecycle
console.log("\n--- TEST 1: VALID LIFECYCLE ---");

const request = await requestRefund({
  orderId: "ORD-1024",
  reason: "Product arrived damaged",
});

const requestId = request.data.requestId;

console.log("Created:", request.data.status);

const approved = await approveRefund(requestId);
console.log("Approved:", approved.data.status);

const processed = await processRefund(requestId);
console.log("Processed:", processed.data.status);

// TEST 2: Duplicate processing
console.log("\n--- TEST 2: DUPLICATE PROCESSING ---");

await expectFailure(
  "Process an already processed refund",
  () => processRefund(requestId)
);

// TEST 3: Process without approval
console.log("\n--- TEST 3: PROCESS WITHOUT APPROVAL ---");

const pendingRequest = await requestRefund({
  orderId: "ORD-1025",
  reason: "Received the wrong product",
});

await expectFailure(
  "Process a pending refund",
  () => processRefund(pendingRequest.data.requestId)
);

// TEST 4: Duplicate approval
console.log("\n--- TEST 4: DUPLICATE APPROVAL ---");

await expectFailure(
  "Approve an already processed refund",
  () => approveRefund(requestId)
);

// TEST 5: Rejection
console.log("\n--- TEST 5: REJECTION ---");

const rejectionRequest = await requestRefund({
  orderId: "ORD-1024",
  reason: "Customer changed their mind",
});

const rejected = await rejectRefund(
  rejectionRequest.data.requestId
);

console.log("Rejected:", rejected.data.status);

await expectFailure(
  "Process a rejected refund",
  () => processRefund(rejectionRequest.data.requestId)
);
