
import { transitionRefundStatus } from "../tools/refundTools.js";

export const processRefund = async (requestId) => {
  // Only APPROVED refunds can transition to PROCESSED.
  const updatedRefund = transitionRefundStatus(
    requestId,
    "APPROVED",
    "PROCESSED"
  );

  return {
    success: true,
    message: "Refund processed successfully.",
    data: updatedRefund,
  };
};
