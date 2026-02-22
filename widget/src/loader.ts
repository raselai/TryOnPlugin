/**
 * TryOn Widget Async Loader
 * Lightweight loader script (<2KB gzipped) that lazy-loads the main widget on first interaction
 */

// Capture script URL at load time
// - Classic/async scripts: document.currentScript works
// - Module scripts: document.currentScript is null, use import.meta.url
const SCRIPT_URL = (document.currentScript as HTMLScriptElement)?.src || import.meta.url || '';
const WIDGET_SCRIPT_ID = 'tryon-widget-script';
const IS_DEV = SCRIPT_URL.includes('loader.ts');

interface TryOnConfig {
  apiBaseUrl?: string;
  privacyPolicyUrl?: string;
}

interface TryOnAPI {
  open(options?: { productId?: string }): void;
  close(): void;
  _init(config: TryOnConfig): void;
  _ready: boolean;
  _pendingOpen?: { productId?: string };
}

// Store reference to the real widget API once loaded
let widgetAPI: TryOnAPI | null = null;

function getScriptConfig(): TryOnConfig {
  // Find the script tag that loaded us to read data attributes
  const scripts = document.querySelectorAll('script[data-tryon-api], script[src*="loader"]');
  for (const script of scripts) {
    const el = script as HTMLScriptElement;
    if (el.dataset.tryonApi || el.dataset.tryonPrivacy) {
      return {
        apiBaseUrl: el.dataset.tryonApi || undefined,
        privacyPolicyUrl: el.dataset.tryonPrivacy || undefined,
      };
    }
  }
  return {};
}

function getWidgetScriptUrl(): string {
  if (IS_DEV) {
    return SCRIPT_URL.replace('loader.ts', 'main.ts');
  }
  if (SCRIPT_URL.includes('loader.js')) {
    return SCRIPT_URL.replace('loader.js', 'widget.js');
  }
  try {
    return new URL('./widget.js', SCRIPT_URL).href;
  } catch {
    return '/widget.js';
  }
}

function loadWidget(callback: () => void): void {
  if (document.getElementById(WIDGET_SCRIPT_ID)) {
    if (widgetAPI) {
      callback();
    }
    return;
  }

  // In dev mode (Vite), use dynamic import for HMR support
  if (IS_DEV) {
    const marker = document.createElement('div');
    marker.id = WIDGET_SCRIPT_ID;
    marker.style.display = 'none';
    document.body.appendChild(marker);

    import(/* @vite-ignore */ getWidgetScriptUrl()).then(() => {
      widgetAPI = (window as any).TryOn;
      callback();
    }).catch((err) => {
      console.error('[TryOn] Failed to load widget:', err);
    });
    return;
  }

  // Production: inject script tag
  const script = document.createElement('script');
  script.id = WIDGET_SCRIPT_ID;
  script.src = getWidgetScriptUrl();
  script.type = 'module';
  script.onload = () => {
    setTimeout(() => {
      widgetAPI = (window as any).TryOn;
      callback();
    }, 0);
  };
  script.onerror = () => console.error('[TryOn] Failed to load widget from:', script.src);
  document.head.appendChild(script);
}

const config = getScriptConfig();

const TryOnWidget: TryOnAPI = {
  _ready: false,

  open(options) {
    if (this._ready && widgetAPI) {
      widgetAPI.open(options);
    } else {
      this._pendingOpen = options;
      loadWidget(() => {
        if (widgetAPI) {
          widgetAPI._init(config);
          this._ready = true;
          if (this._pendingOpen) {
            widgetAPI.open(this._pendingOpen);
            this._pendingOpen = undefined;
          } else {
            widgetAPI.open();
          }
        }
      });
    }
  },

  close() {
    if (this._ready && widgetAPI) {
      widgetAPI.close();
    }
  },

  _init(cfg) {
    Object.assign(config, cfg);
  }
};

// Expose as both TryOnWidget and TryOn for compatibility
(window as any).TryOnWidget = TryOnWidget;
(window as any).TryOn = TryOnWidget;

// Auto-bind any buttons with data-tryon-open attribute
function bindButtons(): void {
  const buttons = document.querySelectorAll<HTMLElement>('[data-tryon-open]');
  buttons.forEach(button => {
    if (button.dataset.tryonBound === 'true') return;
    button.dataset.tryonBound = 'true';

    button.addEventListener('click', () => {
      const productId = button.dataset.tryonProductId;
      TryOnWidget.open({ productId });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindButtons);
} else {
  bindButtons();
}

// Watch for dynamically added buttons
const observer = new MutationObserver(bindButtons);
observer.observe(document.body, { childList: true, subtree: true });
