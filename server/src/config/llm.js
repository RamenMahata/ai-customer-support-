import { OpenRouter } from "@openrouter/sdk";
import env from "./env.js";

if (!env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is missing");
}

const openrouter = new OpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

export default openrouter;