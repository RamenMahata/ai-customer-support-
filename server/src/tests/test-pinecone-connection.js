import { knowledgeIndex } from "../config/pinecone.js";
import env from "../config/env.js";

const testConnection = async () => {
  try {
    console.log("Connecting to Pinecone...");
    console.log("Index:", env.PINECONE_INDEX_NAME);

    const stats = await knowledgeIndex.describeIndexStats();

    console.log("\nPinecone connection successful!");
    console.log("Index dimension:", stats.dimension);
    console.log("Total records:", stats.totalRecordCount);

    if (stats.dimension !== 1024) {
      throw new Error(
        `Dimension mismatch: expected 1024, received ${stats.dimension}`
      );
    }

    console.log("Embedding dimension verified!");
  } catch (error) {
    console.error("Pinecone connection failed:", error.message);
  }
};

await testConnection();