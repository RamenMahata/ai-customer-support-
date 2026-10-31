import { getOrderStatus } from "./src/tools/orderTools.js";

const testCases = [
  { orderId: "ORD-1024" },
  { orderId: "ORD-1025" },
  { orderId: "ORD-9999" },
];

for (const testCase of testCases) {
  const result = await getOrderStatus(testCase);

  console.log(`\nTesting: ${testCase.orderId}`);
  console.log(result);
}