import { searchKnowledgeBase } from "../services/retrievalService.js";

const testCases = [
  {
    query: "How many days do I have to return a product?",
    expectedSource: "return-policy.md",
  },
  {
    query: "What are the conditions for getting a refund?",
    expectedSource: "return-policy.md",
  },
  {
    query: "How long does shipping take?",
    expectedSource: "shipping-policy.md",
  },
  {
    query: "What is the refund gurantee for products?",
    expectedSource: "return-policy.md",
  },
  {
    query: "What is the warranty period for laptops?",
    expectedSource: null,
  },
];

const evaluateRetrieval = async () => {
  let passed = 0;

  for (const testCase of testCases) {
    console.log("\n================================");
    console.log("Query:", testCase.query);

const results = await searchKnowledgeBase(
  testCase.query,
  3,
  0.35
);
    if (results.length === 0) {
      console.log("Retrieved: No documents");
    } else {
      for (const result of results) {
        console.log({
          source: result.source,
          score: result.score,
        });
      }
    }

    const matched = testCase.expectedSource
      ? results.some(
          (result) => result.source === testCase.expectedSource
        )
      : results.length === 0;

    if (matched) {
      passed++;
      console.log("Result: PASS");
    } else {
      console.log("Result: FAIL");
    }
  }

  console.log("\n================================");
  console.log(`Evaluation: ${passed}/${testCases.length} passed`);
};

await evaluateRetrieval();