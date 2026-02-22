import { getState, tryAnotherShade, closeWidget } from '../state';
import { dispatchTryOnEvent } from '../events';

let sliderActive = false;

export function renderResult(container: HTMLElement): void {
  const state = getState();
  if (!state.result) {
    container.innerHTML = '<p>No result available</p>';
    return;
  }

  const resultSrc = `data:${state.result.mimeType};base64,${state.result.imageBase64}`;
  const originalSrc = state.originalImage || '';
  const hasOriginal = !!originalSrc;
  const shadeName = state.selectedShade?.name || '';
  const lengthLabel = state.selectedLength ? `${state.selectedLength.inches}"` : '';
  const textureName = state.selectedTexture?.name || '';

  container.innerHTML = `
    <div class="result-content">
      <div class="result-selection-bar">
        <span class="result-selection-chip" style="border-left: 4px solid ${state.selectedShade?.hexColor || '#999'}">${escapeHtml(shadeName)}</span>
        <span class="result-selection-chip">${escapeHtml(lengthLabel)}</span>
        <span class="result-selection-chip">${escapeHtml(textureName)}</span>
      </div>

      ${hasOriginal ? `
        <div class="result-view-tabs">
          <button class="result-view-tab active" id="tab-compare">Before / After</button>
          <button class="result-view-tab" id="tab-result">Result Only</button>
        </div>
      ` : ''}

      <div id="result-display">
        ${hasOriginal ? renderBeforeAfterHtml(originalSrc, resultSrc) : renderFullImageHtml(resultSrc)}
      </div>

      <div class="result-actions">
        <button class="btn btn-success" id="result-add-cart">Add to Cart</button>
        <button class="btn btn-outline" id="result-download">Download</button>
        <button class="btn btn-outline" id="result-share">Share</button>
        <button class="btn btn-secondary" id="result-try-another">Try Another Shade</button>
      </div>

      <div class="result-toast" id="result-toast"></div>
    </div>
  `;

  const display = container.querySelector('#result-display') as HTMLElement;

  // Tab switching (before/after vs result only)
  if (hasOriginal) {
    const tabCompare = container.querySelector('#tab-compare') as HTMLElement;
    const tabResult = container.querySelector('#tab-result') as HTMLElement;

    tabCompare.addEventListener('click', () => {
      tabCompare.classList.add('active');
      tabResult.classList.remove('active');
      display.innerHTML = renderBeforeAfterHtml(originalSrc, resultSrc);
      attachSliderEvents(display);
    });

    tabResult.addEventListener('click', () => {
      tabResult.classList.add('active');
      tabCompare.classList.remove('active');
      display.innerHTML = renderFullImageHtml(resultSrc);
    });

    // Attach slider events for initial before/after view
    attachSliderEvents(display);
  }

  // Add to Cart
  container.querySelector('#result-add-cart')?.addEventListener('click', () => {
    handleAddToCart(resultSrc);
  });

  // Download
  container.querySelector('#result-download')?.addEventListener('click', () => {
    downloadImage(resultSrc, `muse-hair-pro-${shadeName.toLowerCase().replace(/\s+/g, '-')}.png`);
  });

  // Share
  container.querySelector('#result-share')?.addEventListener('click', () => {
    handleShare(resultSrc, container);
  });

  // Try Another Shade
  container.querySelector('#result-try-another')?.addEventListener('click', () => {
    tryAnotherShade();
  });

  // Dispatch result ready event
  dispatchTryOnEvent('tryon:resultReady', {
    productId: state.productId,
    shade: state.selectedShade,
    tryOnImage: resultSrc,
  });
}

