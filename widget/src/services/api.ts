import { getConfig, getApiKey } from '../config';
import { getAbortController, cancelProcessing } from '../components/Progress';

const CLIENT_TIMEOUT = 90_000; // 90 seconds
const API_KEY_HEADER = 'x-tryon-api-key';

export interface TryOnResult {
  imageBase64: string;
  mimeType: string;
}

export interface ApiError {
  error: string;
  code: string;
  retryable: boolean;
}

export async function submitTryOn(
  userPhoto: File,
  productImageUrl: string,
  onProgress?: (message: string) => void
): Promise<TryOnResult> {
  const config = getConfig();
  const controller = getAbortController();

  // Client-side timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, CLIENT_TIMEOUT);

  try {
    onProgress?.('Uploading your photo...');

    const formData = new FormData();
    formData.append('userImage', userPhoto);
    formData.append('productImageUrl', productImageUrl);

    // Simulate progress stages
    const progressTimer = setInterval(() => {
      const elapsed = Date.now();
      const messages = [
        'Analyzing your photo...',
        'Preparing the product...',
        'Creating your look...',
        'Almost there...'
      ];
      // Cycle through messages
      const index = Math.floor(Math.random() * messages.length);
      onProgress?.(messages[index]);
    }, 5000);

    // Build request headers
    const headers: Record<string, string> = {};
    const apiKey = getApiKey();
    if (apiKey) {
      headers[API_KEY_HEADER] = apiKey;
    }

    const response = await fetch(`${config.apiBaseUrl}/api/tryon`, {
      method: 'POST',
      body: formData,
      headers,
      signal: controller.signal
    });

    clearInterval(progressTimer);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);

      // Handle specific error codes with user-friendly messages
      let message = errorData.error || 'Try-on failed';
      if (errorData.code === 'MISSING_API_KEY') {
        message = 'Widget not configured. Please add your API key.';
      } else if (errorData.code === 'INVALID_API_KEY') {
        message = 'Invalid API key. Please check your configuration.';
      } else if (errorData.code === 'QUOTA_EXCEEDED') {
        message = 'Usage limit reached. Please try again later.';
      } else if (errorData.code === 'RATE_LIMIT_EXCEEDED') {
        message = 'Too many requests. Please wait a moment.';
      }

      throw new TryOnError(
        message,
        errorData.code || 'UNKNOWN',
        errorData.retryable ?? true
      );
    }

    const data = await response.json();

    if (!data.imageBase64) {
      throw new TryOnError('No image returned', 'NO_IMAGE', true);
    }

    return {
      imageBase64: data.imageBase64,
      mimeType: data.mimeType || 'image/png'
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      throw new TryOnError(
        'Request timed out. Please try again.',
        'TIMEOUT',
        true
      );
    }

    if (err instanceof TryOnError) {
      throw err;
    }

    throw new TryOnError(
      'Failed to connect to server. Please check your connection.',
      'NETWORK_ERROR',
      true
    );
  }
}

class TryOnError extends Error {
  code: string;
  retryable: boolean;

  constructor(message: string, code: string, retryable: boolean) {
    super(message);
    this.name = 'TryOnError';
    this.code = code;
    this.retryable = retryable;
  }
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    return await response.json();
  } catch {
    return {
      error: `Server error (${response.status})`,
      code: `HTTP_${response.status}`,
      retryable: response.status >= 500
    };
  }
}
