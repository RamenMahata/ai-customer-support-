
import policyToolDefinition from "./policyToolDefinition.js";
import refundToolDefinition from "./refundToolDefinition.js";

const orderToolDefinition = [
  {
    type: "function",
    function: {
      name: "getOrderStatus",

      description:
        "Retrieve the current status and delivery details of a customer order. Use this when a customer asks about their order status or delivery.",

      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "The unique order ID, for example ORD-1024.",
          },
        },
        required: ["orderId"],
        additionalProperties: false,
      },
    },
  },

  ...policyToolDefinition,
  ...refundToolDefinition,
];

export default orderToolDefinition;
