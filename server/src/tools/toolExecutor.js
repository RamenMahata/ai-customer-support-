
import { z } from "zod";

import { getOrderStatus } from "./orderTools.js";
import { getReturnPolicy } from "./policyTools.js";
import { requestRefund } from "./refundTools.js";

// Maximum time allowed for a tool execution.
const TOOL_TIMEOUT_MS = 10000;

// Only explicitly registered tools can execute.
const toolRegistry = {
  getOrderStatus: {
    handler: getOrderStatus,
    schema: z.object({
      orderId: z.string().trim().min(1),
    }).strict(),
    executionType: "read",
    requiresHumanApproval: false,
    createsApprovalRequest: false,
  },

  getReturnPolicy: {
    handler: getReturnPolicy,
    schema: z.object({}).strict(),
    executionType: "read",
    requiresHumanApproval: false,
    createsApprovalRequest: false,
  },

  requestRefund: {
    handler: requestRefund,
    schema: z.object({
      orderId: z.string().trim().min(1),
      reason: z.string().trim().min(3).max(500),
    }).strict(),
    executionType: "write",
    requiresHumanApproval: false,
    createsApprovalRequest: true,
  },

  // Temporary tool for testing timeout handling.
  slowTestTool: {
    handler: async () =>
      new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 12000);
      }),
    schema: z.object({}).strict(),
    executionType: "read",
    requiresHumanApproval: false,
    createsApprovalRequest: false,
  },
};

// Execute a tool with a timeout.
const executeWithTimeout = async (handler, args) => {
  let timeoutId;

  try {
    return await Promise.race([
      handler(args),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("TOOL_TIMEOUT"));
        }, TOOL_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
};

// Execute a registered tool.
export const executeTool = async (toolCall, context = {}) => {
  const toolName = toolCall?.function?.name;
  const toolCallId = toolCall?.id;

  try {
    // 1. Check whether the tool is registered.
    const tool = toolRegistry[toolName];

    if (!tool) {
      return {
        toolCallId,
        toolName,
        result: {
          success: false,
          error: "UNKNOWN_TOOL",
          message: `Tool '${toolName}' is not registered.`,
        },
      };
    }

    // 2. Prevent direct execution of approval-protected tools.
    if (tool.requiresHumanApproval) {
      return {
        toolCallId,
        toolName,
        result: {
          success: false,
          error: "HUMAN_APPROVAL_REQUIRED",
          message:
            "This operation requires human approval and cannot be executed directly by the AI agent.",
        },
      };
    }

    // 3. Parse JSON arguments.
    let args;

    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch {
      return {
        toolCallId,
        toolName,
        result: {
          success: false,
          error: "INVALID_JSON",
          message: "Tool arguments must be valid JSON.",
        },
      };
    }

    // 4. Validate arguments using Zod.
    const validation = tool.schema.safeParse(args);

    if (!validation.success) {
      return {
        toolCallId,
        toolName,
        result: {
          success: false,
          error: "VALIDATION_ERROR",
          message: validation.error.issues
            .map((issue) => issue.message)
            .join(", "),
        },
      };
    }

    // 5. Execute the registered tool with timeout.
    const result = await executeWithTimeout(
      (validatedArgs) =>
        tool.handler(validatedArgs, context),
      validation.data
    );

    // 6. Return the tool result and execution metadata.
    return {
      toolCallId,
      toolName,
      executionType: tool.executionType,
      requiresHumanApproval: tool.requiresHumanApproval,
      createsApprovalRequest: tool.createsApprovalRequest,
      result,
    };
  } catch (error) {
    console.error(`Tool execution failed: ${toolName}`, error);

    const isTimeout = error.message === "TOOL_TIMEOUT";

    return {
      toolCallId,
      toolName,
      result: {
        success: false,
        error: isTimeout
          ? "TOOL_TIMEOUT"
          : "TOOL_EXECUTION_FAILED",
        message: isTimeout
          ? "The tool execution exceeded the allowed time."
          : "The requested operation could not be completed.",
      },
    };
  }
};

// Get trusted metadata about a registered tool.
export const getToolMetadata = (toolName) => {
  const tool = toolRegistry[toolName];

  if (!tool) return null;

  return {
    executionType: tool.executionType,
    requiresHumanApproval: tool.requiresHumanApproval,
    createsApprovalRequest: tool.createsApprovalRequest,
  };
};
