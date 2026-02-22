import { getConfig } from '../config';
import { getAbortController, cancelProcessing } from '../components/Progress';
import type { Shade, Length, Texture, Catalog } from '../state';

const CLIENT_TIMEOUT = 90_000; // 90 seconds

let catalogCache: Catalog | null = null;

export interface TryOnResult {
  imageBase64: string;
  mimeType: string;
}

export async function fetchCatalog(): Promise<Catalog> {
  if (catalogCache && catalogCache.loaded) {
    return catalogCache;
  }

  const config = getConfig();
  const baseUrl = config.apiBaseUrl;

  const [shadesRes, lengthsRes, texturesRes] = await Promise.all([
    fetch(`${baseUrl}/api/shades`),
    fetch(`${baseUrl}/api/lengths`),
    fetch(`${baseUrl}/api/textures`),
  ]);

  if (!shadesRes.ok || !lengthsRes.ok || !texturesRes.ok) {
    throw new Error('Failed to load catalog');
  }

  const [shadesData, lengthsData, texturesData] = await Promise.all([
    shadesRes.json(),
    lengthsRes.json(),
    texturesRes.json(),
  ]);

  catalogCache = {
    shades: shadesData.shades as Shade[],
    lengths: lengthsData.lengths as Length[],
    textures: texturesData.textures as Texture[],
    loaded: true,
  };

  return catalogCache;
}

export interface ApiError {
  error: string;
  code: string;
  retryable: boolean;
}

export async function submitTryOn(
  userPhoto: File,
  shadeId: string,
  lengthId: string,
  textureId: string,
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
    formData.append('shadeId', shadeId);
    formData.append('lengthId', lengthId);
    formData.append('textureId', textureId);

    // Simulate progress stages
    const progressTimer = setInterval(() => {
      const messages = [
        'Analyzing your photo...',
        'Preparing the extensions...',
        'Applying your look...',
        'Almost there...'
      ];
      const index = Math.floor(Math.random() * messages.length);
      onProgress?.(messages[index]);
    }, 5000);

    const response = await fetch(`${config.apiBaseUrl}/api/tryon`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearInterval(progressTimer);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);

      let message = errorData.error || 'Try-on failed';
      if (errorData.code === 'MISSING_SELECTIONS') {
        message = 'Please select a shade, length, and texture.';
      } else if (errorData.code === 'TIMEOUT') {
        message = 'Request timed out. Please try again.';
      } else if (errorData.code === 'RATE_LIMITED') {
        message = 'Too many requests. Please wait a moment and try again.';
      } else if (errorData.code === 'SAFETY_BLOCK') {
        message = 'Your photo could not be processed. Please try a different photo.';
      } else if (errorData.code === 'UNSUITABLE_PHOTO') {
        message = errorData.error || 'This photo may not work well with hair extensions. Please try a photo showing longer hair.';
      } else if (errorData.code === 'NO_IMAGE') {
        message = 'The AI could not generate a result. Please try again.';
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
