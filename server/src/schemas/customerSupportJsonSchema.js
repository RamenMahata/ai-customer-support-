
const customerSupportJsonSchema = {
  type: "object",
  properties: {
    intent: {
      type: "string",
      enum: [
        "order_status",
        "refund_request",
        "shipping_issue",
        "product_question",
        "general_support",
        "unknown",
      ],
    },
    orderId: {
      type: ["string", "null"],
    },
    missingInformation: {
      type: "array",
      items: {
        type: "string",
      },
    },
    suggestHumanHandoff: {
      type: "boolean",
    },
    customerReply: {
      type: "string",
    },
  },
  required: [
    "intent",
    "orderId",
    "missingInformation",
    "suggestHumanHandoff",
    "customerReply",
  ],
  additionalProperties: false,
};

export default customerSupportJsonSchema;
