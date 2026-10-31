
import { runAgent } from "./src/services/agentService.js";

let llmCalls = 0;
let toolExecutions = 0;

const mockGenerateResponse = async () => {
  llmCalls++;

  return {
    content: null,
    assistantMessage: {
      role: "assistant",
      content: null,
      toolCalls: [
        {
          id: `call-${llmCalls}`,
          type: "function",
          function: {
            name: "getReturnPolicy",
            arguments: "{}",
          },
        },
      ],
    },
    toolCalls: [
      {
        id: `call-${llmCalls}`,
        type: "function",
        function: {
          name: "getReturnPolicy",
          arguments: "{}",
        },
      },
    ],
  };
};

const mockExecute = async (toolCall) => {
  toolExecutions++;

  return {
    toolCallId: toolCall.id,
    toolName: "getReturnPolicy",
    result: {
      success: true,
      data: { title: "Return Policy" },
    },
  };
};

try {
  await runAgent(
    [{ role: "user", content: "Test agent loop" }],
    {
      generateResponse: mockGenerateResponse,
      execute: mockExecute,
    }
  );
} catch (error) {
  console.log("Error:", error.message);
}

console.log("LLM calls:", llmCalls);
console.log("Tool executions:", toolExecutions);

console.log(
  llmCalls === 6 && toolExecutions === 5
    ? "PASS: Agent loop limit works"
    : "FAIL: Unexpected execution count"
);
