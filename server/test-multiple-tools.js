
import { generateToolCallResponse } from "./src/services/llmService.js";

const testCases = [
  "Where is my order ORD-1024?",
  "What is your return policy?",
  "Hello, how are you?",
];

for (const question of testCases) {
  console.log("\nCustomer:", question);

  try {
    const response = await generateToolCallResponse([
      {
        role: "user",
        content: question,
      },
    ]);

    console.dir(
      {
        content: response.content,
        toolCalls: response.toolCalls,
      },
      { depth: null }
    );
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}
