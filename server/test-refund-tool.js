
import { executeTool } from "./src/tools/toolExecutor.js";

const result = await executeTool({
  id: "refund-test-1",
  function: {
    name: "requestRefund",
    arguments: JSON.stringify({
      orderId: "ORD-1024",
      reason: "The product arrived damaged.",
    }),
  },
});

console.dir(result, { depth: null });
