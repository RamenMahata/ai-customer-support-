
import { retry } from "./src/utils/retry.js";

// TEST 1: Operation succeeds after temporary failures
console.log("\n--- TEST 1: RETRY UNTIL SUCCESS ---");

let attempts = 0;

const result = await retry(
  async () => {
    attempts++;

    console.log(`Attempt ${attempts}`);

    if (attempts < 3) {
      throw new Error("Temporary network failure");
    }

    return "Operation successful";
  },
  {
    maxAttempts: 3,
    baseDelayMs: 10,
  }
);

console.log("Result:", result);
console.log("Total attempts:", attempts);

// TEST 2: Operation always fails
console.log("\n--- TEST 2: MAXIMUM RETRIES ---");

let failedAttempts = 0;

try {
  await retry(
    async () => {
      failedAttempts++;
      throw new Error("Service unavailable");
    },
    {
      maxAttempts: 3,
      baseDelayMs: 10,
    }
  );
} catch (error) {
  console.log("Final error:", error.message);
  console.log("Total attempts:", failedAttempts);
}
