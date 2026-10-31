
import { retry } from "./src/utils/retry.js";

const runTest = async (name, operation) => {
  console.log(`\n--- ${name} ---`);

  try {
    const result = await operation();
    console.log("PASSED:", result);
  } catch (error) {
    console.log("EXPECTED FAILURE:", error.message);
  }
};

// Test 1: HTTP 503 should retry
await runTest("HTTP 503 - Retry", async () => {
  let attempts = 0;

  const result = await retry(
    async () => {
      attempts++;

      if (attempts < 3) {
        const error = new Error("Service unavailable");
        error.statusCode = 503;
        throw error;
      }

      return "Recovered successfully";
    },
    {
      baseDelayMs: 10,
      maxDelayMs: 20,
    }
  );

  if (attempts !== 3) {
    throw new Error(`Expected 3 attempts, got ${attempts}`);
  }

  return `${result}. Attempts: ${attempts}`;
});

// Test 2: Temporary HTTP 429 should retry
await runTest("Temporary HTTP 429 - Retry", async () => {
  let attempts = 0;

  const result = await retry(
    async () => {
      attempts++;

      if (attempts === 1) {
        const error = new Error("Provider rate limited");
        error.statusCode = 429;
        throw error;
      }

      return "Recovered successfully";
    },
    {
      baseDelayMs: 10,
      maxDelayMs: 20,
    }
  );

  if (attempts !== 2) {
    throw new Error(`Expected 2 attempts, got ${attempts}`);
  }

  return `${result}. Attempts: ${attempts}`;
});

// Test 3: Daily free-model quota should NOT retry
await runTest("Daily quota exhausted - No retry", async () => {
  let attempts = 0;

  try {
    await retry(
      async () => {
        attempts++;

        const error = new Error("Rate limit exceeded");
        error.statusCode = 429;
        error.error = {
          message: "Rate limit exceeded: free-models-per-day",
          metadata: {
            limit_source: "openrouter_free_tier_daily",
          },
        };

        throw error;
      },
      {
        baseDelayMs: 10,
        maxDelayMs: 20,
      }
    );

    throw new Error("Expected operation to fail");
  } catch (error) {
    if (attempts !== 1) {
      throw new Error(`Expected 1 attempt, got ${attempts}`);
    }

    return `Not retried. Attempts: ${attempts}`;
  }
});

// Test 4: HTTP 400 should NOT retry
await runTest("HTTP 400 - No retry", async () => {
  let attempts = 0;

  try {
    await retry(
      async () => {
        attempts++;

        const error = new Error("Invalid request");
        error.statusCode = 400;
        throw error;
      },
      {
        baseDelayMs: 10,
        maxDelayMs: 20,
      }
    );

    throw new Error("Expected operation to fail");
  } catch (error) {
    if (attempts !== 1) {
      throw new Error(`Expected 1 attempt, got ${attempts}`);
    }

    return `Not retried. Attempts: ${attempts}`;
  }
});
