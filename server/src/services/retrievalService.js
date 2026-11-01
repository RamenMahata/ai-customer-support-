import { knowledgeIndex } from "../config/pinecone.js";

const DEFAULT_TOP_K = 3;
const DEFAULT_SCORE_THRESHOLD = 0.35;

export const searchKnowledgeBase = async (
  query,
  topK = DEFAULT_TOP_K,
  scoreThreshold = DEFAULT_SCORE_THRESHOLD
) => {
  if (typeof query !== "string" || !query.trim()) {
    throw new Error("Search query must be a non-empty string");
  }

  if (!Number.isInteger(topK) || topK <= 0) {
    throw new Error("topK must be a positive integer");
  }

  if (
    typeof scoreThreshold !== "number" ||
    scoreThreshold < 0 ||
    scoreThreshold > 1
  ) {
    throw new Error("Score threshold must be between 0 and 1");
  }

  const response = await knowledgeIndex.documents.search({
    scoreBy: [
      {
        type: "embed",
        field: "chunk_text",
        query: query.trim(),
      },
    ],
    topK,
    includeFields: ["chunk_text", "title"],
  });

  const matches = response.matches ?? [];

  return matches
    .filter((match) => match._score >= scoreThreshold)
    .map((match) => ({
      id: match._id,
      content: match.chunk_text,
      source: match.title,
      score: match._score,
    }));
};