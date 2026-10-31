import {
  customerSupportResponseSchema,
} from "../validators/customerSupportResponseSchema.js";

export const parseStructuredResponse = (content) => {
  let parsedData;

  // Step 1: Parse JSON
  try {
    parsedData = JSON.parse(content);
  } catch (error) {
    throw new Error("LLM returned invalid JSON");
  }

  // Step 2: Validate structure using Zod
  const result = customerSupportResponseSchema.safeParse(parsedData);

  if (!result.success) {
    throw new Error(
      `Invalid structured response: ${result.error.message}`
    );
  }

  const data = result.data;

  // Step 3: Validate business rules
  const orderRelatedIntents = [
    "order_status",
    "shipping_issue",
  ];

  if (
    orderRelatedIntents.includes(data.intent) &&
    data.orderId === null &&
    !data.missingInformation.includes("orderId")
  ) {
    throw new Error(
      "Business rule violation: orderId must be listed in missingInformation"
    );
  }

  if (
    data.orderId !== null &&
    data.missingInformation.includes("orderId")
  ) {
    throw new Error(
      "Business rule violation: orderId is provided but marked as missing"
    );
  }

  return data;
};