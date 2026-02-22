var B=Object.defineProperty;var V=(e,n,t)=>n in e?B(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var U=(e,n,t)=>V(e,typeof n!="symbol"?n+"":n,t);const $=`
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
`,Y={view:"closed",userPhoto:null,productImageUrl:"",productId:void 0,result:null,error:null,progress:""};let k={...Y};const S=new Set;function m(){return k}function u(e){k={...k,...e},S.forEach(n=>n(k))}function _(e){return S.add(e),()=>S.delete(e)}function K(e,n){const t=localStorage.getItem("tryon-consent")==="true";u({view:t?"upload":"consent",productImageUrl:e,productId:n,result:null,error:null,progress:""})}function f(){u({view:"closed"})}function z(e){e?(localStorage.setItem("tryon-consent","true"),u({view:"upload"})):f()}function W(){u({view:"processing",progress:"Uploading...",error:null})}function X(e){u({progress:e})}function G(e){u({view:"result",result:e})}function Q(e){u({view:"error",error:e})}function N(){u({view:"upload",error:null,result:null})}const Z={apiBaseUrl:"http://localhost:8787",privacyPolicyUrl:"#",apiKey:null};let L={...Z};function q(){return L}function J(e){L={...L,...e}}function ee(){return L.apiKey}function te(e){var r,o;const t=q().privacyPolicyUrl||"#";e.innerHTML=`
    <div class="consent-content">
      <div class="consent-icon">&#128247;</div>
      <h3 class="consent-title">Photo Permission Required</h3>
      <p class="consent-text">
        To create your virtual try-on, we need to process your photo.
        Your photo is only used for this try-on and is not stored.
      </p>
      <p class="consent-text">
        <a href="${re(t)}" target="_blank" rel="noopener" class="consent-link">
          View Privacy Policy
        </a>
      </p>
      <div class="consent-actions">
        <button class="btn btn-primary" id="consent-accept">I Agree</button>
        <button class="btn btn-secondary" id="consent-decline">No Thanks</button>
      </div>
    </div>
  `,(r=e.querySelector("#consent-accept"))==null||r.addEventListener("click",()=>{z(!0)}),(o=e.querySelector("#consent-decline"))==null||o.addEventListener("click",()=>{z(!1)})}function re(e){return e.replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const x=2048,ne=2e6,oe=.9,M=.5,ae=.1;async function ie(e,n=ne){const t=await se(e);let{width:r,height:o}=t;if(r>x||o>x){const l=Math.min(x/r,x/o);r=Math.round(r*l),o=Math.round(o*l)}const a=document.createElement("canvas");a.width=r,a.height=o;const i=a.getContext("2d");if(!i)throw new Error("Failed to get canvas context");i.drawImage(t,0,0,r,o);let s=oe,c=await P(a,"image/jpeg",s);for(;c.size>n&&s>M;)s-=ae,c=await P(a,"image/jpeg",s);if(c.size>n){const l=Math.sqrt(n/c.size)*.9;a.width=Math.round(r*l),a.height=Math.round(o*l),i.drawImage(t,0,0,a.width,a.height),c=await P(a,"image/jpeg",M)}return c}function se(e){return new Promise((n,t)=>{const r=new Image,o=URL.createObjectURL(e);r.onload=()=>{URL.revokeObjectURL(o),n(r)},r.onerror=()=>{URL.revokeObjectURL(o),t(new Error("Failed to load image"))},r.src=o})}function P(e,n,t){return new Promise((r,o)=>{e.toBlob(a=>{a?r(a):o(new Error("Failed to create blob"))},n,t)})}async function ce(e){if(!e.type.includes("jpeg")&&!e.type.includes("jpg"))return e;const n=await le(e);return n<=1?e:de(e,n)}async function le(e){try{const n=await e.slice(0,65536).arrayBuffer(),t=new DataView(n);if(t.getUint16(0)!==65496)return 1;let r=2;for(;r<t.byteLength-2;){const o=t.getUint16(r);if(r+=2,o===65505){const a=t.getUint16(r);if(r+=2,String.fromCharCode(t.getUint8(r),t.getUint8(r+1),t.getUint8(r+2),t.getUint8(r+3))!=="Exif")return 1;r+=6;const s=t.getUint16(r)===18761;r+=2,r+=2;const c=t.getUint32(r,s);r=r-4+c;const l=t.getUint16(r,s);r+=2;for(let y=0;y<l;y++){if(t.getUint16(r,s)===274)return t.getUint16(r+8,s);r+=12}return 1}else if((o&65280)===65280)r+=t.getUint16(r);else break}return 1}catch{return 1}}async function de(e,n){const t=await ue(e),r=document.createElement("canvas"),o=r.getContext("2d");if(!o)throw new Error("Failed to get canvas context");let a=t.width,i=t.height;switch(n>=5&&n<=8?(r.width=i,r.height=a):(r.width=a,r.height=i),n){case 2:o.scale(-1,1),o.translate(-a,0);break;case 3:o.rotate(Math.PI),o.translate(-a,-i);break;case 4:o.scale(1,-1),o.translate(0,-i);break;case 5:o.rotate(.5*Math.PI),o.scale(1,-1);break;case 6:o.rotate(.5*Math.PI),o.translate(0,-i);break;case 7:o.rotate(-.5*Math.PI),o.translate(-a,0),o.scale(1,-1);break;case 8:o.rotate(-.5*Math.PI),o.translate(-a,0);break}return o.drawImage(t,0,0),new Promise((s,c)=>{r.toBlob(l=>{l?s(l):c(new Error("Failed to create rotated image"))},"image/jpeg",.95)})}function ue(e){return new Promise((n,t)=>{const r=new Image,o=URL.createObjectURL(e);r.onload=()=>{URL.revokeObjectURL(o),n(r)},r.onerror=()=>{URL.revokeObjectURL(o),t(new Error("Failed to load image"))},r.src=o})}const pe=["image/jpeg","image/png","image/webp"],ge=20*1024*1024;class R extends Error{constructor(n){super(n),this.name="ValidationError"}}function me(e){if(!pe.includes(e.type))throw new R("Please upload a JPEG, PNG, or WebP image.");if(e.size>ge)throw new R("Image is too large. Please upload an image under 20MB.")}let b=null,I=null;function fe(e){var t;const n=m();e.innerHTML=`
    <div class="progress-content">
      <div class="spinner"></div>
      <p class="progress-text" id="progress-text">${ye(n.progress||"Processing...")}</p>
      <p class="progress-subtext" id="progress-subtext">This may take up to a minute</p>
      <button class="btn btn-secondary cancel-btn" id="progress-cancel">Cancel</button>
    </div>
  `,D(),I=setTimeout(()=>{const r=e.querySelector("#progress-subtext");r&&(r.textContent="Taking longer than usual, please wait...")},3e4),(t=e.querySelector("#progress-cancel"))==null||t.addEventListener("click",()=>{be(),f()})}function he(){return b&&b.abort(),b=new AbortController,b}function be(){b&&(b.abort(),b=null),D()}function D(){I&&(clearTimeout(I),I=null)}function ye(e){const n=document.createElement("div");return n.textContent=e,n.innerHTML}const ve=9e4,we="x-tryon-api-key";async function xe(e,n,t){const r=q(),o=he(),a=setTimeout(()=>{o.abort()},ve);try{t==null||t("Uploading your photo...");const i=new FormData;i.append("userImage",e),i.append("productImageUrl",n);const s=setInterval(()=>{const p=Date.now(),g=["Analyzing your photo...","Preparing the product...","Creating your look...","Almost there..."],F=Math.floor(Math.random()*g.length);t==null||t(g[F])},5e3),c={},l=ee();l&&(c[we]=l);const y=await fetch(`${r.apiBaseUrl}/api/tryon`,{method:"POST",body:i,headers:c,signal:o.signal});if(clearInterval(s),clearTimeout(a),!y.ok){const p=await Ee(y);let g=p.error||"Try-on failed";throw p.code==="MISSING_API_KEY"?g="Widget not configured. Please add your API key.":p.code==="INVALID_API_KEY"?g="Invalid API key. Please check your configuration.":p.code==="QUOTA_EXCEEDED"?g="Usage limit reached. Please try again later.":p.code==="RATE_LIMIT_EXCEEDED"&&(g="Too many requests. Please wait a moment."),new v(g,p.code||"UNKNOWN",p.retryable??!0)}const w=await y.json();if(!w.imageBase64)throw new v("No image returned","NO_IMAGE",!0);return{imageBase64:w.imageBase64,mimeType:w.mimeType||"image/png"}}catch(i){throw clearTimeout(a),i.name==="AbortError"?new v("Request timed out. Please try again.","TIMEOUT",!0):i instanceof v?i:new v("Failed to connect to server. Please check your connection.","NETWORK_ERROR",!0)}}class v extends Error{constructor(t,r,o){super(t);U(this,"code");U(this,"retryable");this.name="TryOnError",this.code=r,this.retryable=o}}async function Ee(e){try{return await e.json()}catch{return{error:`Server error (${e.status})`,code:`HTTP_${e.status}`,retryable:e.status>=500}}}let d=null;function ke(e,n){const t=m();if(t.userPhoto!==null&&(!d&&t.userPhoto&&(d=URL.createObjectURL(t.userPhoto)),d)){H(e,d);return}Ie(e)}function Ie(e,n){e.innerHTML=`
    <div class="upload-zone" id="upload-zone">
      <div class="upload-icon">&#128247;</div>
      <p class="upload-title">Upload your photo</p>
      <p class="upload-subtitle">Drag & drop or click to select</p>
      <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" class="upload-input" id="upload-input" />
    </div>
    <div class="photo-guidance">
      <p class="photo-guidance-title">For best results:</p>
      Stand facing the camera in good lighting. Full body photos work best for clothing.
    </div>
  `;const t=e.querySelector("#upload-zone"),r=e.querySelector("#upload-input");t.addEventListener("click",()=>r.click()),t.addEventListener("dragover",o=>{o.preventDefault(),t.classList.add("dragover")}),t.addEventListener("dragleave",()=>{t.classList.remove("dragover")}),t.addEventListener("drop",o=>{var i;o.preventDefault(),t.classList.remove("dragover");const a=(i=o.dataTransfer)==null?void 0:i.files[0];a&&O(a,e)}),r.addEventListener("change",()=>{var a;const o=(a=r.files)==null?void 0:a[0];o&&O(o,e)})}async function O(e,n,t){try{me(e);const r=await ce(e),o=await ie(r);d&&URL.revokeObjectURL(d),d=URL.createObjectURL(o),u({userPhoto:new File([o],e.name,{type:o.type})}),H(n,d)}catch(r){r instanceof R?alert(r.message):(console.error("[TryOn] Error processing image:",r),alert("Failed to process image. Please try another photo."))}}function H(e,n){var t,r;e.innerHTML=`
    <div class="preview-container">
      <img src="${n}" alt="Your photo" class="preview-image" />
      <div class="preview-actions">
        <button class="btn btn-primary" id="preview-submit">Try On</button>
        <button class="btn btn-secondary" id="preview-retake">Choose Different</button>
      </div>
    </div>
  `,(t=e.querySelector("#preview-submit"))==null||t.addEventListener("click",Le),(r=e.querySelector("#preview-retake"))==null||r.addEventListener("click",()=>{d&&(URL.revokeObjectURL(d),d=null),u({userPhoto:null})})}async function Le(){const e=m();if(!(!e.userPhoto||!e.productImageUrl)){W();try{const n=await xe(e.userPhoto,e.productImageUrl,t=>{X(t)});G(n)}catch(n){Q(n.message||"Try-on failed. Please try again.")}}}function T(e,n){const t=new CustomEvent(e,{bubbles:!0,composed:!0,detail:n||{}});document.dispatchEvent(t)}let E=!1;function Te(e){var a,i;const n=m();if(!n.result){e.innerHTML="<p>No result available</p>";return}const t=`data:${n.result.mimeType};base64,${n.result.imageBase64}`;E=!1,e.innerHTML=`
    <div class="result-content">
      <div class="result-image-container" id="result-container">
        <img src="${t}" alt="Try-on result" class="result-image" id="result-image" />
      </div>
      <p class="zoom-hint">Click image to zoom</p>
      <div class="result-actions">
        <button class="btn btn-success" id="result-add-cart">Add to Cart</button>
        <button class="btn btn-secondary" id="result-try-another">Try Another</button>
      </div>
    </div>
  `;const r=e.querySelector("#result-container"),o=e.querySelector("#result-image");r.addEventListener("click",()=>{E=!E,E?o.classList.add("zoomed"):o.classList.remove("zoomed")}),(a=e.querySelector("#result-add-cart"))==null||a.addEventListener("click",()=>{T("tryon:addToCart",{productId:n.productId,productImageUrl:n.productImageUrl,tryOnImage:t}),f()}),(i=e.querySelector("#result-try-another"))==null||i.addEventListener("click",()=>{N()}),T("tryon:resultReady",{productId:n.productId,productImageUrl:n.productImageUrl,tryOnImage:t})}function Ue(e){const n=document.createElement("div");n.className="backdrop";const t=document.createElement("div");t.className="modal";const r=document.createElement("div");r.className="header";const o=document.createElement("h2");o.className="title",o.textContent="Virtual Try-On";const a=document.createElement("button");a.className="close-btn",a.innerHTML="&times;",a.setAttribute("aria-label","Close"),a.addEventListener("click",f),r.appendChild(o),r.appendChild(a),t.appendChild(r);const i=document.createElement("div");return i.className="content",t.appendChild(i),n.appendChild(t),n.addEventListener("click",s=>{s.target===n&&f()}),_(s=>{Pe(i,s.view),s.view==="closed"?n.classList.remove("visible"):n.classList.add("visible")}),n}function Pe(e,n,t){const r=m();switch(n){case"closed":e.innerHTML="";break;case"consent":te(e);break;case"upload":ke(e);break;case"processing":fe(e);break;case"result":Te(e);break;case"error":Ce(e,r.error||"An unexpected error occurred");break}}function Ce(e,n){var t,r;e.innerHTML=`
    <div class="error-content">
      <div class="error-icon">!</div>
      <h3 class="error-title">Something went wrong</h3>
      <p class="error-text">${Se(n)}</p>
      <div class="result-actions">
        <button class="btn btn-primary" id="error-retry">Try Again</button>
        <button class="btn btn-secondary" id="error-close">Close</button>
      </div>
    </div>
  `,(t=e.querySelector("#error-retry"))==null||t.addEventListener("click",N),(r=e.querySelector("#error-close"))==null||r.addEventListener("click",f)}function Se(e){const n=document.createElement("div");return n.textContent=e,n.innerHTML}function Re(){return{_ready:!0,open(e){const n=(e==null?void 0:e.productImage)||m().productImageUrl,t=(e==null?void 0:e.productId)||m().productId;if(!n){console.warn("[TryOn] No product image specified");return}K(n,t),T("tryon:open",{productImageUrl:n,productId:t})},close(){f(),T("tryon:close")},setProduct(e,n){u({productImageUrl:e,productId:n})},_init(e){J(e)}}}const A="tryon-widget-host";let h=null,C=null;function ze(){if(document.getElementById(A))return;h=document.createElement("div"),h.id=A,h.style.cssText=`
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 2147483647;
    pointer-events: none;
  `,C=h.attachShadow({mode:"closed"});const e=document.createElement("style");e.textContent=$,C.appendChild(e);const n=Ue();n.style.pointerEvents="auto",C.appendChild(n),_(t=>{t.view==="closed"?h.style.pointerEvents="none":h.style.pointerEvents="auto"}),document.addEventListener("keydown",t=>{t.key==="Escape"&&m().view!=="closed"&&f()}),document.body.appendChild(h)}function j(){ze();const e=Re();window.TryOn=e}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",j):j();
//# sourceMappingURL=widget.js.map
