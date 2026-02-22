var ce=Object.defineProperty;var le=(e,t,o)=>t in e?ce(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o;var q=(e,t,o)=>le(e,typeof t!="symbol"?t+"":t,o);const de=`
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
`,ue={view:"closed",userPhoto:null,originalImage:null,selectedShade:null,selectedLength:null,selectedTexture:null,catalog:{shades:[],lengths:[],textures:[],loaded:!1},result:null,error:null,progress:"",productId:void 0};let M={...ue};const F=new Set;function m(){return M}function b(e){M={...M,...e},F.forEach(t=>t(M))}function ne(e){return F.add(e),()=>F.delete(e)}function pe(e){const t=localStorage.getItem("tryon-consent")==="true";b({view:t?"upload":"consent",productId:e,result:null,error:null,progress:""})}function x(){b({view:"closed"})}function X(e){e?(localStorage.setItem("tryon-consent","true"),b({view:"upload"})):x()}function fe(){b({view:"processing",progress:"Uploading...",error:null})}function be(e){b({progress:e})}function ge(e){b({view:"result",result:e})}function me(e){b({view:"error",error:e})}function he(){b({view:"upload",error:null,result:null})}function ve(){b({view:"selectors",error:null,result:null,selectedShade:null})}const xe={apiBaseUrl:"http://localhost:8787",privacyPolicyUrl:"#"};let N={...xe};function _(){return N}function we(e){N={...N,...e}}function ye(e){var r,n;const o=_().privacyPolicyUrl||"#";e.innerHTML=`
    <div class="consent-content">
      <div class="consent-icon">&#128135;</div>
      <h3 class="consent-title">Photo Permission</h3>
      <p class="consent-text">
        To show you how our hair extensions will look, we need to process your photo.
        Your photo is used only for this try-on and is not stored.
      </p>
      <p class="consent-text">
        <a href="${Ee(o)}" target="_blank" rel="noopener" class="consent-link">
          View Privacy Policy
        </a>
      </p>
      <div class="consent-actions">
        <button class="btn btn-primary" id="consent-accept">I Agree</button>
        <button class="btn btn-secondary" id="consent-decline">No Thanks</button>
      </div>
    </div>
  `,(r=e.querySelector("#consent-accept"))==null||r.addEventListener("click",()=>{X(!0)}),(n=e.querySelector("#consent-decline"))==null||n.addEventListener("click",()=>{X(!1)})}function Ee(e){return e.replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const T=2048,Le=2e6,ke=.9,G=.5,Te=.1;async function ae(e,t=Le){const o=await Se(e);let{width:r,height:n}=o;if(r>T||n>T){const l=Math.min(T/r,T/n);r=Math.round(r*l),n=Math.round(n*l)}const a=document.createElement("canvas");a.width=r,a.height=n;const s=a.getContext("2d");if(!s)throw new Error("Failed to get canvas context");s.drawImage(o,0,0,r,n);let i=ke,c=await H(a,"image/jpeg",i);for(;c.size>t&&i>G;)i-=Te,c=await H(a,"image/jpeg",i);if(c.size>t){const l=Math.sqrt(t/c.size)*.9;a.width=Math.round(r*l),a.height=Math.round(n*l),s.drawImage(o,0,0,a.width,a.height),c=await H(a,"image/jpeg",G)}return c}function Se(e){return new Promise((t,o)=>{const r=new Image,n=URL.createObjectURL(e);r.onload=()=>{URL.revokeObjectURL(n),t(r)},r.onerror=()=>{URL.revokeObjectURL(n),o(new Error("Failed to load image"))},r.src=n})}function H(e,t,o){return new Promise((r,n)=>{e.toBlob(a=>{a?r(a):n(new Error("Failed to create blob"))},t,o)})}async function Ie(e){if(!e.type.includes("jpeg")&&!e.type.includes("jpg"))return e;const t=await Ce(e);return t<=1?e:Ue(e,t)}async function Ce(e){try{const t=await e.slice(0,65536).arrayBuffer(),o=new DataView(t);if(o.getUint16(0)!==65496)return 1;let r=2;for(;r<o.byteLength-2;){const n=o.getUint16(r);if(r+=2,n===65505){const a=o.getUint16(r);if(r+=2,String.fromCharCode(o.getUint8(r),o.getUint8(r+1),o.getUint8(r+2),o.getUint8(r+3))!=="Exif")return 1;r+=6;const i=o.getUint16(r)===18761;r+=2,r+=2;const c=o.getUint32(r,i);r=r-4+c;const l=o.getUint16(r,i);r+=2;for(let p=0;p<l;p++){if(o.getUint16(r,i)===274)return o.getUint16(r+8,i);r+=12}return 1}else if((n&65280)===65280)r+=o.getUint16(r);else break}return 1}catch{return 1}}async function Ue(e,t){const o=await Me(e),r=document.createElement("canvas"),n=r.getContext("2d");if(!n)throw new Error("Failed to get canvas context");let a=o.width,s=o.height;switch(t>=5&&t<=8?(r.width=s,r.height=a):(r.width=a,r.height=s),t){case 2:n.scale(-1,1),n.translate(-a,0);break;case 3:n.rotate(Math.PI),n.translate(-a,-s);break;case 4:n.scale(1,-1),n.translate(0,-s);break;case 5:n.rotate(.5*Math.PI),n.scale(1,-1);break;case 6:n.rotate(.5*Math.PI),n.translate(0,-s);break;case 7:n.rotate(-.5*Math.PI),n.translate(-a,0),n.scale(1,-1);break;case 8:n.rotate(-.5*Math.PI),n.translate(-a,0);break}return n.drawImage(o,0,0),new Promise((i,c)=>{r.toBlob(l=>{l?i(l):c(new Error("Failed to create rotated image"))},"image/jpeg",.95)})}function Me(e){return new Promise((t,o)=>{const r=new Image,n=URL.createObjectURL(e);r.onload=()=>{URL.revokeObjectURL(n),t(r)},r.onerror=()=>{URL.revokeObjectURL(n),o(new Error("Failed to load image"))},r.src=n})}const Pe=["image/jpeg","image/png","image/webp"],ze=20*1024*1024;class B extends Error{constructor(t){super(t),this.name="ValidationError"}}function Oe(e){if(!Pe.includes(e.type))throw new B("Please upload a JPEG, PNG, or WebP image.");if(e.size>ze)throw new B("Image is too large. Please upload an image under 20MB.")}let L=null,P=null;function K(e,t){e.innerHTML=`
    <div class="camera-container">
      <div class="camera-viewfinder" id="camera-viewfinder">
        <video id="camera-video" autoplay playsinline muted class="camera-video"></video>
        <div class="camera-loading" id="camera-loading">
          <div class="spinner"></div>
          <p>Starting camera...</p>
        </div>
      </div>
      <div class="camera-actions">
        <button class="btn btn-primary camera-capture-btn" id="camera-capture" disabled>Capture Photo</button>
      </div>
    </div>
  `;const o=e.querySelector("#camera-video"),r=e.querySelector("#camera-capture"),n=e.querySelector("#camera-loading");P=o,Re(o,n,r,e),r.addEventListener("click",()=>{Ae(o,t)})}async function Re(e,t,o,r,n){try{L=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:960}},audio:!1}),e.srcObject=L,await e.play(),t.style.display="none",o.disabled=!1}catch(a){console.error("[TryOn] Camera error:",a),V();let s="Unable to access camera.";a.name==="NotAllowedError"||a.name==="PermissionDeniedError"?s="Camera permission was denied.":a.name==="NotFoundError"||a.name==="DevicesNotFoundError"?s="No camera found on this device.":a.name==="NotReadableError"&&(s="Camera is in use by another app."),r.innerHTML=`
      <div class="camera-error">
        <div class="camera-error-icon">&#128247;</div>
        <p class="camera-error-title">${s}</p>
        <p class="camera-error-text">Please upload a photo instead, or check your browser's camera permissions and try again.</p>
      </div>
    `}}async function Ae(e,t){const o=document.createElement("canvas");o.width=e.videoWidth,o.height=e.videoHeight;const r=o.getContext("2d");if(!r)return;r.translate(o.width,0),r.scale(-1,1),r.drawImage(e,0,0);const n=await new Promise((c,l)=>{o.toBlob(p=>p?c(p):l(new Error("Failed to capture")),"image/jpeg",.92)}),a=await ae(n);V();const s=URL.createObjectURL(a),i=await $e(a);b({userPhoto:new File([a],"camera-capture.jpg",{type:"image/jpeg"}),originalImage:i}),t(s)}function V(){L&&(L.getTracks().forEach(e=>e.stop()),L=null),P&&(P.srcObject=null,P=null)}function $e(e){return new Promise((t,o)=>{const r=new FileReader;r.onload=()=>t(r.result),r.onerror=()=>o(new Error("Failed to read image")),r.readAsDataURL(e)})}let g=null,S="upload";function je(e,t){const o=m();if(o.userPhoto!==null&&(!g&&o.userPhoto&&(g=URL.createObjectURL(o.userPhoto)),g)){R(e,g);return}qe(e)}function qe(e,t){if(!!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){He(e);return}e.innerHTML=`
    <div class="capture-tabs">
      <button class="capture-tab ${S==="upload"?"active":""}" id="tab-upload">Upload Photo</button>
      <button class="capture-tab ${S==="camera"?"active":""}" id="tab-camera">Use Camera</button>
    </div>
    <div id="capture-content"></div>
    <div class="photo-guidance">
      <p class="photo-guidance-title">For best results:</p>
      Face the camera with your hair down in good lighting. A clear view of your head and shoulders gives the most realistic result.
    </div>
  `;const r=e.querySelector("#capture-content"),n=e.querySelector("#tab-upload"),a=e.querySelector("#tab-camera");function s(i){S=i,n.classList.toggle("active",i==="upload"),a.classList.toggle("active",i==="camera"),i==="upload"?(V(),Q(r,e)):K(r,c=>{g=c,R(e,c)})}n.addEventListener("click",()=>s("upload")),a.addEventListener("click",()=>s("camera")),S==="camera"?K(r,i=>{g=i,R(e,i)}):Q(r,e)}function Q(e,t,o){e.innerHTML=`
    <div class="upload-zone" id="upload-zone">
      <div class="upload-icon">&#128247;</div>
      <p class="upload-title">Upload your photo</p>
      <p class="upload-subtitle">Drag & drop or click to select</p>
      <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" class="upload-input" id="upload-input" />
    </div>
  `;const r=e.querySelector("#upload-zone"),n=e.querySelector("#upload-input");r.addEventListener("click",()=>n.click()),r.addEventListener("dragover",a=>{a.preventDefault(),r.classList.add("dragover")}),r.addEventListener("dragleave",()=>{r.classList.remove("dragover")}),r.addEventListener("drop",a=>{var i;a.preventDefault(),r.classList.remove("dragover");const s=(i=a.dataTransfer)==null?void 0:i.files[0];s&&O(s,t)}),n.addEventListener("change",()=>{var s;const a=(s=n.files)==null?void 0:s[0];a&&O(a,t)})}function He(e,t){e.innerHTML=`
    <div class="upload-zone" id="upload-zone">
      <div class="upload-icon">&#128247;</div>
      <p class="upload-title">Upload your photo</p>
      <p class="upload-subtitle">Drag & drop or click to select</p>
      <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" class="upload-input" id="upload-input" />
    </div>
    <div class="photo-guidance">
      <p class="photo-guidance-title">For best results:</p>
      Face the camera with your hair down in good lighting. A clear view of your head and shoulders gives the most realistic result.
    </div>
  `;const o=e.querySelector("#upload-zone"),r=e.querySelector("#upload-input");o.addEventListener("click",()=>r.click()),o.addEventListener("dragover",n=>{n.preventDefault(),o.classList.add("dragover")}),o.addEventListener("dragleave",()=>{o.classList.remove("dragover")}),o.addEventListener("drop",n=>{var s;n.preventDefault(),o.classList.remove("dragover");const a=(s=n.dataTransfer)==null?void 0:s.files[0];a&&O(a,e)}),r.addEventListener("change",()=>{var a;const n=(a=r.files)==null?void 0:a[0];n&&O(n,e)})}async function O(e,t,o){try{Oe(e);const r=await Ie(e),n=await ae(r);g&&URL.revokeObjectURL(g),g=URL.createObjectURL(n);const a=await De(n);b({userPhoto:new File([n],e.name,{type:n.type}),originalImage:a}),R(t,g)}catch(r){r instanceof B?alert(r.message):(console.error("[TryOn] Error processing image:",r),alert("Failed to process image. Please try another photo."))}}function R(e,t){var o,r;e.innerHTML=`
    <div class="preview-container">
      <img src="${t}" alt="Your photo" class="preview-image" />
      <div class="preview-actions">
        <button class="btn btn-primary" id="preview-submit">Choose Extensions</button>
        <button class="btn btn-secondary" id="preview-retake">Choose Different</button>
      </div>
    </div>
  `,(o=e.querySelector("#preview-submit"))==null||o.addEventListener("click",()=>{b({view:"selectors"})}),(r=e.querySelector("#preview-retake"))==null||r.addEventListener("click",()=>{g&&(URL.revokeObjectURL(g),g=null),b({userPhoto:null})})}function De(e){return new Promise((t,o)=>{const r=new FileReader;r.onload=()=>t(r.result),r.onerror=()=>o(new Error("Failed to read image")),r.readAsDataURL(e)})}let v=null,z=null;function Fe(e){var o;const t=m();e.innerHTML=`
    <div class="progress-content">
      <div class="spinner"></div>
      <p class="progress-text" id="progress-text">${_e(t.progress||"Processing...")}</p>
      <p class="progress-subtext" id="progress-subtext">This may take up to a minute</p>
      <button class="btn btn-secondary cancel-btn" id="progress-cancel">Cancel</button>
    </div>
  `,ie(),z=setTimeout(()=>{const r=e.querySelector("#progress-subtext");r&&(r.textContent="Taking longer than usual, please wait...")},3e4),(o=e.querySelector("#progress-cancel"))==null||o.addEventListener("click",()=>{Be(),x()})}function Ne(){return v&&v.abort(),v=new AbortController,v}function Be(){v&&(v.abort(),v=null),ie()}function ie(){z&&(clearTimeout(z),z=null)}function _e(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}const Ve=9e4;let w=null;async function We(){if(w&&w.loaded)return w;const t=_().apiBaseUrl,[o,r,n]=await Promise.all([fetch(`${t}/api/shades`),fetch(`${t}/api/lengths`),fetch(`${t}/api/textures`)]);if(!o.ok||!r.ok||!n.ok)throw new Error("Failed to load catalog");const[a,s,i]=await Promise.all([o.json(),r.json(),n.json()]);return w={shades:a.shades,lengths:s.lengths,textures:i.textures,loaded:!0},w}async function Ye(e,t,o,r,n){const a=_(),s=Ne(),i=setTimeout(()=>{s.abort()},Ve);try{n==null||n("Uploading your photo...");const c=new FormData;c.append("userImage",e),c.append("shadeId",t),c.append("lengthId",o),c.append("textureId",r);const l=setInterval(()=>{const u=["Analyzing your photo...","Preparing the extensions...","Applying your look...","Almost there..."],f=Math.floor(Math.random()*u.length);n==null||n(u[f])},5e3),p=await fetch(`${a.apiBaseUrl}/api/tryon`,{method:"POST",body:c,signal:s.signal});if(clearInterval(l),clearTimeout(i),!p.ok){const u=await Xe(p);let f=u.error||"Try-on failed";throw u.code==="MISSING_SELECTIONS"?f="Please select a shade, length, and texture.":u.code==="TIMEOUT"?f="Request timed out. Please try again.":u.code==="RATE_LIMITED"?f="Too many requests. Please wait a moment and try again.":u.code==="SAFETY_BLOCK"?f="Your photo could not be processed. Please try a different photo.":u.code==="UNSUITABLE_PHOTO"?f=u.error||"This photo may not work well with hair extensions. Please try a photo showing longer hair.":u.code==="NO_IMAGE"&&(f="The AI could not generate a result. Please try again."),new y(f,u.code||"UNKNOWN",u.retryable??!0)}const d=await p.json();if(!d.imageBase64)throw new y("No image returned","NO_IMAGE",!0);return{imageBase64:d.imageBase64,mimeType:d.mimeType||"image/png"}}catch(c){throw clearTimeout(i),c.name==="AbortError"?new y("Request timed out. Please try again.","TIMEOUT",!0):c instanceof y?c:new y("Failed to connect to server. Please check your connection.","NETWORK_ERROR",!0)}}class y extends Error{constructor(o,r,n){super(o);q(this,"code");q(this,"retryable");this.name="TryOnError",this.code=r,this.retryable=n}}async function Xe(e){try{return await e.json()}catch{return{error:`Server error (${e.status})`,code:`HTTP_${e.status}`,retryable:e.status>=500}}}async function se(e){var o;if(!m().catalog.loaded){e.innerHTML=`
      <div class="selectors-loading">
        <div class="spinner"></div>
        <p>Loading options...</p>
      </div>
    `;try{const r=await We();b({catalog:r}),J(e)}catch{e.innerHTML=`
        <div class="error-content">
          <p class="error-text">Failed to load shade options. Please try again.</p>
          <button class="btn btn-primary" id="catalog-retry">Retry</button>
        </div>
      `,(o=e.querySelector("#catalog-retry"))==null||o.addEventListener("click",()=>{se(e)})}return}J(e)}function J(e){var l,p;const t=m(),{shades:o,lengths:r,textures:n}=t.catalog,a=t.selectedShade,s=t.selectedLength,i=t.selectedTexture,c=a&&s&&i;e.innerHTML=`
    <div class="selectors-content">
      <div class="selector-section">
        <p class="selector-label">Shade${a?`: <span class="selector-value">${I(a.name)}</span>`:""}</p>
        <div class="shade-grid" id="shade-grid">
          ${o.map(d=>`
            <button
              class="shade-swatch ${(a==null?void 0:a.id)===d.id?"selected":""}"
              data-shade-id="${d.id}"
              title="${I(d.name)}"
              style="background-color: ${d.hexColor};"
            ></button>
          `).join("")}
        </div>
      </div>

      <div class="selector-section">
        <p class="selector-label">Length</p>
        <div class="option-group" id="length-group">
          ${r.map(d=>`
            <button
              class="option-btn ${(s==null?void 0:s.id)===d.id?"selected":""}"
              data-length-id="${d.id}"
            >
              <span class="option-btn-primary">${d.inches}"</span>
              <span class="option-btn-secondary">${I(d.bodyLandmark)}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="selector-section">
        <p class="selector-label">Texture</p>
        <div class="option-group" id="texture-group">
          ${n.map(d=>`
            <button
              class="option-btn ${(i==null?void 0:i.id)===d.id?"selected":""}"
              data-texture-id="${d.id}"
            >
              <span class="option-btn-primary">${I(d.name)}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <div class="selectors-actions">
        <button class="btn btn-primary" id="selectors-continue" ${c?"":"disabled"}>
          See My Look
        </button>
        <button class="btn btn-secondary" id="selectors-back">Change Photo</button>
      </div>
    </div>
  `,e.querySelectorAll("[data-shade-id]").forEach(d=>{d.addEventListener("click",()=>{const u=o.find(f=>f.id===d.dataset.shadeId);u&&b({selectedShade:u})})}),e.querySelectorAll("[data-length-id]").forEach(d=>{d.addEventListener("click",()=>{const u=r.find(f=>f.id===d.dataset.lengthId);u&&b({selectedLength:u})})}),e.querySelectorAll("[data-texture-id]").forEach(d=>{d.addEventListener("click",()=>{const u=n.find(f=>f.id===d.dataset.textureId);u&&b({selectedTexture:u})})}),(l=e.querySelector("#selectors-continue"))==null||l.addEventListener("click",()=>{Ge()}),(p=e.querySelector("#selectors-back"))==null||p.addEventListener("click",()=>{b({view:"upload"})})}async function Ge(){const e=m();if(!(!e.userPhoto||!e.selectedShade||!e.selectedLength||!e.selectedTexture)){fe();try{const t=await Ye(e.userPhoto,e.selectedShade.id,e.selectedLength.id,e.selectedTexture.id,o=>{be(o)});ge(t)}catch(t){me(t.message||"Try-on failed. Please try again.")}}}function I(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function k(e,t){const o=new CustomEvent(e,{bubbles:!0,composed:!0,detail:t||{}});document.dispatchEvent(o)}let C=!1;function Ke(e){var l,p,d,u,f,W,Y;const t=m();if(!t.result){e.innerHTML="<p>No result available</p>";return}const o=`data:${t.result.mimeType};base64,${t.result.imageBase64}`,r=t.originalImage||"",n=!!r,a=((l=t.selectedShade)==null?void 0:l.name)||"",s=t.selectedLength?`${t.selectedLength.inches}"`:"",i=((p=t.selectedTexture)==null?void 0:p.name)||"";e.innerHTML=`
    <div class="result-content">
      <div class="result-selection-bar">
        <span class="result-selection-chip" style="border-left: 4px solid ${((d=t.selectedShade)==null?void 0:d.hexColor)||"#999"}">${D(a)}</span>
        <span class="result-selection-chip">${D(s)}</span>
        <span class="result-selection-chip">${D(i)}</span>
      </div>

      ${n?`
        <div class="result-view-tabs">
          <button class="result-view-tab active" id="tab-compare">Before / After</button>
          <button class="result-view-tab" id="tab-result">Result Only</button>
        </div>
      `:""}

      <div id="result-display">
        ${n?Z(r,o):ee(o)}
      </div>

      <div class="result-actions">
        <button class="btn btn-success" id="result-add-cart">Add to Cart</button>
        <button class="btn btn-outline" id="result-download">Download</button>
        <button class="btn btn-outline" id="result-share">Share</button>
        <button class="btn btn-secondary" id="result-try-another">Try Another Shade</button>
      </div>

      <div class="result-toast" id="result-toast"></div>
    </div>
  `;const c=e.querySelector("#result-display");if(n){const $=e.querySelector("#tab-compare"),j=e.querySelector("#tab-result");$.addEventListener("click",()=>{$.classList.add("active"),j.classList.remove("active"),c.innerHTML=Z(r,o),te(c)}),j.addEventListener("click",()=>{j.classList.add("active"),$.classList.remove("active"),c.innerHTML=ee(o)}),te(c)}(u=e.querySelector("#result-add-cart"))==null||u.addEventListener("click",()=>{Qe(o)}),(f=e.querySelector("#result-download"))==null||f.addEventListener("click",()=>{et(o,`muse-hair-pro-${a.toLowerCase().replace(/\s+/g,"-")}.png`)}),(W=e.querySelector("#result-share"))==null||W.addEventListener("click",()=>{Ze(o)}),(Y=e.querySelector("#result-try-another"))==null||Y.addEventListener("click",()=>{ve()}),k("tryon:resultReady",{productId:t.productId,shade:t.selectedShade,tryOnImage:o})}function Z(e,t){return`
    <div class="before-after-container" id="before-after">
      <div class="before-after-before" id="before-side">
        <img src="${e}" alt="Before" class="before-after-img" draggable="false" />
        <span class="before-after-label before-label">Before</span>
      </div>
      <div class="before-after-after">
        <img src="${t}" alt="After" class="before-after-img" draggable="false" />
        <span class="before-after-label after-label">After</span>
      </div>
      <div class="before-after-handle" id="before-after-handle">
        <div class="before-after-handle-line"></div>
        <div class="before-after-handle-grip"></div>
        <div class="before-after-handle-line"></div>
      </div>
    </div>
  `}function ee(e){return`
    <div class="result-image-container">
      <img src="${e}" alt="Hair extension try-on result" class="result-image" />
    </div>
  `}function te(e){const t=e.querySelector("#before-after"),o=e.querySelector("#before-side"),r=e.querySelector("#before-after-handle");if(!t||!o||!r)return;function n(i){const c=t.getBoundingClientRect();let l=(i-c.left)/c.width*100;l=Math.max(0,Math.min(100,l)),o.style.width=`${l}%`,r.style.left=`${l}%`}function a(i){if(!C)return;i.preventDefault();const c="touches"in i?i.touches[0].clientX:i.clientX;n(c)}function s(){C=!1,document.removeEventListener("mousemove",a),document.removeEventListener("mouseup",s),document.removeEventListener("touchmove",a),document.removeEventListener("touchend",s)}r.addEventListener("mousedown",i=>{i.preventDefault(),C=!0,document.addEventListener("mousemove",a),document.addEventListener("mouseup",s)}),r.addEventListener("touchstart",i=>{i.preventDefault(),C=!0,document.addEventListener("touchmove",a,{passive:!1}),document.addEventListener("touchend",s)}),t.addEventListener("click",i=>{n(i.clientX)})}async function Qe(e){var r;const t=m(),o=(r=t.selectedShade)==null?void 0:r.shopifyVariantId;if(o&&Je())try{if((await fetch("/cart/add.js",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:[{id:Number(o),quantity:1}]})})).ok){k("tryon:addToCart",{productId:t.productId,shade:t.selectedShade,length:t.selectedLength,texture:t.selectedTexture,tryOnImage:e}),A("Added to cart!");return}}catch(n){console.warn("[TryOn] Shopify cart add failed, falling back to event:",n)}k("tryon:addToCart",{productId:t.productId,shade:t.selectedShade,length:t.selectedLength,texture:t.selectedTexture,tryOnImage:e}),A("Added to cart!")}function Je(){return typeof window.Shopify<"u"}async function Ze(e,t){var n,a,s,i,c;const o=m(),r=["Check out this look from Muse Hair Pro!",`Shade: ${((n=o.selectedShade)==null?void 0:n.name)||""}`,`Length: ${o.selectedLength?o.selectedLength.inches+'"':""}`,`Texture: ${((a=o.selectedTexture)==null?void 0:a.name)||""}`].join(`
`);if(navigator.share)try{const l=await tt(e),p=new File([l],"muse-hair-pro-tryon.png",{type:l.type});await navigator.share({title:"My Muse Hair Pro Look",text:r,files:[p]});return}catch(l){if(l.name==="AbortError")return}try{await navigator.clipboard.writeText(r),A("Details copied to clipboard!")}catch{A("Share: "+((s=o.selectedShade)==null?void 0:s.name)+" "+((i=o.selectedLength)==null?void 0:i.inches)+'" '+((c=o.selectedTexture)==null?void 0:c.name))}}function A(e){const t=document.querySelector("#result-toast");t&&(t.textContent=e,t.classList.add("visible"),setTimeout(()=>{t.classList.remove("visible")},2500))}function et(e,t){const o=document.createElement("a");o.href=e,o.download=t,document.body.appendChild(o),o.click(),document.body.removeChild(o)}function tt(e){return fetch(e).then(t=>t.blob())}function D(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}let E=null;function rt(e){const t=document.createElement("div");t.className="backdrop";const o=document.createElement("div");o.className="modal",o.setAttribute("role","dialog"),o.setAttribute("aria-modal","true"),o.setAttribute("aria-label","Hair Extension Try-On");const r=document.createElement("div");r.className="header";const n=document.createElement("h2");n.className="title",n.id="tryon-modal-title",n.textContent="Hair Extension Try-On",o.setAttribute("aria-labelledby","tryon-modal-title");const a=document.createElement("button");a.className="close-btn",a.innerHTML="&times;",a.setAttribute("aria-label","Close"),a.addEventListener("click",x),r.appendChild(n),r.appendChild(a),o.appendChild(r);const s=document.createElement("div");return s.className="content",o.appendChild(s),t.appendChild(o),t.addEventListener("click",i=>{i.target===t&&x()}),o.addEventListener("keydown",i=>{if(i.key!=="Tab")return;const c=o.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], select, textarea');if(c.length===0)return;const l=c[0],p=c[c.length-1];i.shiftKey?(e.activeElement===l||document.activeElement===l)&&(i.preventDefault(),p.focus()):(e.activeElement===p||document.activeElement===p)&&(i.preventDefault(),l.focus())}),ne(i=>{ot(s,i.view),i.view==="closed"?(t.classList.remove("visible"),E&&(E.focus(),E=null)):(t.classList.add("visible"),E||(E=document.activeElement),requestAnimationFrame(()=>{a.focus()}))}),t}function ot(e,t,o){const r=m();switch(t){case"closed":e.innerHTML="";break;case"consent":ye(e);break;case"selectors":se(e);break;case"upload":je(e);break;case"processing":Fe(e);break;case"result":Ke(e);break;case"error":nt(e,r.error||"An unexpected error occurred");break}}function nt(e,t){var o,r;e.innerHTML=`
    <div class="error-content">
      <div class="error-icon">!</div>
      <h3 class="error-title">Something went wrong</h3>
      <p class="error-text">${at(t)}</p>
      <div class="result-actions">
        <button class="btn btn-primary" id="error-retry">Try Again</button>
        <button class="btn btn-secondary" id="error-close">Close</button>
      </div>
    </div>
  `,(o=e.querySelector("#error-retry"))==null||o.addEventListener("click",he),(r=e.querySelector("#error-close"))==null||r.addEventListener("click",x)}function at(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function it(){return{_ready:!0,open(e){const t=(e==null?void 0:e.productId)||m().productId;pe(t),k("tryon:open",{productId:t})},close(){x(),k("tryon:close")},_init(e){we(e)}}}const re="tryon-widget-host";let h=null,U=null;function st(){if(document.getElementById(re))return;h=document.createElement("div"),h.id=re,h.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 2147483647;
    pointer-events: none;
  `,U=h.attachShadow({mode:"closed"});const e=document.createElement("style");e.textContent=de,U.appendChild(e);const t=rt(U);t.style.pointerEvents="auto",U.appendChild(t),ne(o=>{o.view==="closed"?h.style.pointerEvents="none":h.style.pointerEvents="auto"}),document.addEventListener("keydown",o=>{o.key==="Escape"&&m().view!=="closed"&&x()}),document.body.appendChild(h)}function oe(){try{st();const e=it();window.TryOn=e,window.TryOnWidget=e}catch(e){console.error("[TryOn] Widget initialization failed:",e)}}typeof window<"u"&&(window.addEventListener("error",e=>{e.filename&&e.filename.includes("widget")&&(console.error("[TryOn] Uncaught error:",e.message),e.preventDefault())}),window.addEventListener("unhandledrejection",e=>{const t=e.reason;t&&t.name==="TryOnError"&&(console.error("[TryOn] Unhandled rejection:",t.message),e.preventDefault())}));document.readyState==="loading"?document.addEventListener("DOMContentLoaded",oe):oe();
