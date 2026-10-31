
import {
  generateStructuredResponse,
} from "./src/services/llmService.js";

const history = [
  {
    role: "user",
    content: "Where is my order ORD-1024? It has not arrived.",
  },
];

try {
  const result = await generateStructuredResponse(history);

  console.log("Structured response:");
  console.log(JSON.stringify(result, null, 2));

  console.log("Response type:", typeof result);
} catch (error) {
  console.error("Test failed:", error);
}
