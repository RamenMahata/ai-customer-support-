import { generateToolCallResponse } from "./src/services/llmService.js";

const history = [
  {
    role: "user",
    content: "Where is my order ORD-1024?",
  },
];

const result = await generateToolCallResponse(history);

console.dir(result, { depth: null });