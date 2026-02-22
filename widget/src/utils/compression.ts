const MAX_DIMENSION = 2048;
const MAX_BYTES = 2_000_000;
const INITIAL_QUALITY = 0.9;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.1;

export async function compressImage(file: File | Blob, maxBytes = MAX_BYTES): Promise<Blob> {
  const img = await loadImage(file);

  // Calculate resize dimensions
  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0, width, height);

  // Try to get under maxBytes with quality reduction
  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality);

  while (blob.size > maxBytes && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }

  // If still too large, resize further
  if (blob.size > maxBytes) {
    const ratio = Math.sqrt(maxBytes / blob.size) * 0.9;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, 'image/jpeg', MIN_QUALITY);
  }

  return blob;
}

function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      type,
      quality
    );
  });
}
