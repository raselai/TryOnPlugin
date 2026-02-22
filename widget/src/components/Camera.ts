import { setState } from '../state';
import { compressImage } from '../utils/compression';

let stream: MediaStream | null = null;
let videoEl: HTMLVideoElement | null = null;

export function renderCamera(container: HTMLElement, onCapture: (previewUrl: string) => void): void {
  container.innerHTML = `
    <div class="camera-container">
      <div class="camera-viewfinder" id="camera-viewfinder">
        <video id="camera-video" autoplay playsinline muted class="camera-video"></video>
        <div class="camera-loading" id="camera-loading">
          <div class="spinner"></div>
          <p>Starting camera...</p>
        </div>
      </div>
      <div class="camera-actions">
        <button class="btn btn-primary camera-capture-btn" id="camera-capture" disabled>Capture Photo</button>
      </div>
    </div>
  `;

  const video = container.querySelector('#camera-video') as HTMLVideoElement;
  const captureBtn = container.querySelector('#camera-capture') as HTMLButtonElement;
  const loading = container.querySelector('#camera-loading') as HTMLElement;

  videoEl = video;

  startCamera(video, loading, captureBtn, container, onCapture);

  captureBtn.addEventListener('click', () => {
    captureSnapshot(video, onCapture);
  });
}

async function startCamera(
  video: HTMLVideoElement,
  loading: HTMLElement,
  captureBtn: HTMLButtonElement,
  container: HTMLElement,
  onCapture: (previewUrl: string) => void
): Promise<void> {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    });

    video.srcObject = stream;
    await video.play();

    loading.style.display = 'none';
    captureBtn.disabled = false;
  } catch (err: any) {
    console.error('[TryOn] Camera error:', err);
    stopCamera();

    let message = 'Unable to access camera.';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      message = 'Camera permission was denied.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      message = 'No camera found on this device.';
    } else if (err.name === 'NotReadableError') {
      message = 'Camera is in use by another app.';
    }

    container.innerHTML = `
      <div class="camera-error">
        <div class="camera-error-icon">&#128247;</div>
        <p class="camera-error-title">${message}</p>
        <p class="camera-error-text">Please upload a photo instead, or check your browser's camera permissions and try again.</p>
      </div>
    `;
  }
}

async function captureSnapshot(video: HTMLVideoElement, onCapture: (previewUrl: string) => void): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Mirror the image (front-facing camera is mirrored in preview)
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to capture'))),
      'image/jpeg',
      0.92
    );
  });

  // Compress the snapshot
  const compressed = await compressImage(blob);

  // Stop camera now that we have the photo
  stopCamera();

  // Create preview URL and store in state (including original for before/after)
  const previewUrl = URL.createObjectURL(compressed);
  const originalImage = await blobToDataUrl(compressed);
  setState({
    userPhoto: new File([compressed], 'camera-capture.jpg', { type: 'image/jpeg' }),
    originalImage,
  });

  onCapture(previewUrl);
}

export function stopCamera(): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  if (videoEl) {
    videoEl.srcObject = null;
    videoEl = null;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(blob);
  });
}
