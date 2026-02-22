import { getState, setState } from '../state';
import { compressImage } from '../utils/compression';
import { fixOrientation } from '../utils/exif';
import { validateImage, ValidationError } from '../utils/validation';
import { renderCamera, stopCamera } from './Camera';

let previewUrl: string | null = null;
let activeTab: 'upload' | 'camera' = 'upload';

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

  renderCaptureTabs(container, shadowRoot);
}

function renderCaptureTabs(container: HTMLElement, shadowRoot: ShadowRoot): void {
  const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  if (!hasCamera) {
    // No camera support — render dropzone directly without tabs
    renderDropzone(container, shadowRoot);
    return;
  }

  container.innerHTML = `
    <div class="capture-tabs">
      <button class="capture-tab ${activeTab === 'upload' ? 'active' : ''}" id="tab-upload">Upload Photo</button>
      <button class="capture-tab ${activeTab === 'camera' ? 'active' : ''}" id="tab-camera">Use Camera</button>
    </div>
    <div id="capture-content"></div>
    <div class="photo-guidance">
      <p class="photo-guidance-title">For best results:</p>
      Face the camera with your hair down in good lighting. A clear view of your head and shoulders gives the most realistic result.
    </div>
  `;

  const content = container.querySelector('#capture-content') as HTMLElement;
  const tabUpload = container.querySelector('#tab-upload') as HTMLButtonElement;
  const tabCamera = container.querySelector('#tab-camera') as HTMLButtonElement;

  function switchTab(tab: 'upload' | 'camera') {
    activeTab = tab;
    tabUpload.classList.toggle('active', tab === 'upload');
    tabCamera.classList.toggle('active', tab === 'camera');

    if (tab === 'upload') {
      stopCamera();
      renderDropzoneInto(content, container, shadowRoot);
    } else {
      renderCamera(content, (url) => {
        previewUrl = url;
        renderPreview(container, url);
      });
    }
  }

  tabUpload.addEventListener('click', () => switchTab('upload'));
  tabCamera.addEventListener('click', () => switchTab('camera'));

  // Render initial tab
  if (activeTab === 'camera') {
    renderCamera(content, (url) => {
      previewUrl = url;
      renderPreview(container, url);
    });
  } else {
    renderDropzoneInto(content, container, shadowRoot);
  }
}

function renderDropzoneInto(target: HTMLElement, container: HTMLElement, shadowRoot: ShadowRoot): void {
  target.innerHTML = `
    <div class="upload-zone" id="upload-zone">
      <div class="upload-icon">&#128247;</div>
      <p class="upload-title">Upload your photo</p>
      <p class="upload-subtitle">Drag & drop or click to select</p>
      <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" class="upload-input" id="upload-input" />
    </div>
  `;

  const zone = target.querySelector('#upload-zone') as HTMLElement;
  const input = target.querySelector('#upload-input') as HTMLInputElement;

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
      Face the camera with your hair down in good lighting. A clear view of your head and shoulders gives the most realistic result.
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

    // Store in state (including original image data URL for before/after)
    const originalImage = await blobToDataUrl(compressed);
    setState({
      userPhoto: new File([compressed], file.name, { type: compressed.type }),
      originalImage,
    });

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
        <button class="btn btn-primary" id="preview-submit">Choose Extensions</button>
        <button class="btn btn-secondary" id="preview-retake">Choose Different</button>
      </div>
    </div>
  `;

  container.querySelector('#preview-submit')?.addEventListener('click', () => {
    setState({ view: 'selectors' });
  });
  container.querySelector('#preview-retake')?.addEventListener('click', () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    setState({ userPhoto: null });
  });
}

export function cleanupUpload(): void {
  stopCamera();
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
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
