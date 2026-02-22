import { getState, setState, startProcessing, setProgress, setResult, setError } from '../state';
import type { Shade, Length, Texture } from '../state';
import { fetchCatalog } from '../services/api';
import { submitTryOn } from '../services/api';

export async function renderSelectors(container: HTMLElement): Promise<void> {
  const state = getState();

  // Show loading while catalog fetches
  if (!state.catalog.loaded) {
    container.innerHTML = `
      <div class="selectors-loading">
        <div class="spinner"></div>
        <p>Loading options...</p>
      </div>
    `;

    try {
      const catalog = await fetchCatalog();
      setState({ catalog });
      // Re-render now that catalog is loaded
      renderSelectorsUI(container);
    } catch (err) {
      container.innerHTML = `
        <div class="error-content">
          <p class="error-text">Failed to load shade options. Please try again.</p>
          <button class="btn btn-primary" id="catalog-retry">Retry</button>
        </div>
      `;
      container.querySelector('#catalog-retry')?.addEventListener('click', () => {
        renderSelectors(container);
      });
    }
    return;
  }

  renderSelectorsUI(container);
}

function renderSelectorsUI(container: HTMLElement): void {
  const state = getState();
  const { shades, lengths, textures } = state.catalog;

  const selectedShade = state.selectedShade;
  const selectedLength = state.selectedLength;
  const selectedTexture = state.selectedTexture;

  const allSelected = selectedShade && selectedLength && selectedTexture;

  container.innerHTML = `
    <div class="selectors-content">
      <div class="selector-section">
        <p class="selector-label">Shade${selectedShade ? `: <span class="selector-value">${escapeHtml(selectedShade.name)}</span>` : ''}</p>
        <div class="shade-grid" id="shade-grid">
          ${shades.map(shade => `
            <button
              class="shade-swatch ${selectedShade?.id === shade.id ? 'selected' : ''}"
              data-shade-id="${shade.id}"
              title="${escapeHtml(shade.name)}"
              style="background-color: ${shade.hexColor};"
            ></button>
          `).join('')}
        </div>
      </div>

      <div class="selector-section">
        <p class="selector-label">Length</p>
        <div class="option-group" id="length-group">
          ${lengths.map(length => `
            <button
              class="option-btn ${selectedLength?.id === length.id ? 'selected' : ''}"
              data-length-id="${length.id}"
            >
              <span class="option-btn-primary">${length.inches}"</span>
              <span class="option-btn-secondary">${escapeHtml(length.bodyLandmark)}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="selector-section">
        <p class="selector-label">Texture</p>
        <div class="option-group" id="texture-group">
          ${textures.map(texture => `
            <button
              class="option-btn ${selectedTexture?.id === texture.id ? 'selected' : ''}"
              data-texture-id="${texture.id}"
            >
              <span class="option-btn-primary">${escapeHtml(texture.name)}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="selectors-actions">
        <button class="btn btn-primary" id="selectors-continue" ${allSelected ? '' : 'disabled'}>
          See My Look
        </button>
        <button class="btn btn-secondary" id="selectors-back">Change Photo</button>
      </div>
    </div>
  `;

  // Shade click handlers
  container.querySelectorAll<HTMLElement>('[data-shade-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const shade = shades.find(s => s.id === btn.dataset.shadeId);
      if (shade) {
        setState({ selectedShade: shade });
      }
    });
  });

  // Length click handlers
  container.querySelectorAll<HTMLElement>('[data-length-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const length = lengths.find(l => l.id === btn.dataset.lengthId);
      if (length) {
        setState({ selectedLength: length });
      }
    });
  });

  // Texture click handlers
  container.querySelectorAll<HTMLElement>('[data-texture-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const texture = textures.find(t => t.id === btn.dataset.textureId);
      if (texture) {
        setState({ selectedTexture: texture });
      }
    });
  });

  // Continue — submit try-on
  container.querySelector('#selectors-continue')?.addEventListener('click', () => {
    handleTryOn();
  });

  // Back to upload
  container.querySelector('#selectors-back')?.addEventListener('click', () => {
    setState({ view: 'upload' });
  });
}

async function handleTryOn(): Promise<void> {
  const state = getState();
  if (!state.userPhoto || !state.selectedShade || !state.selectedLength || !state.selectedTexture) return;

  startProcessing();

  try {
    const result = await submitTryOn(
      state.userPhoto,
      state.selectedShade.id,
      state.selectedLength.id,
      state.selectedTexture.id,
      (progress) => {
        setProgress(progress);
      }
    );

    setResult(result);
  } catch (err: any) {
    setError(err.message || 'Try-on failed. Please try again.');
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
