export type View = 'closed' | 'consent' | 'selectors' | 'upload' | 'processing' | 'result' | 'error';

export type Shade = {
  id: string;
  name: string;
  hexColor: string;
  shopifyVariantId?: string | null;
};

export type Length = {
  id: string;
  label: string;
  inches: number;
  bodyLandmark: string;
};

export type Texture = {
  id: string;
  name: string;
};

export type TryOnResult = {
  imageBase64: string;
  mimeType: string;
};

export type Catalog = {
  shades: Shade[];
  lengths: Length[];
  textures: Texture[];
  loaded: boolean;
};

export type State = {
  view: View;
  userPhoto: File | null;
  originalImage: string | null; // data URL of user's original photo
  selectedShade: Shade | null;
  selectedLength: Length | null;
  selectedTexture: Texture | null;
  catalog: Catalog;
  result: TryOnResult | null;
  error: string | null;
  progress: string;
  productId?: string;
};

type Listener = (state: State) => void;

const initialState: State = {
  view: 'closed',
  userPhoto: null,
  originalImage: null,
  selectedShade: null,
  selectedLength: null,
  selectedTexture: null,
  catalog: { shades: [], lengths: [], textures: [], loaded: false },
  result: null,
  error: null,
  progress: '',
  productId: undefined,
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

export function openWidget(productId?: string): void {
  const hasConsent = localStorage.getItem('tryon-consent') === 'true';
  setState({
    view: hasConsent ? 'upload' : 'consent',
    productId,
    result: null,
    error: null,
    progress: '',
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

export function tryAnotherShade(): void {
  setState({ view: 'selectors', error: null, result: null, selectedShade: null });
}
