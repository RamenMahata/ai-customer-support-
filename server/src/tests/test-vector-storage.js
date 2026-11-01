import { ingestDocuments } from "../services/ingestionService.js";
import { storeVectors } from "../services/vectorStoreService.js";

const testVectorStorage = async () => {
  try {
    console.log("Loading and chunking documents...\n");

    const chunks = await ingestDocuments();

    console.log("Total chunks:", chunks.length);
    console.log("\nStoring documents in Pinecone...");

    const result = await storeVectors(chunks);

    console.log("Documents stored successfully!");
    console.log("Upserted records:", result.upsertedCount);
  } catch (error) {
    console.error("Document storage failed:", error);
  }
};

await testVectorStorage();