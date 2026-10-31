
import { runAgent } from "./src/services/agentService.js";

let llmCallCount = 0;
let executionCount = 0;

const mockGenerateResponse = async () => {
  llmCallCount++;

  const toolCall = {
    id: `call_${llmCallCount}`,
    type: "function",
    function: {
      name: "getOrderStatus",
      arguments: JSON.stringify({
        orderId: "ORD-1024",
      }),
    },
  };

  // Always request another tool.
  return {
    toolCalls: [toolCall],
    assistantMessage: {
      role: "assistant",
      content: null,
      toolCalls: [toolCall],
    },
  };
};

const mockExecute = async (toolCall) => {
  executionCount++;

  return {
    toolCallId: toolCall.id,
    toolName: toolCall.function.name,
    result: {
      success: true,
      data: {
        orderId: "ORD-1024",
        status: "shipped",
      },
    },
  };
};

try {
  await runAgent(
    [{ role: "user", content: "Check my order status." }],
    {
      generateResponse: mockGenerateResponse,
      execute: mockExecute,
    }
  );

  throw new Error("Test failed: Maximum rounds were not enforced.");
} catch (error) {
  if (
    error.message !==
    "Maximum tool execution rounds exceeded"
  ) {
    throw error;
  }

  console.log("PASS: Maximum tool rounds enforced");
}

console.log("LLM calls:", llmCallCount);
console.log("Tool executions:", executionCount);

if (llmCallCount !== 6) {
  throw new Error("Expected exactly six LLM calls.");
}

if (executionCount !== 5) {
  throw new Error("Expected exactly five tool executions.");
}

console.log("PASS: Agent stopped after five tool rounds");
