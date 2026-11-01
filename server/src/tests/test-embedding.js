import { generateEmbedding } from "../services/embeddingService.js";

const text =
  "Customers can request a return within 30 days of delivery.";

console.log("Generating embedding...");

try {
  const embedding = await generateEmbedding(text);
  if (embedding.length !== 1024) {
  throw new Error(
    `Expected 1024 dimensions, received ${embedding.length}`
  );
}

  console.log("Embedding generated successfully!");
  console.log("Dimensions:", embedding.length);
  console.log("First 10 values:", embedding.slice(0, 10));
} catch (error) {
  console.error("Embedding generation failed:", error);
}