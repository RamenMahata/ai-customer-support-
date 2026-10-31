
import { runAgent } from "./src/services/agentService.js";

const validToolCall = {
  id: "call_123",
  type: "function",
  function: {
    name: "getOrderStatus",
    arguments: '{"orderId":"ORD-1024"}',
  },
};

const createResponse = (
  toolCalls,
  assistantToolCalls = toolCalls,
  role = "assistant"
) => ({
  toolCalls,
  assistantMessage: {
    role,
    content: null,
    toolCalls: assistantToolCalls,
  },
});

const testCases = [
  {
    name: "Valid matching tool calls",
    response: createResponse([validToolCall]),
    shouldPass: true,
  },
  {
    name: "Invalid assistant role",
    response: createResponse([validToolCall], [validToolCall], "user"),
    shouldPass: false,
  },
  {
    name: "Missing assistant tool calls",
    response: createResponse([validToolCall], []),
    shouldPass: false,
  },
  {
    name: "Mismatched tool-call ID",
    response: createResponse(
      [validToolCall],
      [{
        ...validToolCall,
        id: "call_different",
      }]
    ),
    shouldPass: false,
  },
  {
    name: "Mismatched function name",
    response: createResponse(
      [validToolCall],
      [{
        ...validToolCall,
        function: {
          ...validToolCall.function,
          name: "requestRefund",
        },
      }]
    ),
    shouldPass: false,
  },
];

for (const testCase of testCases) {
  let llmCallCount = 0;

  try {
    await runAgent([], {
      generateResponse: async () => {
        llmCallCount++;

        if (llmCallCount === 1) {
          return testCase.response;
        }

        return {
          toolCalls: [],
          content: "Test completed.",
        };
      },

      execute: async (toolCall) => ({
        toolCallId: toolCall.id,
        toolName: toolCall.function.name,
        result: {
          success: true,
        },
      }),
    });

    if (!testCase.shouldPass) {
      console.log(`FAIL: ${testCase.name} - Unexpectedly passed`);
    } else {
      console.log(`PASS: ${testCase.name}`);
    }
  } catch (error) {
    if (testCase.shouldPass) {
      console.log(`FAIL: ${testCase.name} - ${error.message}`);
    } else {
      console.log(`PASS: ${testCase.name} - ${error.message}`);
    }
  }
}
