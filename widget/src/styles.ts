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

/* Brand Colors — Muse Hair Pro */
/* Primary: warm rose-gold / mauve */
/* Accent: deep plum for contrast */

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
  color: #3d2b2b;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f0ee;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #6b5454;
  transition: background 0.15s;
}

.close-btn:hover {
  background: #e8ddd9;
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
  color: #3d2b2b;
}

.consent-text {
  color: #666;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.consent-link {
  color: #9b6b6b;
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

/* Capture Tabs */
.capture-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-radius: 10px;
  background: #f5f0ee;
  padding: 4px;
}

.capture-tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b5454;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.capture-tab.active {
  background: #fff;
  color: #3d2b2b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.capture-tab:hover:not(.active) {
  color: #3d2b2b;
}

/* Camera View */
.camera-container {
  text-align: center;
}

.camera-viewfinder {
  position: relative;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 4/3;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.camera-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.camera-loading p {
  margin: 0;
}

.camera-actions {
  margin-top: 16px;
}

.camera-capture-btn {
  min-width: 160px;
}

.camera-error {
  text-align: center;
  padding: 32px 16px;
  background: #faf6f5;
  border-radius: 12px;
}

.camera-error-icon {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.camera-error-title {
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #3d2b2b;
}

.camera-error-text {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* Upload View */
.upload-zone {
  border: 2px dashed #d4b8b8;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.upload-zone:hover,
.upload-zone.dragover {
  border-color: #9b6b6b;
  background: #faf6f5;
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
  background: #faf6f5;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: #666;
}

.photo-guidance-title {
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #3d2b2b;
}

.preview-container {
  margin-top: 16px;
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e8ddd9;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

/* Selectors View */
.selectors-content {
  padding: 4px 0;
}

.selectors-loading {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 14px;
}

.selectors-loading p {
  margin: 0;
}

.selector-section {
  margin-bottom: 20px;
}

.selector-label {
  font-weight: 600;
  font-size: 14px;
  margin: 0 0 10px 0;
  color: #3d2b2b;
}

.selector-value {
  font-weight: 400;
  color: #9b6b6b;
}

.shade-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.shade-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  padding: 0;
}

.shade-swatch:hover {
  transform: scale(1.1);
}

.shade-swatch.selected {
  border-color: #3d2b2b;
  transform: scale(1.1);
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #d4b8b8;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-align: center;
}

.option-btn:hover {
  border-color: #9b6b6b;
  background: #faf6f5;
}

.option-btn.selected {
  border-color: #9b6b6b;
  background: #9b6b6b;
  color: #fff;
}

.option-btn-primary {
  display: block;
  font-weight: 600;
  font-size: 14px;
}

.option-btn-secondary {
  display: block;
  font-size: 11px;
  opacity: 0.7;
  margin-top: 2px;
}

.selectors-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.selectors-actions .btn-primary {
  flex: 1;
}

/* Progress View */
.progress-content {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #f0e4e0;
  border-top-color: #9b6b6b;
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

.result-selection-bar {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.result-selection-chip {
  display: inline-block;
  padding: 4px 10px;
  background: #f5f0ee;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #3d2b2b;
}

.result-view-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f5f0ee;
  padding: 3px;
}

.result-view-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b5454;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.result-view-tab.active {
  background: #fff;
  color: #3d2b2b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Before/After Slider */
.before-after-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  cursor: col-resize;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.before-after-before {
  position: absolute;
  inset: 0;
  width: 50%;
  overflow: hidden;
  z-index: 1;
}

.before-after-after {
  position: relative;
}

.before-after-img {
  display: block;
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  pointer-events: none;
}

.before-after-before .before-after-img {
  width: 100%;
  min-width: 0;
  /* Match the after image's rendered size by using the container's full width */
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  object-fit: contain;
}

.before-after-label {
  position: absolute;
  bottom: 10px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
}

.before-label {
  left: 10px;
}

.after-label {
  right: 10px;
}

.before-after-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 4px;
  margin-left: -2px;
  background: #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.before-after-handle-line {
  width: 2px;
  flex: 1;
  background: #fff;
}

.before-after-handle-grip {
  width: 28px;
  height: 28px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.before-after-handle-grip::before {
  content: '\\2194';
  font-size: 14px;
  color: #3d2b2b;
}

/* Full result image (non-slider view) */
.result-image-container {
  position: relative;
}

.result-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}

.result-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Toast notification */
.result-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #3d2b2b;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 10;
  pointer-events: none;
}

.result-toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
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
  color: #3d2b2b;
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
  background: #9b6b6b;
  color: #fff;
}

.btn-primary:hover {
  background: #7d5555;
}

.btn-secondary {
  background: #f5f0ee;
  color: #3d2b2b;
}

.btn-secondary:hover {
  background: #e8ddd9;
}

.btn-success {
  background: #6b8f6b;
  color: #fff;
}

.btn-success:hover {
  background: #567856;
}

.btn-outline {
  background: transparent;
  color: #9b6b6b;
  border: 1px solid #d4b8b8;
}

.btn-outline:hover {
  background: #faf6f5;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Mobile Responsive ── */
@media (max-width: 480px) {
  .modal {
    width: 100vw;
    max-height: 100vh;
    border-radius: 12px 12px 0 0;
    padding: 16px;
    margin-top: auto;
  }

  .backdrop {
    align-items: flex-end;
  }

  .title {
    font-size: 17px;
  }

  .header {
    margin-bottom: 14px;
  }

  /* Upload */
  .upload-zone {
    padding: 24px 16px;
  }

  .capture-tabs {
    margin-bottom: 12px;
  }

  .capture-tab {
    padding: 8px 12px;
    font-size: 13px;
  }

  /* Camera */
  .camera-viewfinder {
    aspect-ratio: 3/4;
  }

  /* Selectors */
  .shade-swatch {
    width: 40px;
    height: 40px;
  }

  .shade-grid {
    gap: 8px;
  }

  .option-btn {
    padding: 8px 12px;
  }

  .selectors-actions {
    flex-direction: column;
  }

  .selectors-actions .btn {
    width: 100%;
  }

  /* Result */
  .result-actions {
    flex-direction: column;
    gap: 8px;
  }

  .result-actions .btn {
    width: 100%;
  }

  .result-view-tabs {
    margin-bottom: 8px;
  }

  .before-after-img {
    max-height: 300px;
  }

  .result-image {
    max-height: 300px;
  }

  .result-selection-bar {
    gap: 6px;
  }

  /* Consent */
  .consent-actions {
    flex-direction: column;
  }

  .consent-actions .btn {
    width: 100%;
  }

  /* Preview */
  .preview-actions {
    flex-direction: column;
  }

  .preview-actions .btn {
    width: 100%;
  }

  /* Buttons slightly larger tap targets */
  .btn {
    padding: 14px 24px;
    font-size: 15px;
  }
}
`;
