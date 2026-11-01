import { ingestDocuments } from "../services/ingestionService.js";

try {
  console.log("Starting document ingestion...\n");

  const chunks = await ingestDocuments();

  console.log("\nIngestion completed!");
  console.log("Total embedded chunks:", chunks.length);

  for (const chunk of chunks) {
    console.log("\nID:", chunk.id);
    console.log("Source:", chunk.source);
    console.log("Embedding dimensions:", chunk.embedding.length);
    console.log("Content:", chunk.content);
  }
} catch (error) {
  console.error("Ingestion failed:", error);
}