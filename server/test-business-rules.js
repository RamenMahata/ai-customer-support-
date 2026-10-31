import { parseStructuredResponse } from "./src/utils/parseStructuredResponse.js";

// Test 1: Valid response
const validResponse = {
  intent: "shipping_issue",
  orderId: null,
  missingInformation: ["orderId"],
  suggestHumanHandoff: true,
  customerReply: "Please provide your order ID.",
};

// Test 2: Invalid response
const invalidResponse = {
  intent: "shipping_issue",
  orderId: null,
  missingInformation: [],
  suggestHumanHandoff: false,
  customerReply: "I'll help you.",
};

const runTest = (name, response) => {
  console.log(`\n--- ${name} ---`);

  try {
    const result = parseStructuredResponse(JSON.stringify(response));
    console.log("PASSED: Response accepted");
    console.log(result);
  } catch (error) {
    console.log("REJECTED:", error.message);
  }
};

runTest("Test 1: Valid response", validResponse);
runTest("Test 2: Invalid response", invalidResponse);