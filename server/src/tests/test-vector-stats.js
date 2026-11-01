import { knowledgeIndex } from "../config/pinecone.js";

try {
  const stats = await knowledgeIndex.describeIndexStats();

  console.log("Pinecone Index Statistics");
  console.log("-------------------------");
  console.log("Dimensions:", stats.dimension);
  console.log("Total records:", stats.totalRecordCount);
  console.log("Namespaces:", stats.namespaces);
} catch (error) {
  console.error("Failed to retrieve statistics:", error);
}