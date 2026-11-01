import { retrieveKnowledgeContext } from "../services/ragService.js";

const testQueries = [
  "How many days do I have to return a product?",
  "What are the conditions for getting a refund?",
  "How long does shipping take?",
  "What is the refund gurantee for products?",
  "What is the warranty period for laptops?",
];

const testRagService = async () => {
  try {
    for (const query of testQueries) {
      console.log("\n================================");
      console.log("Customer question:", query);

      const context = await retrieveKnowledgeContext(query);

      if (!context) {
        console.log("Retrieved sources: None");
        console.log("Context characters: 0");
        console.log("Result: Empty context");
        continue;
      }

      const sources = [
        ...context.matchAll(/^Source: (.+)$/gm),
      ].map((match) => match[1]);

      console.log("Retrieved sources:", sources);
      console.log("Context characters:", context.length);
      console.log("Result: Context retrieved");
    }
  } catch (error) {
    console.error("RAG service failed:", error);
  }
};

await testRagService();