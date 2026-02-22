import { getState, setState, startProcessing, setProgress, setResult, setError } from '../state';
import { compressImage } from '../utils/compression';
import { fixOrientation } from '../utils/exif';
import { validateImage, ValidationError } from '../utils/validation';
import { submitTryOn } from '../services/api';

let previewUrl: string | null = null;

export function renderUpload(container: HTMLElement, shadowRoot: ShadowRoot): void {
  const state = getState();
  const hasPhoto = state.userPhoto !== null;

  if (hasPhoto) {
    // Regenerate preview URL if needed (e.g., returning from result view)
    if (!previewUrl && state.userPhoto) {
      previewUrl = URL.createObjectURL(state.userPhoto);
    }
    if (previewUrl) {
      renderPreview(container, previewUrl);
      return;
    }
  }

  renderDropzone(container, shadowRoot);
}

function renderDropzone(container: HTMLElement, shadowRoot: ShadowRoot): void {
  container.innerHTML = `
    <div class="upload-zone" id="upload-zone">
      <div class="upload-icon">&#128247;</div>
      <p class="upload-title">Upload your photo</p>
      <p class="upload-subtitle">Drag & drop or click to select</p>
      <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" class="upload-input" id="upload-input" />
    </div>
    <div class="photo-guidance">
      <p class="photo-guidance-title">For best results:</p>
      Stand facing the camera in good lighting. Full body photos work best for clothing.
    </div>
  `;

  const zone = container.querySelector('#upload-zone') as HTMLElement;
  const input = container.querySelector('#upload-input') as HTMLInputElement;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file) handleFile(file, container, shadowRoot);
  });

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) handleFile(file, container, shadowRoot);
  });
}

async function handleFile(file: File, container: HTMLElement, shadowRoot: ShadowRoot): Promise<void> {
  try {
    // Validate
    validateImage(file);

    // Fix EXIF orientation
    const oriented = await fixOrientation(file);

    // Compress if needed
    const compressed = await compressImage(oriented);

    // Create preview URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(compressed);

    // Store in state
    setState({ userPhoto: new File([compressed], file.name, { type: compressed.type }) });

    // Re-render with preview
    renderPreview(container, previewUrl);
  } catch (err) {
    if (err instanceof ValidationError) {
      alert(err.message);
    } else {
      console.error('[TryOn] Error processing image:', err);
      alert('Failed to process image. Please try another photo.');
    }
  }
}

function renderPreview(container: HTMLElement, url: string): void {
  container.innerHTML = `
    <div class="preview-container">
      <img src="${url}" alt="Your photo" class="preview-image" />
      <div class="preview-actions">
        <button class="btn btn-primary" id="preview-submit">Try On</button>
        <button class="btn btn-secondary" id="preview-retake">Choose Different</button>
      </div>
    </div>
  `;

  container.querySelector('#preview-submit')?.addEventListener('click', handleSubmit);
  container.querySelector('#preview-retake')?.addEventListener('click', () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    setState({ userPhoto: null });
  });
}

async function handleSubmit(): Promise<void> {
  const state = getState();
  if (!state.userPhoto || !state.productImageUrl) return;

  startProcessing();

  try {
    const result = await submitTryOn(state.userPhoto, state.productImageUrl, (progress) => {
      setProgress(progress);
    });

    setResult(result);
  } catch (err: any) {
    setError(err.message || 'Try-on failed. Please try again.');
  }
}

export function cleanupUpload(): void {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
}
