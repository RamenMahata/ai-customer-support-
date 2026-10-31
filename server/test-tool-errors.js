
import { executeTool } from "./src/tools/toolExecutor.js";

const testCases = [
  {
    id: "test-1",
    function: {
      name: "unknownTool",
      arguments: "{}",
    },
  },
  {
    id: "test-2",
    function: {
      name: "getOrderStatus",
      arguments: "{invalid-json}",
    },
  },
  {
    id: "test-3",
    function: {
      name: "getOrderStatus",
      arguments: '{"orderId":""}',
    },
  },
];

for (const testCase of testCases) {
  console.log(`\nTesting: ${testCase.id}`);

  const result = await executeTool(testCase);

  console.dir(result, { depth: null });
}
