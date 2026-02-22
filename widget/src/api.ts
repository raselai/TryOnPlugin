import { openWidget, closeWidget, setState, getState } from './state';
import { dispatchTryOnEvent } from './events';
import { setConfig, WidgetConfig } from './config';

export interface TryOnAPI {
  open(options?: { productId?: string }): void;
  close(): void;
  _init(config: Partial<WidgetConfig>): void;
  _ready: boolean;
}

export function createAPI(): TryOnAPI {
  return {
    _ready: true,

    open(options) {
      const productId = options?.productId || getState().productId;
      openWidget(productId);
      dispatchTryOnEvent('tryon:open', { productId });
    },

    close() {
      closeWidget();
      dispatchTryOnEvent('tryon:close');
    },

    _init(config) {
      setConfig(config);
    }
  };
}
