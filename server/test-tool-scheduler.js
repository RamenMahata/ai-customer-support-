
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
    content: "All requested tools have been executed.",
  };
};

const execute = async (toolCall) => {
  const toolName = toolCall.function.name;

  executionLog.push(toolName);

  console.log(`Executing: ${toolName}`);

  return {
    toolCallId: toolCall.id,
    toolName,
    result: {
      success: true,
    },
  };
};

const result = await runAgent(
  [{ role: "user", content: "Check my order and refund policy." }],
  {
    generateResponse,
    execute,
  }
);

console.log("\nExecution log:", executionLog);
console.log("\nAgent response:", result);
