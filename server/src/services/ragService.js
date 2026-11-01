
import { searchKnowledgeBase } from "./retrievalService.js";

const DEFAULT_TOP_K = 3;
const DEFAULT_SCORE_THRESHOLD = 0.45;
const MAX_CONTEXT_CHARACTERS = 3000;

export const retrieveKnowledgeContext = async (query) => {
  const results = await searchKnowledgeBase(query, 1, 0.35);
  if (results.length === 0) {
    return "";
  }

  const contextParts = [];
  let totalCharacters = 0;

  for (const [index, result] of results.entries()) {
    const contextPart = [
      `Knowledge ${index + 1}`,
      `Source: ${result.source}`,
      `Relevance Score: ${result.score.toFixed(3)}`,
      "Content:",
      result.content,
    ].join("\n");

    const separator = contextParts.length > 0 ? "\n\n---\n\n" : "";
    const requiredCharacters = separator.length + contextPart.length;

    if (
      totalCharacters + requiredCharacters >
      MAX_CONTEXT_CHARACTERS
    ) {
      break;
    }

    contextParts.push(contextPart);
    totalCharacters += requiredCharacters;
  }

  return contextParts.join("\n\n---\n\n");
};
