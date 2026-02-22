import { setConsent, closeWidget } from '../state';
import { getConfig } from '../config';

export function renderConsent(container: HTMLElement): void {
  const config = getConfig();
  const privacyUrl = config.privacyPolicyUrl || '#';

  container.innerHTML = `
    <div class="consent-content">
      <div class="consent-icon">&#128247;</div>
      <h3 class="consent-title">Photo Permission Required</h3>
      <p class="consent-text">
        To create your virtual try-on, we need to process your photo.
        Your photo is only used for this try-on and is not stored.
      </p>
      <p class="consent-text">
        <a href="${escapeAttr(privacyUrl)}" target="_blank" rel="noopener" class="consent-link">
          View Privacy Policy
        </a>
      </p>
      <div class="consent-actions">
        <button class="btn btn-primary" id="consent-accept">I Agree</button>
        <button class="btn btn-secondary" id="consent-decline">No Thanks</button>
      </div>
    </div>
  `;

  container.querySelector('#consent-accept')?.addEventListener('click', () => {
    setConsent(true);
  });

  container.querySelector('#consent-decline')?.addEventListener('click', () => {
    setConsent(false);
  });
}

function escapeAttr(text: string): string {
  return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
