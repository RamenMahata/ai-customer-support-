import { runAgent } from "./src/services/agentService.js";

let executionCount = 0;

const mockGenerateResponse = async () => {
  throw new Error("Simulated LLM provider failure");
};

const mockExecute = async () => {
  executionCount++;
};

try {
  await runAgent(
    [{ role: "user", content: "Check my order status." }],
    {
      generateResponse: mockGenerateResponse,
      execute: mockExecute,
    }
  );

  throw new Error("Test failed: Expected LLM failure was not thrown.");
} catch (error) {
  if (error.message !== "Simulated LLM provider failure") {
    throw error;
  }

  console.log("PASS: LLM failure propagated correctly");
}

console.log("Tool execution count:", executionCount);

if (executionCount !== 0) {
  throw new Error("Test failed: A tool executed after LLM failure.");
}

console.log("PASS: No tools executed after LLM failure");