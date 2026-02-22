const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_DIMENSION = 512;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateImage(file: File): void {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError(
      'Please upload a JPEG, PNG, or WebP image.'
    );
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      'Image is too large. Please upload an image under 20MB.'
    );
  }
}

export async function validateDimensions(file: File): Promise<void> {
  const dimensions = await getImageDimensions(file);

  if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
    throw new ValidationError(
      `Image is too small. Minimum size is ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.`
    );
  }
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ValidationError('Failed to load image. Please try another file.'));
    };

    img.src = url;
  });
}
