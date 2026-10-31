
import {
  transitionRefundStatus,
  getAllRefundRequests,
} from "../tools/refundTools.js";

// Approve a pending refund
export const approveRefund = async (requestId) => {
  const updatedRefund = transitionRefundStatus(
    requestId,
    "PENDING_APPROVAL",
    "APPROVED"
  );

  return {
    success: true,
    message: "Refund approved successfully.",
    data: updatedRefund,
  };
};

// Reject a pending refund
export const rejectRefund = async (requestId) => {
  const updatedRefund = transitionRefundStatus(
    requestId,
    "PENDING_APPROVAL",
    "REJECTED"
  );

  return {
    success: true,
    message: "Refund rejected successfully.",
    data: updatedRefund,
  };
};

// Get all pending refund requests
export const getPendingApprovals = async () => {
  const requests = getAllRefundRequests();

  return requests.filter(
    (request) => request.status === "PENDING_APPROVAL"
  );
};
