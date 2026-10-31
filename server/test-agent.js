import { runAgent } from "./src/services/agentService.js";

const history = [
  {
    role: "user",
    content: "Where is my order ORD-1024?",
  },
];

try {
  const response = await runAgent(history);

  console.log("\nFinal AI Response:");
  console.log(response);
} catch (error) {
  console.error("Agent failed:", error);
}