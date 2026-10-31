
import { runAgent } from "./src/services/agentService.js";

const createResponse = (toolCalls) => ({
  toolCalls,
  assistantMessage: {
    role: "assistant",
    content: null,
    toolCalls,
  },
  content: null,
});

const validToolCall = {
  id: "call_123",
  function: {
    name: "getOrderStatus",
    arguments: '{"orderId":"ORD-1024"}',
  },
};

const testCases = [
  {
    name: "Valid tool call",
    response: createResponse([validToolCall]),
    shouldPass: true,
  },
  {
    name: "Missing tool-call ID",
    response: createResponse([
      {
        function: validToolCall.function,
      },
    ]),
    shouldPass: false,
  },
  {
    name: "Missing function name",
    response: createResponse([
      {
        id: "call_124",
        function: {
          arguments: "{}",
        },
      },
    ]),
    shouldPass: false,
  },
  {
    name: "Arguments are not a string",
    response: createResponse([
      {
        id: "call_125",
        function: {
          name: "getOrderStatus",
          arguments: { orderId: "ORD-1024" },
        },
      },
    ]),
    shouldPass: false,
  },
  {
    name: "Duplicate tool-call IDs",
    response: createResponse([
      validToolCall,
      validToolCall,
    ]),
    shouldPass: false,
  },
];

for (const testCase of testCases) {
  let llmCallCount = 0;
  let executionCount = 0;

  try {
    const result = await runAgent([], {
      generateResponse: async () => {
        llmCallCount++;

        // First response: return the test tool call.
        if (llmCallCount === 1) {
          return testCase.response;
        }

        // Second response: return a final answer.
        return {
          toolCalls: [],
          content: "Tool execution completed.",
        };
      },

      execute: async (toolCall) => {
        executionCount++;

        return {
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          result: {
            success: true,
            data: "Test result",
          },
        };
      },
    });

    if (!testCase.shouldPass) {
      console.log(`FAIL: ${testCase.name} - Unexpectedly passed`);
      continue;
    }

    console.log(`PASS: ${testCase.name}`);
    console.log(`  Execution count: ${executionCount}`);
  } catch (error) {
    if (testCase.shouldPass) {
      console.log(`FAIL: ${testCase.name} - ${error.message}`);
    } else {
      console.log(`PASS: ${testCase.name} - ${error.message}`);
    }
  }
}
