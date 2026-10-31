
import { runAgent } from "./src/services/agentService.js";

let executionLog = [];
let llmCallCount = 0;

const orderToolCall = {
  id: "call_1",
  type: "function",
  function: {
    name: "getOrderStatus",
    arguments: JSON.stringify({
      orderId: "ORD-1024",
    }),
  },
};

const refundToolCall = {
  id: "call_2",
  type: "function",
  function: {
    name: "requestRefund",
    arguments: JSON.stringify({
      orderId: "ORD-1024",
      reason: "Product arrived damaged",
    }),
  },
};

// Mock LLM responses.
const mockGenerateResponse = async () => {
  llmCallCount++;

  // First response: request two tools.
  if (llmCallCount === 1) {
    const toolCalls = [
      orderToolCall,
      refundToolCall,
    ];

    return {
      toolCalls,
      assistantMessage: {
        role: "assistant",
        content: null,
        toolCalls,
      },
    };
  }

  // Second response: return the final answer.
  return {
    toolCalls: [],
    content:
      "The refund operation was blocked because order lookup failed.",
  };
};

// Mock tool executor.
const mockExecute = async (toolCall) => {
  const toolName = toolCall.function.name;

  executionLog.push(toolName);

  // Simulate order lookup failure.
  if (toolName === "getOrderStatus") {
    return {
      toolCallId: toolCall.id,
      toolName,
      result: {
        success: false,
        error: "ORDER_LOOKUP_FAILED",
        message: "Unable to retrieve order information.",
      },
    };
  }

  // This should never execute.
  if (toolName === "requestRefund") {
    return {
      toolCallId: toolCall.id,
      toolName,
      result: {
        success: true,
      },
    };
  }
};

// Run the agent.
const response = await runAgent(
  [
    {
      role: "user",
      content: "Check my order and request a refund.",
    },
  ],
  {
    generateResponse: mockGenerateResponse,
    execute: mockExecute,
  }
);

console.log("Agent response:", response);
console.log("Execution log:", executionLog);

// Verify that the refund tool was never executed.
if (executionLog.includes("requestRefund")) {
  throw new Error(
    "Safety test failed: refund was executed after order lookup failure!"
  );
}

// Verify that the order lookup was executed.
if (!executionLog.includes("getOrderStatus")) {
  throw new Error(
    "Safety test failed: order lookup was not executed!"
  );
}

// Verify that only one tool was executed.
if (executionLog.length !== 1) {
  throw new Error(
    "Safety test failed: unexpected tool execution count!"
  );
}

console.log("Safety test passed!");
