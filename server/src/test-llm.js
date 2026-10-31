import { generateResponse } from "./services/llmService.js";

try {
  const response = await generateResponse(
    "A customer asks where their order is. Politely explain that you need their order ID to check."
  );

  console.log("\nAI Response:\n");
  console.log(response);
} catch (error) {
  console.error("LLM Test Failed:", error);
  process.exitCode = 1;
}