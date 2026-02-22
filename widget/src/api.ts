import { openWidget, closeWidget, setState, getState } from './state';
import { dispatchTryOnEvent } from './events';
import { setConfig, WidgetConfig } from './config';

export interface TryOnAPI {
  open(options?: { productImage?: string; productId?: string }): void;
  close(): void;
  setProduct(imageUrl: string, productId?: string): void;
  _init(config: Partial<WidgetConfig>): void;
  _ready: boolean;
}

export function createAPI(): TryOnAPI {
  return {
    _ready: true,

    open(options) {
      const productImage = options?.productImage || getState().productImageUrl;
      const productId = options?.productId || getState().productId;

      if (!productImage) {
        console.warn('[TryOn] No product image specified');
        return;
      }

      openWidget(productImage, productId);
      dispatchTryOnEvent('tryon:open', { productImageUrl: productImage, productId });
    },

    close() {
      closeWidget();
      dispatchTryOnEvent('tryon:close');
    },

    setProduct(imageUrl, productId) {
      setState({ productImageUrl: imageUrl, productId });
    },

    _init(config) {
      setConfig(config);
    }
  };
}
