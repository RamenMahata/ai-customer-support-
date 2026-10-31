
import { runAgent } from "./src/services/agentService.js";

let llmCallCount = 0;
let executionLog = [];

const orderToolCall = {
  id: "call_order_1",
  type: "function",
  function: {
    name: "getOrderStatus",
    arguments: JSON.stringify({
      orderId: "ORD-1024",
    }),
  },
};

const policyToolCall = {
  id: "call_policy_1",
  type: "function",
  function: {
    name: "getReturnPolicy",
    arguments: JSON.stringify({}),
  },
};

// Mock LLM responses across three separate rounds.
const mockGenerateResponse = async (history) => {
  llmCallCount++;

  if (llmCallCount === 1) {
    return {
      toolCalls: [orderToolCall],
      assistantMessage: {
        role: "assistant",
        content: null,
        toolCalls: [orderToolCall],
      },
    };
  }

  if (llmCallCount === 2) {
    const orderResultExists = history.some(
      (message) =>
        message.role === "tool" &&
        message.toolCallId === "call_order_1"
    );

    if (!orderResultExists) {
      throw new Error("Order result missing from agent history");
    }

    return {
      toolCalls: [policyToolCall],
      assistantMessage: {
        role: "assistant",
        content: null,
        toolCalls: [policyToolCall],
      },
    };
  }

  if (llmCallCount === 3) {
    const orderResultExists = history.some(
      (message) =>
        message.role === "tool" &&
        message.toolCallId === "call_order_1"
    );

    const policyResultExists = history.some(
      (message) =>
        message.role === "tool" &&
        message.toolCallId === "call_policy_1"
    );

    if (!orderResultExists || !policyResultExists) {
      throw new Error("Tool results missing from agent history");
    }

    return {
      toolCalls: [],
      content:
        "Your order has been shipped. Our return policy allows eligible returns within 30 days.",
    };
  }

  throw new Error("Unexpected additional LLM call");
};

// Mock tool executor.
const mockExecute = async (toolCall) => {
  const toolName = toolCall.function.name;

  executionLog.push(toolName);

  if (toolName === "getOrderStatus") {
    return {
      toolCallId: toolCall.id,
      toolName,
      result: {
        success: true,
        data: {
          orderId: "ORD-1024",
          status: "shipped",
        },
      },
    };
  }

  if (toolName === "getReturnPolicy") {
    return {
      toolCallId: toolCall.id,
      toolName,
      result: {
        success: true,
        data: {
          returnWindow: "30 days",
          conditions: "Unused product with original packaging",
        },
      },
    };
  }

  throw new Error(`Unexpected tool: ${toolName}`);
};

const response = await runAgent(
  [
    {
      role: "user",
      content: "Check my order status and tell me the return policy.",
    },
  ],
  {
    generateResponse: mockGenerateResponse,
    execute: mockExecute,
  }
);

console.log("Agent response:", response);
console.log("LLM calls:", llmCallCount);
console.log("Tool execution log:", executionLog);

if (llmCallCount !== 3) {
  throw new Error("Expected exactly three LLM calls.");
}

if (executionLog.length !== 2) {
  throw new Error("Expected exactly two tool executions.");
}

if (
  executionLog[0] !== "getOrderStatus" ||
  executionLog[1] !== "getReturnPolicy"
) {
  throw new Error("Tools executed in an unexpected order.");
}

console.log("PASS: Agent completed multiple tool rounds");
console.log("PASS: Tool results were preserved in conversation history");
