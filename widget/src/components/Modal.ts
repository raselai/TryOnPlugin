import { getState, closeWidget, subscribe, retryWithSamePhoto, View } from '../state';
import { renderConsent } from './ConsentGate';
import { renderUpload } from './Upload';
import { renderSelectors } from './Selectors';
import { renderProgress } from './Progress';
import { renderResult } from './Result';

let previouslyFocused: HTMLElement | null = null;

export function createModal(shadowRoot: ShadowRoot): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Hair Extension Try-On');

  const header = document.createElement('div');
  header.className = 'header';

  const title = document.createElement('h2');
  title.className = 'title';
  title.id = 'tryon-modal-title';
  title.textContent = 'Hair Extension Try-On';
  modal.setAttribute('aria-labelledby', 'tryon-modal-title');

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

  // Focus trap — Tab and Shift+Tab cycle within the modal
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], select, textarea'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if on first, wrap to last
      if (shadowRoot.activeElement === first || document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if on last, wrap to first
      if (shadowRoot.activeElement === last || document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Subscribe to state changes and render appropriate view
  subscribe((state) => {
    renderView(content, state.view, shadowRoot);

    if (state.view === 'closed') {
      backdrop.classList.remove('visible');
      // Restore focus to the element that opened the modal
      if (previouslyFocused) {
        previouslyFocused.focus();
        previouslyFocused = null;
      }
    } else {
      backdrop.classList.add('visible');
      // Save the currently focused element and move focus into the modal
      if (!previouslyFocused) {
        previouslyFocused = document.activeElement as HTMLElement;
      }
      // Focus the close button after render
      requestAnimationFrame(() => {
        closeBtn.focus();
      });
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
    case 'selectors':
      renderSelectors(container);
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
