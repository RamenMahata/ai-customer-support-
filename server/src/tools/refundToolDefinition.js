
const refundToolDefinition = [
  {
    type: "function",
    function: {
      name: "requestRefund",
      description:
        "Prepare a refund request for an existing order. Use this when a customer explicitly asks for a refund. This only submits the request for human approval. It does not issue a refund.",

      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "The customer's order ID.",
          },
          reason: {
            type: "string",
            description: "The reason the customer wants a refund.",
          },
        },
        required: ["orderId", "reason"],
        additionalProperties: false,
      },
    },
  },
];

export default refundToolDefinition;
