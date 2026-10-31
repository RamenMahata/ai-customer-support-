
import { runAgent } from "./src/services/agentService.js";

const executionLog = [];

const mockToolCalls = [
  {
    id: "call-1",
    type: "function",
    function: {
      name: "getOrderStatus",
      arguments: '{"orderId":"ORD-1024"}',
    },
  },
  {
    id: "call-2",
    type: "function",
    function: {
      name: "getReturnPolicy",
      arguments: "{}",
    },
  },
  {
    id: "call-3",
    type: "function",
    function: {
      name: "requestRefund",
      arguments: JSON.stringify({
        orderId: "ORD-1024",
        reason: "Product arrived damaged",
      }),
    },
  },
];

const generateResponse = async (history) => {
  const hasToolResults = history.some(
    (message) => message.role === "tool"
  );

  if (!hasToolResults) {
    return {
      assistantMessage: {
        role: "assistant",
        toolCalls: mockToolCalls,
      },
      toolCalls: mockToolCalls,
      content: null,
    };
  }

  return {
    assistantMessage: null,
    toolCalls: [],
    content: "Execution completed.",
  };
};

const execute = async (toolCall) => {
  const toolName = toolCall.function.name;

  executionLog.push({
    toolName,
    startedAt: Date.now(),
  });

  // Simulate different execution durations.
  if (toolName === "getOrderStatus") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (toolName === "getReturnPolicy") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (toolName === "requestRefund") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return {
    toolCallId: toolCall.id,
    toolName,
    result: { success: true },
  };
};

const start = Date.now();

await runAgent(
  [{ role: "user", content: "Check my order and refund policy." }],
  {
    generateResponse,
    execute,
  }
);

const totalTime = Date.now() - start;

console.log("\nExecution log:", executionLog);
console.log(`Total execution time: ${totalTime}ms`);
