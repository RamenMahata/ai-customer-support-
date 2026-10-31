import { executeTool } from "./src/tools/toolExecutor.js";

const result = await executeTool({
  id: "timeout-test-1",
  function: {
    name: "slowTestTool",
    arguments: "{}",
  },
});

console.dir(result, { depth: null });