/**
 * Read EXIF orientation from JPEG and auto-rotate if needed
 */
export async function fixOrientation(file: File): Promise<Blob> {
  // Only process JPEG files
  if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
    return file;
  }

  const orientation = await getExifOrientation(file);

  // No rotation needed
  if (orientation <= 1) {
    return file;
  }

  return rotateImage(file, orientation);
}

async function getExifOrientation(file: File): Promise<number> {
  try {
    const buffer = await file.slice(0, 65536).arrayBuffer();
    const view = new DataView(buffer);

    // Check for JPEG marker
    if (view.getUint16(0) !== 0xFFD8) {
      return 1;
    }

    let offset = 2;
    while (offset < view.byteLength - 2) {
      const marker = view.getUint16(offset);
      offset += 2;

      // APP1 marker (EXIF)
      if (marker === 0xFFE1) {
        const length = view.getUint16(offset);
        offset += 2;

        // Check for "Exif\0\0"
        const exifHeader = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2),
          view.getUint8(offset + 3)
        );
        if (exifHeader !== 'Exif') {
          return 1;
        }
        offset += 6;

        // TIFF header
        const littleEndian = view.getUint16(offset) === 0x4949;
        offset += 2;

        // Skip TIFF magic number
        offset += 2;

        // IFD0 offset
        const ifdOffset = view.getUint32(offset, littleEndian);
        offset = offset - 4 + ifdOffset;

        // Number of entries
        const numEntries = view.getUint16(offset, littleEndian);
        offset += 2;

        // Search for orientation tag (0x0112)
        for (let i = 0; i < numEntries; i++) {
          const tag = view.getUint16(offset, littleEndian);
          if (tag === 0x0112) {
            return view.getUint16(offset + 8, littleEndian);
          }
          offset += 12;
        }

        return 1;
      } else if ((marker & 0xFF00) === 0xFF00) {
        // Skip other markers
        offset += view.getUint16(offset);
      } else {
        break;
      }
    }

    return 1;
  } catch {
    return 1;
  }
}

async function rotateImage(file: File, orientation: number): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  let width = img.width;
  let height = img.height;

  // Swap dimensions for 90/270 degree rotations
  if (orientation >= 5 && orientation <= 8) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  // Apply transformation based on orientation
  switch (orientation) {
    case 2: // Horizontal flip
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      break;
    case 3: // 180 degree rotation
      ctx.rotate(Math.PI);
      ctx.translate(-width, -height);
      break;
    case 4: // Vertical flip
      ctx.scale(1, -1);
      ctx.translate(0, -height);
      break;
    case 5: // 90 CW + horizontal flip
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6: // 90 CW
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7: // 90 CCW + horizontal flip
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      ctx.scale(1, -1);
      break;
    case 8: // 90 CCW
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create rotated image'));
      },
      'image/jpeg',
      0.95
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
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
