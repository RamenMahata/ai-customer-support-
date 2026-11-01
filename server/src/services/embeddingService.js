import openrouter from "../config/llm.js";
import env from "../config/env.js";

export const generateEmbedding = async (text) => {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Text must be a non-empty string");
  }

  const response = await openrouter.embeddings.generate({
    requestBody: {
      model: env.OPENROUTER_EMBEDDING_MODEL,
      input: text,
      dimensions: 1024,
    },
  });

  const embedding = response.data?.[0]?.embedding;

  if (
    !Array.isArray(embedding) ||
    embedding.length === 0 ||
    !embedding.every(
      (value) => typeof value === "number" && Number.isFinite(value)
    )
  ) {
    throw new Error("Invalid embedding response");
  }

  return embedding;
};