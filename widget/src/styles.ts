export const styles = `
:host {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1a1a1a;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.backdrop.visible {
  opacity: 1;
}

.modal {
  background: #fff;
  width: min(480px, 92vw);
  max-height: 90vh;
  overflow: auto;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.95);
  transition: transform 0.2s ease;
}

.backdrop.visible .modal {
  transform: scale(1);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  transition: background 0.15s;
}

.close-btn:hover {
  background: #e5e5e5;
}

/* Consent View */
.consent-content {
  text-align: center;
  padding: 20px 0;
}

.consent-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.consent-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.consent-text {
  color: #666;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.consent-link {
  color: #0066cc;
  text-decoration: none;
}

.consent-link:hover {
  text-decoration: underline;
}

.consent-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}

/* Upload View */
.upload-zone {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.upload-zone:hover,
.upload-zone.dragover {
  border-color: #0066cc;
  background: #f8faff;
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.upload-title {
  font-weight: 600;
  margin: 0 0 8px 0;
}

.upload-subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.upload-input {
  display: none;
}

.photo-guidance {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: #666;
}

.photo-guidance-title {
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
}

.preview-container {
  margin-top: 16px;
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #eee;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

/* Progress View */
.progress-content {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #eee;
  border-top-color: #0066cc;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-text {
  font-weight: 500;
  margin: 0 0 8px 0;
}

.progress-subtext {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.cancel-btn {
  margin-top: 24px;
}

/* Result View */
.result-content {
  text-align: center;
}

.result-image-container {
  position: relative;
  cursor: pointer;
}

.result-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.2s;
}

.result-image.zoomed {
  transform: scale(1.5);
  cursor: zoom-out;
}

.zoom-hint {
  font-size: 12px;
  color: #888;
  margin: 8px 0 0 0;
}

.result-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

/* Error View */
.error-content {
  text-align: center;
  padding: 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.error-text {
  color: #666;
  margin: 0 0 20px 0;
}

/* Buttons */
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: #0066cc;
  color: #fff;
}

.btn-primary:hover {
  background: #0052a3;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e5e5e5;
}

.btn-success {
  background: #22c55e;
  color: #fff;
}

.btn-success:hover {
  background: #16a34a;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;
