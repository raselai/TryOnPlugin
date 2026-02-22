export type View = 'closed' | 'consent' | 'upload' | 'processing' | 'result' | 'error';

export type TryOnResult = {
  imageBase64: string;
  mimeType: string;
};

export type State = {
  view: View;
  userPhoto: File | null;
  productImageUrl: string;
  productId?: string;
  result: TryOnResult | null;
  error: string | null;
  progress: string;
};

type Listener = (state: State) => void;

const initialState: State = {
  view: 'closed',
  userPhoto: null,
  productImageUrl: '',
  productId: undefined,
  result: null,
  error: null,
  progress: ''
};

let state: State = { ...initialState };
const listeners: Set<Listener> = new Set();

export function getState(): State {
  return state;
}

export function setState(partial: Partial<State>): void {
  state = { ...state, ...partial };
  listeners.forEach(listener => listener(state));
}

export function resetState(): void {
  state = { ...initialState };
  listeners.forEach(listener => listener(state));
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function openWidget(productImageUrl: string, productId?: string): void {
  const hasConsent = localStorage.getItem('tryon-consent') === 'true';
  setState({
    view: hasConsent ? 'upload' : 'consent',
    productImageUrl,
    productId,
    result: null,
    error: null,
    progress: ''
  });
}

export function closeWidget(): void {
  setState({ view: 'closed' });
}

export function setConsent(accepted: boolean): void {
  if (accepted) {
    localStorage.setItem('tryon-consent', 'true');
    setState({ view: 'upload' });
  } else {
    closeWidget();
  }
}

export function setUserPhoto(file: File): void {
  setState({ userPhoto: file });
}

export function startProcessing(): void {
  setState({ view: 'processing', progress: 'Uploading...', error: null });
}

export function setProgress(progress: string): void {
  setState({ progress });
}

export function setResult(result: TryOnResult): void {
  setState({ view: 'result', result });
}

export function setError(error: string): void {
  setState({ view: 'error', error });
}

export function retryWithSamePhoto(): void {
  setState({ view: 'upload', error: null, result: null });
}
