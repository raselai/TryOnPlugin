import { styles } from './styles';
import { subscribe, getState, closeWidget } from './state';
import { createModal } from './components/Modal';
import { createAPI } from './api';

const HOST_ID = 'tryon-widget-host';

let host: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;

function initWidget(): void {
  // Check if already initialized
  if (document.getElementById(HOST_ID)) {
    return;
  }

  // Create host element with max z-index
  host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 2147483647;
    pointer-events: none;
  `;

  // Attach Shadow DOM (closed mode for full isolation)
  shadowRoot = host.attachShadow({ mode: 'closed' });

  // Inject styles
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadowRoot.appendChild(styleEl);

  // Create modal structure
  const modal = createModal(shadowRoot);
  modal.style.pointerEvents = 'auto';
  shadowRoot.appendChild(modal);

  // Handle visibility
  subscribe((state) => {
    if (state.view === 'closed') {
      host!.style.pointerEvents = 'none';
    } else {
      host!.style.pointerEvents = 'auto';
    }
  });

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && getState().view !== 'closed') {
      closeWidget();
    }
  });

  document.body.appendChild(host);
}

// Initialize on load
function init(): void {
  initWidget();

  // Expose public API (overwrites loader)
  const api = createAPI();
  (window as any).TryOn = api;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for module usage
export { createAPI };
