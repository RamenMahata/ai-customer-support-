import { executeTool } from "./src/tools/toolExecutor.js";

const result = await executeTool({
  id: "call-policy-1",
  type: "function",
  function: {
    name: "getReturnPolicy",
    arguments: "{}",
  },
});

console.dir(result, { depth: null });