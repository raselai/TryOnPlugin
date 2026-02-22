import { getState, retryWithSamePhoto, closeWidget } from '../state';
import { dispatchTryOnEvent } from '../events';

let isZoomed = false;

export function renderResult(container: HTMLElement): void {
  const state = getState();
  if (!state.result) {
    container.innerHTML = '<p>No result available</p>';
    return;
  }

  const imageSrc = `data:${state.result.mimeType};base64,${state.result.imageBase64}`;
  isZoomed = false;

  container.innerHTML = `
    <div class="result-content">
      <div class="result-image-container" id="result-container">
        <img src="${imageSrc}" alt="Try-on result" class="result-image" id="result-image" />
      </div>
      <p class="zoom-hint">Click image to zoom</p>
      <div class="result-actions">
        <button class="btn btn-success" id="result-add-cart">Add to Cart</button>
        <button class="btn btn-secondary" id="result-try-another">Try Another</button>
      </div>
    </div>
  `;

  const imageContainer = container.querySelector('#result-container') as HTMLElement;
  const image = container.querySelector('#result-image') as HTMLImageElement;

  imageContainer.addEventListener('click', () => {
    isZoomed = !isZoomed;
    if (isZoomed) {
      image.classList.add('zoomed');
    } else {
      image.classList.remove('zoomed');
    }
  });

  container.querySelector('#result-add-cart')?.addEventListener('click', () => {
    dispatchTryOnEvent('tryon:addToCart', {
      productId: state.productId,
      productImageUrl: state.productImageUrl,
      tryOnImage: imageSrc
    });
    closeWidget();
  });

  container.querySelector('#result-try-another')?.addEventListener('click', () => {
    retryWithSamePhoto();
  });

  // Dispatch result ready event
  dispatchTryOnEvent('tryon:resultReady', {
    productId: state.productId,
    productImageUrl: state.productImageUrl,
    tryOnImage: imageSrc
  });
}
