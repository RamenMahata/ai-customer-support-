
import assert from "node:assert/strict";
import { runAgent } from "../services/agentService.js";

const testCases = [
  {
    name: "Return period",
    query: "How many days do I have to return a product?",
    expectedFacts: ["30 days"],
  },
  {
    name: "Refund conditions",
    query: "What are the conditions for getting a refund?",
    expectedFacts: [
      "30 days",
      "unused",
      "original packaging",
      "proof of purchase",
      "5-7 business days",
    ],
    forbiddenFacts: [
        "order confirmation",
        "receipt",
        "not eligible",
    ],
  },
  {
    name: "Shipping duration",
    query: "How long does shipping take?",
    expectedFacts: ["3-5 business days"],
  },
  {
    name: "Unsupported warranty question",
    query: "What is the warranty period for laptops?",
    expectedFacts: ["warranty"],
    expectedAbstention: true,
    forbiddenFacts: ["90 days", "1 year", "2 years", "12 months"],
  },
];

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[–—−‑]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .replace(/(\d)([a-z])/g, "$1 $2")
    .trim();

const evaluateResponse = (testCase, response) => {
  const normalizedResponse = normalize(response);

  for (const fact of testCase.expectedFacts) {
    assert.ok(
      normalizedResponse.includes(normalize(fact)),
      `Missing expected fact: "${fact}"`
    );
  }

  for (const fact of testCase.forbiddenFacts ?? []) {
    assert.ok(
      !normalizedResponse.includes(normalize(fact)),
      `Found unsupported fact: "${fact}"`
    );
  }

  if (testCase.expectedAbstention) {
    assert.match(
  normalizedResponse,
  /don't have access|do not have access|unable to find|not available|not mentioned|no information|doesn't include|does not include|cannot verify|can't verify/,
  "Expected the agent to acknowledge missing information"
);
  }
};

const testRagAgent = async () => {
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log("\n================================");
    console.log("Test:", testCase.name);
    console.log("Customer:", testCase.query);

    try {
      const response = await runAgent([
        {
          role: "user",
          content: testCase.query,
        },
      ]);

      console.log("\nAI Response:", response);

      evaluateResponse(testCase, response);

      console.log("\nResult: PASS");
      passed++;
    } catch (error) {
      console.error("\nResult: FAIL");
      console.error("Reason:", error.message);
      failed++;
    }
  }

  console.log("\n================================");
  console.log("RAG Answer Evaluation");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${testCases.length}`);
};

await testRagAgent();
