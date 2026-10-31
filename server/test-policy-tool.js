import { getReturnPolicy } from "./src/tools/policyTools.js";

const result = await getReturnPolicy();

console.dir(result, { depth: null });