
import { retry } from "./src/utils/retry.js";

// TEST 1: Retry temporary HTTP 503 error
console.log("\n--- TEST 1: TEMPORARY ERROR ---");

let temporaryAttempts = 0;

try {
  const result = await retry(
    async () => {
      temporaryAttempts++;

      console.log(`Attempt ${temporaryAttempts}`);

      if (temporaryAttempts < 3) {
        const error = new Error("Service unavailable");
        error.status = 503;
        throw error;
      }

      return "Service recovered";
    },
    {
      maxAttempts: 3,
      baseDelayMs: 10,
    }
  );

  console.log("Result:", result);
  console.log("Total attempts:", temporaryAttempts);
} catch (error) {
  console.log("Error:", error.message);
}

// TEST 2: Do not retry permanent HTTP 400 error
console.log("\n--- TEST 2: PERMANENT ERROR ---");

let permanentAttempts = 0;

try {
  await retry(
    async () => {
      permanentAttempts++;

      const error = new Error("Invalid request");
      error.status = 400;
      throw error;
    },
    {
      maxAttempts: 3,
      baseDelayMs: 10,
    }
  );
} catch (error) {
  console.log("Final error:", error.message);
  console.log("Total attempts:", permanentAttempts);
}
