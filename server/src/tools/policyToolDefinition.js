
const policyToolDefinition = [
  {
    type: "function",
    function: {
      name: "getReturnPolicy",

      description:
        "Retrieve the company's return policy, including the return window, eligibility conditions, and refund processing time. Use this when a customer asks about returns or the return policy.",

      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
  },
];

export default policyToolDefinition;