function renderBeforeAfterHtml(originalSrc: string, resultSrc: string): string {
  return `
    <div class="before-after-container" id="before-after">
      <div class="before-after-before" id="before-side">
        <img src="${originalSrc}" alt="Before" class="before-after-img" draggable="false" />
        <span class="before-after-label before-label">Before</span>
      </div>
      <div class="before-after-after">
        <img src="${resultSrc}" alt="After" class="before-after-img" draggable="false" />
        <span class="before-after-label after-label">After</span>
      </div>
      <div class="before-after-handle" id="before-after-handle">
        <div class="before-after-handle-line"></div>
        <div class="before-after-handle-grip"></div>
        <div class="before-after-handle-line"></div>
      </div>
    </div>
  `;
}

function renderFullImageHtml(resultSrc: string): string {
  return `
    <div class="result-image-container">
      <img src="${resultSrc}" alt="Hair extension try-on result" class="result-image" />
    </div>
  `;
}

function attachSliderEvents(display: HTMLElement): void {
  const container = display.querySelector('#before-after') as HTMLElement;
  const beforeSide = display.querySelector('#before-side') as HTMLElement;
  const handle = display.querySelector('#before-after-handle') as HTMLElement;
  if (!container || !beforeSide || !handle) return;

  function updateSlider(clientX: number) {
    const rect = container.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    beforeSide.style.width = `${pct}%`;
    handle.style.left = `${pct}%`;
  }

  function onMove(e: MouseEvent | TouchEvent) {
    if (!sliderActive) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    updateSlider(clientX);
  }

  function onEnd() {
    sliderActive = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  }

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    sliderActive = true;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  });

  handle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    sliderActive = true;
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  });

  // Also allow clicking anywhere on the container to move the slider
  container.addEventListener('click', (e) => {
    updateSlider(e.clientX);
  });
}

async function handleAddToCart(resultSrc: string): Promise<void> {
  const state = getState();
  const variantId = state.selectedShade?.shopifyVariantId;

  // Try Shopify AJAX Cart API if variant ID is available
  if (variantId && isOnShopify()) {
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: Number(variantId),
            quantity: 1,
          }],
        }),
      });

      if (res.ok) {
        dispatchTryOnEvent('tryon:addToCart', {
          productId: state.productId,
          shade: state.selectedShade,
          length: state.selectedLength,
          texture: state.selectedTexture,
          tryOnImage: resultSrc,
        });
        showToast('Added to cart!');
        return;
      }
    } catch (err) {
      console.warn('[TryOn] Shopify cart add failed, falling back to event:', err);
    }
  }

  // Fallback: dispatch event for the host page to handle
  dispatchTryOnEvent('tryon:addToCart', {
    productId: state.productId,
    shade: state.selectedShade,
    length: state.selectedLength,
    texture: state.selectedTexture,
    tryOnImage: resultSrc,
  });
  showToast('Added to cart!');
}

function isOnShopify(): boolean {
  return typeof (window as any).Shopify !== 'undefined';
}

async function handleShare(resultSrc: string, container: HTMLElement): Promise<void> {
  const state = getState();
  const shareText = [
    `Check out this look from Muse Hair Pro!`,
    `Shade: ${state.selectedShade?.name || ''}`,
    `Length: ${state.selectedLength ? state.selectedLength.inches + '"' : ''}`,
    `Texture: ${state.selectedTexture?.name || ''}`,
  ].join('\n');

  // Try Web Share API first (mobile-friendly)
  if (navigator.share) {
    try {
      const blob = await dataUrlToBlob(resultSrc);
      const file = new File([blob], 'muse-hair-pro-tryon.png', { type: blob.type });

      await navigator.share({
        title: 'My Muse Hair Pro Look',
        text: shareText,
        files: [file],
      });
      return;
    } catch (err: any) {
      // User cancelled or share API doesn't support files — fall through to clipboard
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback: copy text to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    showToast('Details copied to clipboard!');
  } catch {
    // Final fallback: select text
    showToast('Share: ' + state.selectedShade?.name + ' ' + state.selectedLength?.inches + '" ' + state.selectedTexture?.name);
  }
}

function showToast(message: string): void {
  const toast = document.querySelector('#result-toast') as HTMLElement | null;
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 2500);
}

function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then(r => r.blob());
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
