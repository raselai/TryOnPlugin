/**
 * TryOn Widget Async Loader
 * Lightweight loader script (<2KB gzipped) that lazy-loads the main widget on first interaction
 */

// Capture script URL at load time (must use document.currentScript for classic/async scripts)
const SCRIPT_URL = (document.currentScript as HTMLScriptElement)?.src || '';
const WIDGET_SCRIPT_ID = 'tryon-widget-script';

interface TryOnConfig {
  apiBaseUrl?: string;
  privacyPolicyUrl?: string;
  apiKey?: string | null;
}

interface TryOnAPI {
  open(options?: { productImage?: string; productId?: string }): void;
  close(): void;
  setProduct(imageUrl: string, productId?: string): void;
  _init(config: TryOnConfig): void;
  _ready: boolean;
  _pendingOpen?: { productImage: string; productId?: string };
}

// Store reference to the real widget API once loaded
let widgetAPI: TryOnAPI | null = null;

function getScriptConfig(): TryOnConfig {
  // Find the script tag that loaded us to read data attributes
  const scripts = document.querySelectorAll('script[data-tryon-api], script[data-tryon-api-key], script[src*="loader"]');
  for (const script of scripts) {
    const el = script as HTMLScriptElement;
    if (el.dataset.tryonApi || el.dataset.tryonPrivacy || el.dataset.tryonApiKey) {
      return {
        apiBaseUrl: el.dataset.tryonApi || undefined,
        privacyPolicyUrl: el.dataset.tryonPrivacy || undefined,
        apiKey: el.dataset.tryonApiKey || null
      };
    }
  }
  return {};
}

function getWidgetScriptUrl(): string {
  // Dev mode: loader.ts -> main.ts
  if (SCRIPT_URL.includes('loader.ts')) {
    return SCRIPT_URL.replace('loader.ts', 'main.ts');
  }
  // Production: loader.js -> widget.js
  if (SCRIPT_URL.includes('loader.js')) {
    return SCRIPT_URL.replace('loader.js', 'widget.js');
  }
  // Fallback
  return new URL('./widget.js', SCRIPT_URL).href;
}

function loadWidget(callback: () => void): void {
  if (document.getElementById(WIDGET_SCRIPT_ID)) {
    // Already loaded, call callback
    if (widgetAPI) {
      callback();
    }
    return;
  }

  const script = document.createElement('script');
  script.id = WIDGET_SCRIPT_ID;
  script.src = getWidgetScriptUrl();
  script.type = 'module';
  script.onload = () => {
    // Wait a tick for the module to initialize and set window.TryOn
    setTimeout(() => {
      widgetAPI = (window as any).TryOn;
      callback();
    }, 0);
  };
  script.onerror = () => console.error('[TryOn] Failed to load widget from:', script.src);
  document.head.appendChild(script);
}

const config = getScriptConfig();

const TryOn: TryOnAPI = {
  _ready: false,

  open(options) {
    if (this._ready && widgetAPI) {
      widgetAPI.open(options);
    } else {
      this._pendingOpen = options ? { productImage: options.productImage || '', productId: options.productId } : undefined;
      loadWidget(() => {
        if (widgetAPI) {
          widgetAPI._init(config);
          this._ready = true;
          if (this._pendingOpen) {
            widgetAPI.open(this._pendingOpen);
            this._pendingOpen = undefined;
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

  setProduct(imageUrl, productId) {
    if (this._ready && widgetAPI) {
      widgetAPI.setProduct(imageUrl, productId);
    }
  },

  _init(cfg) {
    Object.assign(config, cfg);
  }
};

(window as any).TryOn = TryOn;

function bindButtons(): void {
  const buttons = document.querySelectorAll<HTMLElement>('[data-tryon-image]');
  buttons.forEach(button => {
    if (button.dataset.tryonBound === 'true') return;
    button.dataset.tryonBound = 'true';

    button.addEventListener('click', () => {
      const productImage = button.dataset.tryonImage || '';
      const productId = button.dataset.tryonId;
      TryOn.open({ productImage, productId });
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
