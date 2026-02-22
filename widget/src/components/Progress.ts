import { getState, setError, closeWidget } from '../state';

let abortController: AbortController | null = null;
let slowTimer: ReturnType<typeof setTimeout> | null = null;

export function renderProgress(container: HTMLElement): void {
  const state = getState();

  container.innerHTML = `
    <div class="progress-content">
      <div class="spinner"></div>
      <p class="progress-text" id="progress-text">${escapeHtml(state.progress || 'Processing...')}</p>
      <p class="progress-subtext" id="progress-subtext">This may take up to a minute</p>
      <button class="btn btn-secondary cancel-btn" id="progress-cancel">Cancel</button>
    </div>
  `;

  // Show "taking longer" message after 30s
  clearSlowTimer();
  slowTimer = setTimeout(() => {
    const subtext = container.querySelector('#progress-subtext');
    if (subtext) {
      subtext.textContent = 'Taking longer than usual, please wait...';
    }
  }, 30000);

  container.querySelector('#progress-cancel')?.addEventListener('click', () => {
    cancelProcessing();
    closeWidget();
  });
}

export function getAbortController(): AbortController {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  return abortController;
}

export function cancelProcessing(): void {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  clearSlowTimer();
}

function clearSlowTimer(): void {
  if (slowTimer) {
    clearTimeout(slowTimer);
    slowTimer = null;
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
