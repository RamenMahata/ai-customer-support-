
import { requestRefund } from "./src/tools/refundTools.js";
import {
  approveRefund,
  rejectRefund,
} from "./src/services/approvalService.js";

// Test 1: Approve a refund
const approvalRequest = await requestRefund({
  orderId: "ORD-1024",
  reason: "Product arrived damaged.",
});

const approvalId = approvalRequest.data.requestId;

console.log("\n--- APPROVAL TEST ---");

const approved = await approveRefund(approvalId);

console.dir(approved, { depth: null });

// Test 2: Reject a refund
const rejectionRequest = await requestRefund({
  orderId: "ORD-1025",
  reason: "Customer changed their mind.",
});

const rejectionId = rejectionRequest.data.requestId;

console.log("\n--- REJECTION TEST ---");

const rejected = await rejectRefund(rejectionId);

console.dir(rejected, { depth: null });

// Test 3: Prevent duplicate approval
console.log("\n--- DUPLICATE APPROVAL TEST ---");

try {
  await approveRefund(approvalId);
} catch (error) {
  console.log("Expected error:", error.message);
}
