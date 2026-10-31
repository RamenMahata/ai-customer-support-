
import { runAgent } from "./src/services/agentService.js";

const history = [
  {
    role: "user",
    content:
      "Check my order ORD-1024 and also tell me your return policy.",
  },
];

try {
  const response = await runAgent(history);

  console.log("\nFinal AI Response:");
  console.log(response);
} catch (error) {
  console.error("Agent failed:", error);
}
