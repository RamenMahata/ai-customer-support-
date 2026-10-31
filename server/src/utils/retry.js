
const isRetryableError = (error) => {
  const status = error.status ?? error.statusCode;

  // Collect error messages from possible SDK error locations.
  const errorMessage = [
    error.message,
    error.error?.message,
    error.data$?.error?.message,
  ]
    .filter(Boolean)
    .join(" ");

  const limitSource =
    error.error?.metadata?.limit_source ??
    error.data$?.error?.metadata?.limit_source;

  // Do not retry when the daily free-model quota is exhausted.
  if (
    limitSource === "openrouter_free_tier_daily" ||
    errorMessage.includes("free-models-per-day")
  ) {
    return false;
  }

  // Retry temporary HTTP failures.
  if ([408, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  // Retry common network failures.
  const retryableCodes = [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "EAI_AGAIN",
  ];

  return retryableCodes.includes(error.code);
};

export const retry = async (
  operation,
  {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = isRetryableError,
  } = {}
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (
        attempt === maxAttempts ||
        !shouldRetry(error)
      ) {
        throw error;
      }

      const exponentialDelay = Math.min(
        baseDelayMs * 2 ** (attempt - 1),
        maxDelayMs
      );

      const jitter = Math.random() * exponentialDelay * 0.2;
      const delay = exponentialDelay + jitter;

      console.log(
        `Attempt ${attempt} failed. Retrying in ${Math.round(delay)}ms...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
};
