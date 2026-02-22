const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const initialDelay = options.initialDelay ?? INITIAL_DELAY;
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = initialDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError;
}

function defaultShouldRetry(error: any): boolean {
  // Don't retry 4xx errors (client errors)
  if (error.status >= 400 && error.status < 500) {
    return false;
  }

  // Retry 5xx errors (server errors)
  if (error.status >= 500) {
    return true;
  }

  // Retry network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Retry rate limit errors
  if (error.status === 429) {
    return true;
  }

  return true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
