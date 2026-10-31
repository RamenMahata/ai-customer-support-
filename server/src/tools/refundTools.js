
import { randomUUID } from "node:crypto";
import { getOrderStatus } from "./orderTools.js";

// Temporary in-memory approval storage.
const pendingRefunds = new Map();

// Stores refund operations by idempotency key.
const refundIdempotency = new Map();

export const requestRefund = async (
  { orderId, reason },
  { idempotencyKey, requestFingerprint } = {}
) => {
  // 1. Require an idempotency key.
  if (!idempotencyKey) {
    return {
      success: false,
      error: "IDEMPOTENCY_KEY_REQUIRED",
      message: "An idempotency key is required.",
    };
  }

  // 2. Create a fingerprint of the operation.
  const fingerprint =
    requestFingerprint ??
    JSON.stringify({ orderId, reason });

  // 3. Check whether this key was already used.
  const existing = refundIdempotency.get(idempotencyKey);

  if (existing) {
    // Same key with different arguments is not allowed.
    if (existing.fingerprint !== fingerprint) {
      return {
        success: false,
        error: "IDEMPOTENCY_KEY_REUSED",
        message:
          "This idempotency key was already used with different refund details.",
      };
    }

    // Return the original result or wait for the operation.
    if (existing.result) {
      return existing.result;
    }

    return await existing.promise;
  }

  // 4. Start the refund operation.
  const operationPromise = (async () => {
    // Verify that the order exists.
    const orderResult = await getOrderStatus({ orderId });

    if (!orderResult.success) {
      return {
        success: false,
        error: "ORDER_NOT_FOUND",
        message: "Cannot prepare a refund for an unknown order.",
      };
    }

    // Create a pending refund request.
    const refundRequest = {
      requestId: randomUUID(),
      orderId,
      reason,
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString(),
    };

    // Store the request for human review.
    pendingRefunds.set(refundRequest.requestId, refundRequest);

    return {
      success: true,
      message: "Refund request submitted for human approval.",
      data: refundRequest,
    };
  })();

  // 5. Reserve the key immediately.
  // Concurrent requests with this key will find this promise.
  refundIdempotency.set(idempotencyKey, {
    fingerprint,
    promise: operationPromise,
  });

  try {
    const result = await operationPromise;

    if (result.success) {
      // Cache successful result for future retries.
      refundIdempotency.set(idempotencyKey, {
        fingerprint,
        result,
      });
    } else {
      // Allow retry if the operation failed.
      refundIdempotency.delete(idempotencyKey);
    }

    return result;
  } catch (error) {
    refundIdempotency.delete(idempotencyKey);
    throw error;
  }
};

export const getPendingRefund = (requestId) => {
  return pendingRefunds.get(requestId);
};

export const updateRefundStatus = (requestId, status) => {
  const refund = pendingRefunds.get(requestId);

  if (!refund) return null;

  const updatedRefund = {
    ...refund,
    status,
    updatedAt: new Date().toISOString(),
  };

  pendingRefunds.set(requestId, updatedRefund);

  return updatedRefund;
};

export const getAllRefundRequests = () => {
  return Array.from(pendingRefunds.values());
};

export const transitionRefundStatus = (
  requestId,
  expectedStatus,
  nextStatus
) => {
  const refund = pendingRefunds.get(requestId);

  if (!refund) {
    throw new Error("Refund request not found");
  }

  if (refund.status !== expectedStatus) {
    throw new Error(
      `Invalid transition: expected ${expectedStatus}, found ${refund.status}`
    );
  }

  const updatedRefund = {
    ...refund,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  pendingRefunds.set(requestId, updatedRefund);

  return updatedRefund;
};
