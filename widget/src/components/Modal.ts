import { getState, closeWidget, subscribe, retryWithSamePhoto, View } from '../state';
import { renderConsent } from './ConsentGate';
import { renderUpload } from './Upload';
import { renderProgress } from './Progress';
import { renderResult } from './Result';

export function createModal(shadowRoot: ShadowRoot): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'header';

  const title = document.createElement('h2');
  title.className = 'title';
  title.textContent = 'Virtual Try-On';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.addEventListener('click', closeWidget);

  header.appendChild(title);
  header.appendChild(closeBtn);
  modal.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content';
  modal.appendChild(content);

  backdrop.appendChild(modal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeWidget();
    }
  });

  // Subscribe to state changes and render appropriate view
  subscribe((state) => {
    renderView(content, state.view, shadowRoot);

    if (state.view === 'closed') {
      backdrop.classList.remove('visible');
    } else {
      backdrop.classList.add('visible');
    }
  });

  return backdrop;
}

function renderView(container: HTMLElement, view: View, shadowRoot: ShadowRoot): void {
  const state = getState();

  switch (view) {
    case 'closed':
      container.innerHTML = '';
      break;
    case 'consent':
      renderConsent(container);
      break;
    case 'upload':
      renderUpload(container, shadowRoot);
      break;
    case 'processing':
      renderProgress(container);
      break;
    case 'result':
      renderResult(container);
      break;
    case 'error':
      renderError(container, state.error || 'An unexpected error occurred');
      break;
  }
}

function renderError(container: HTMLElement, errorMessage: string): void {
  container.innerHTML = `
    <div class="error-content">
      <div class="error-icon">!</div>
      <h3 class="error-title">Something went wrong</h3>
      <p class="error-text">${escapeHtml(errorMessage)}</p>
      <div class="result-actions">
        <button class="btn btn-primary" id="error-retry">Try Again</button>
        <button class="btn btn-secondary" id="error-close">Close</button>
      </div>
    </div>
  `;

  container.querySelector('#error-retry')?.addEventListener('click', retryWithSamePhoto);
  container.querySelector('#error-close')?.addEventListener('click', closeWidget);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
