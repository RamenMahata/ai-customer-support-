
import {
  requestRefund,
  getAllRefundRequests,
} from "./src/tools/refundTools.js";

const idempotencyKey = "refund-test-001";

const refundData = {
  orderId: "ORD-1024",
  reason: "Product arrived damaged",
};

const context = { idempotencyKey };

const firstResult = await requestRefund(refundData, context);
const secondResult = await requestRefund(refundData, context);

console.log("First request:", firstResult);
console.log("Second request:", secondResult);

console.log(
  "Same request ID:",
  firstResult.data.requestId === secondResult.data.requestId
);

console.log(
  "Total refund requests:",
  getAllRefundRequests().length
);

const conflictingResult = await requestRefund(
  {
    orderId: "ORD-1024",
    reason: "I changed my mind",
  },
  context
);

console.log("Conflicting request:", conflictingResult);

const concurrentKey = "refund-test-002";

const concurrentResults = await Promise.all([
  requestRefund(refundData, {
    idempotencyKey: concurrentKey,
  }),
  requestRefund(refundData, {
    idempotencyKey: concurrentKey,
  }),
]);

console.log(
  "Concurrent request IDs:",
  concurrentResults.map((result) => result.data.requestId)
);

console.log(
  "Same concurrent request:",
  concurrentResults[0].data.requestId ===
    concurrentResults[1].data.requestId
);

console.log(
  "Total refund requests:",
  getAllRefundRequests().length
);