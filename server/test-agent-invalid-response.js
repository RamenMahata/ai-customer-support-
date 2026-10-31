
import { runAgent } from "./src/services/agentService.js";

const invalidResponses = [
  {
    name: "Empty response",
    content: "",
  },
  {
    name: "Whitespace response",
    content: "   ",
  },
  {
    name: "Null response",
    content: null,
  },
  {
    name: "Undefined response",
    content: undefined,
  },
  {
    name: "Numeric response",
    content: 123,
  },
];

for (const testCase of invalidResponses) {
  try {
    await runAgent(
      [{ role: "user", content: "Check my order." }],
      {
        generateResponse: async () => ({
          toolCalls: [],
          content: testCase.content,
        }),
        execute: async () => {
          throw new Error("No tool should execute");
        },
      }
    );

    throw new Error(
      `${testCase.name}: Expected validation error was not thrown`
    );
  } catch (error) {
    if (error.message !== "Agent returned an empty response") {
      throw error;
    }

    console.log(`PASS: ${testCase.name} rejected`);
  }
}

console.log("All invalid response tests passed!");
