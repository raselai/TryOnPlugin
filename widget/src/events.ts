export type TryOnEventType =
  | 'tryon:open'
  | 'tryon:close'
  | 'tryon:resultReady'
  | 'tryon:addToCart';

export interface TryOnEventDetail {
  productId?: string;
  shade?: any;
  length?: any;
  texture?: any;
  tryOnImage?: string;
}

export function dispatchTryOnEvent(type: TryOnEventType, detail?: TryOnEventDetail): void {
  const event = new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail: detail || {}
  });
  document.dispatchEvent(event);
}
