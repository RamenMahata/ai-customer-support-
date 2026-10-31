import { runAgent } from "./src/services/agentService.js";

let llmCallCount = 0;
let executionCount = 0;

const mockToolCall = {
  id: "call_1",
  type: "function",
  function: {
    name: "getOrderStatus",
    arguments: JSON.stringify({ orderId: "ORD-1024" }),
  },
};

const mockGenerateResponse = async () => {
  llmCallCount++;

  if (llmCallCount === 1) {
    return {
      toolCalls: [mockToolCall],
      assistantMessage: {
        role: "assistant",
        content: null,
        toolCalls: [mockToolCall],
      },
    };
  }

  return {
    toolCalls: [],
    content:
      "I couldn't retrieve your order details. Please try again later.",
  };
};

const mockExecute = async () => {
  executionCount++;

  throw new Error("Simulated database connection failure");
};

const response = await runAgent(
  [{ role: "user", content: "Check my order ORD-1024." }],
  {
    generateResponse: mockGenerateResponse,
    execute: mockExecute,
  }
);

console.log("Agent response:", response);
console.log("LLM calls:", llmCallCount);
console.log("Tool executions:", executionCount);

if (llmCallCount !== 2) {
  throw new Error("Expected the LLM to be called twice.");
}

if (executionCount !== 1) {
  throw new Error("Expected exactly one tool execution.");
}

console.log("PASS: Agent recovered from tool execution failure");