import { executeTool } from "./src/tools/toolExecutor.js";

const testCalls = [
  {
    id: "call-1",
    type: "function",
    function: {
      name: "getOrderStatus",
      arguments: '{"orderId":"ORD-1024"}',
    },
  },
  {
    id: "call-2",
    type: "function",
    function: {
      name: "unknownTool",
      arguments: "{}",
    },
  },
  {
    id: "call-3",
    type: "function",
    function: {
      name: "getOrderStatus",
      arguments: '{"orderId":""}',
    },
  },
];

for (const toolCall of testCalls) {
  const result = await executeTool(toolCall);
  console.dir(result, { depth: null });
}