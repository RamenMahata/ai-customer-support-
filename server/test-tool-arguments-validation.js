
import { runAgent } from "./src/services/agentService.js";

const createToolCall = (argumentsValue) => ({
  id: "call_123",
  type: "function",
  function: {
    name: "getOrderStatus",
    arguments: argumentsValue,
  },
});

const createResponse = (toolCall) => ({
  toolCalls: [toolCall],
  assistantMessage: {
    role: "assistant",
    content: null,
    toolCalls: [toolCall],
  },
});

const testCases = [
  {
    name: "Valid JSON object",
    arguments: '{"orderId":"ORD-1024"}',
    shouldPass: true,
  },
  {
    name: "Malformed JSON",
    arguments: '{"orderId":',
    shouldPass: false,
  },
  {
    name: "JSON array instead of object",
    arguments: '["ORD-1024"]',
    shouldPass: false,
  },
  {
    name: "JSON null instead of object",
    arguments: "null",
    shouldPass: false,
  },
  {
    name: "JSON string instead of object",
    arguments: '"ORD-1024"',
    shouldPass: false,
  },
];

for (const testCase of testCases) {
  let llmCallCount = 0;
  let executionCount = 0;

  try {
    await runAgent([], {
      generateResponse: async () => {
        llmCallCount++;

        if (llmCallCount === 1) {
          return createResponse(
            createToolCall(testCase.arguments)
          );
        }

        return {
          toolCalls: [],
          content: "Test completed.",
        };
      },

      execute: async (toolCall) => {
        executionCount++;

        return {
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          result: {
            success: true,
          },
        };
      },
    });

    if (!testCase.shouldPass) {
      console.log(`FAIL: ${testCase.name} - Unexpectedly passed`);
    } else {
      console.log(`PASS: ${testCase.name}`);
      console.log(`  Execution count: ${executionCount}`);
    }
  } catch (error) {
    if (testCase.shouldPass) {
      console.log(`FAIL: ${testCase.name} - ${error.message}`);
    } else {
      console.log(`PASS: ${testCase.name} - ${error.message}`);
      console.log(`  Execution count: ${executionCount}`);
    }
  }
}
