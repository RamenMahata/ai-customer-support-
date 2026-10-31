
import { runAgent } from "./src/services/agentService.js";

let executionCount = 0;
let llmCallCount = 0;

const mockGenerateResponse = async (history) => {
  llmCallCount++;

  if (llmCallCount === 1) {
    return {
      toolCalls: [
        {
          id: "call_unknown_1",
          function: {
            name: "deleteAllOrders",
            arguments: "{}",
          },
        },
      ],
      assistantMessage: {
        role: "assistant",
        content: null,
        toolCalls: [
          {
            id: "call_unknown_1",
            type: "function",
            function: {
              name: "deleteAllOrders",
              arguments: "{}",
            },
          },
        ],
      },
    };
  }

  console.log(
    "Tool result received:",
    history[history.length - 1].content
  );

  return {
    toolCalls: [],
    content: "The requested tool was rejected because it is unknown.",
  };
};

const mockExecute = async () => {
  executionCount++;
  return { success: true };
};

const result = await runAgent(
  [{ role: "user", content: "Delete all orders" }],
  {
    generateResponse: mockGenerateResponse,
    execute: mockExecute,
  }
);

console.log("Agent response:", result);
console.log("Execution count:", executionCount);
