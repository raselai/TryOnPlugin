# PRD — Muse Hair Pro Virtual Try-On

**Product:** Muse Hair Pro Hair Extension Virtual Try-On
**Author:** Codex
**Date:** 2026-02-22
**Status:** Draft for production planning

## 1) Summary

Muse Hair Pro Virtual Try-On is an embeddable widget for Muse Hair Pro's Shopify store that lets customers visualize hair extensions on themselves before purchasing. Customers select a shade, length, and texture, upload a photo or snap a selfie, and see an AI-generated image of themselves wearing the extensions — powered by Google Gemini. The goal is to reduce shade-matching hesitation, increase purchase confidence, and decrease returns.

## 2) Goals

- Ship a production-ready hair extension try-on widget on Muse Hair Pro's Shopify store.
- Provide a smooth flow: select options → upload/capture photo → see result → add to cart.
- Maintain Shopify theme safety: no CSS/DOM conflicts, minimal performance impact.
- Enable before/after comparison, download, and share-with-stylist for every try-on.
- Provide admin panel for Muse Hair Pro to manage their shade catalog.

## 3) Non-Goals (v1)

- Multi-tenant SaaS or serving other stores.
- Billing/monetization infrastructure.
- Non-Shopify platforms.
- Real-time AR / live video try-on.
- User accounts/login.
- Wig try-on (extensions only).
- Automated AI shade matching.

## 4) Target Users and Personas

- **Customer:** Woman shopping for hair extensions online. Wants to see how extensions will look on her before committing. May want to share with her stylist for advice.
- **Stylist / Professional:** Receives shared try-on images from clients. Provides shade and length recommendations based on the visualization.
- **Muse Hair Pro Admin:** Manages the shade catalog, lengths, and textures. Needs to add new shades, update colors, and map options to Shopify variants.

## 5) User Journeys

### Customer Try-On Flow
1. Visits a hair extension product page on Muse Hair Pro's Shopify store.
2. Clicks "Try On" button.
3. Modal opens with shade selector, length options, and texture toggle.
4. Selects desired shade, length, and texture.
5. Uploads a photo or captures one via camera.
6. Sees progress feedback while AI generates the result (5-30 seconds).
7. Views before/after comparison of original photo vs. try-on result.
8. Actions: download image, share with stylist, try another shade, or add to cart.
9. "Add to Cart" adds the correct Shopify variant (shade + length + texture).

### Share with Stylist
1. Customer completes a try-on.
2. Clicks "Share with Stylist."
3. Receives a shareable link or can email the before/after image.
4. Stylist views the result and advises on shade/length choice.

### Admin Catalog Management
1. Admin logs into dashboard with admin secret.
2. Views current shade catalog with swatches.
3. Adds new shade: name, hex color, display order, Shopify variant ID.
4. Edits or removes existing shades, lengths, or textures.
5. Changes are immediately reflected in the customer-facing widget.

## 6) Core Requirements

### Functional Requirements (Must Have)

- Embeddable JS widget for Muse Hair Pro's Shopify product pages.
- Shade picker with color swatches and shade names (loaded from backend catalog).
- Length selector (14", 18", 22", 26") loaded from backend.
- Texture toggle (straight, wavy, curly) loaded from backend.
- Photo upload with drag-and-drop and file picker.
- Live camera capture via WebRTC with preview and snapshot.
- Camera permission denied fallback to upload.
- Client-side image compression and EXIF orientation handling.
- Privacy consent before first upload.
- Gemini AI hair extension generation with shade/length/texture-specific prompts.
- Progress feedback during 5-30 second generation.
- Before/after comparison view (slider or toggle).
- Download result image as PNG/JPEG.
- Share with stylist (link or email).
- Add to Shopify cart with correct variant (shade + length + texture mapped).
- "Try Another Shade" reusing uploaded photo.
- Close/dismiss (X, Escape, click outside).
- Admin dashboard for shade, length, and texture catalog CRUD.

### Non-Functional Requirements

- Style isolation: Shadow DOM; no global CSS selectors.
- Z-index safety: modal appended to `document.body`, max z-index.
- Performance: loader <2KB gzipped; core widget <50KB gzipped; async load.
- Reliability: 60s timeout, retry option, graceful error messages.
- Privacy: consent before upload; photos deleted after processing; no permanent storage.
- Compatibility: iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari.
- Security: admin auth for dashboard; no API keys in client bundle.
- Shopify compatibility: works with Muse Hair Pro's theme; uses standard Cart API.

## 7) Product Scope by Phase

### Phase 1 — Widget Foundation
- Shopify embed with loader script.
- Shadow DOM modal with Muse Hair Pro brand styling.
- Config parsing from script tag attributes.

### Phase 2 — Photo Upload + Live Camera
- File picker, drag-and-drop, camera capture.
- Compression, orientation fix, validation.
- Privacy consent gate.

### Phase 3 — Hair Extension Selectors
- Shade picker, length selector, texture toggle.
- Catalog loaded from backend API.

### Phase 4 — Gemini AI Hair-Specific
- Hair extension prompt generation (`hairExtensionPrompt()`).
- Shade color, length (body landmark mapping), texture, blending.
- POST `/api/tryon` with photo + selections.
- Progress and timeout handling.

### Phase 5 — Results + Actions
- Before/after comparison.
- Download, share with stylist.
- Add to Shopify cart with variant mapping.
- "Try Another Shade" flow.

### Phase 6 — Admin Dashboard
- Admin login.
- Shade, length, texture catalog CRUD.
- Shopify variant mapping.

### Phase 7 — Polish + Production
- Mobile UX polish.
- Accessibility basics.
- Bundle optimization.
- Production deployment.

## 8) Feature Prioritization (MVP)

**P1 (Launch):**
- Shade/length/texture selectors
- Photo upload + camera capture
- Gemini hair extension generation
- Before/after comparison
- Download result
- Share with stylist
- Add to Shopify cart
- Admin catalog CRUD

**P2 (Post-launch):**
- Multi-shade session (try multiple without re-upload)
- Side-by-side shade comparison
- Analytics (try-on rate, conversion)

**P3 (Future):**
- Color matching suggestion AI
- Additional Shopify stores
- A/B testing prompt variations

## 9) UX and Visual Requirements

- Muse Hair Pro brand colors, fonts, and logo in widget.
- Clear shade swatches that accurately represent hair colors.
- Multi-step progress messages during generation.
- Before/after slider or toggle that's intuitive on mobile.
- Error states with plain-language messaging and retry.
- Photo guidance showing ideal selfie pose for hair try-on.

## 10) Platform and Integration Details

### Widget Integration (Shopify)
- Script tag on product pages: async loader.
- "Try On" button injected near product images or "Add to Cart."
- Widget reads backend URL from script tag data attributes.

### Backend API
- `POST /api/tryon` — Generate hair extension try-on (photo + shade + length + texture).
- `GET /api/shades` — List available shades.
- `GET /api/lengths` — List available lengths.
- `GET /api/textures` — List available textures.
- `POST /api/admin/shades` — Create shade (admin).
- `PUT /api/admin/shades/:id` — Update shade (admin).
- `DELETE /api/admin/shades/:id` — Delete shade (admin).
- Similar CRUD for lengths and textures.

### Shopify Cart Integration
- Map shade + length + texture selection to Shopify variant ID.
- Use `/cart/add.js` AJAX Cart API to add variant.
- Dispatch `cart:updated` event for theme cart drawer.

### Gemini AI Prompts
- `hairExtensionPrompt(shade, length, texture)` generates a specific prompt.
- Includes: shade color name, length mapped to body landmark, texture type.
- Includes: blending instructions, skin tone preservation, lighting consistency.
- Avoids: wig-like appearance, floating hair, unrealistic physics.

## 11) Privacy, Compliance, and Data Retention

- Explicit consent before photo upload.
- Photos processed in memory; deleted immediately after Gemini generation.
- No permanent storage of user photos.
- Clear privacy notice about photo use.
- Session-only; no user tracking or accounts.

## 12) Analytics and Telemetry (Minimal for v1)

- Widget load success/failure.
- Try-on initiation, completion, and error rates.
- Shade/length/texture selection distribution.
- Add-to-cart rate post try-on.
- Share and download rates.
- Average generation time.

## 13) Risks and Mitigations

- CSS conflicts with Shopify theme: Shadow DOM, test on actual theme.
- Modal hidden by theme elements: append to body, max z-index.
- Hair looks unrealistic: iterative prompt engineering with diverse photos.
- Color inaccurate across skin tones: test each shade across multiple skin tones.
- Camera denied: upload fallback always available.
- API latency: progress messages, 60s timeout, retry.
- Bundle bloat: async load, small loader, lazy-load core.
- Privacy: consent, no storage, immediate deletion.

## 14) Acceptance Criteria

- Widget loads on Muse Hair Pro's Shopify store without style conflicts.
- Shade/length/texture selectors load from backend catalog.
- Camera capture and photo upload both work on mobile.
- Hair extension try-on produces realistic results across diverse skin tones.
- Before/after comparison is clear and intuitive.
- Download and share work correctly.
- Add to Cart adds correct Shopify variant.
- Admin can manage shade catalog through dashboard.
- Loader <2KB; core <50KB gzipped.

## 15) Dependencies

- Google Gemini API for image generation.
- Muse Hair Pro's Shopify store for integration and testing.
- Shade catalog data (names, hex colors, Shopify variant IDs) from Muse Hair Pro.
- Brand guidelines (colors, fonts, logo) from Muse Hair Pro.

## 16) Open Questions

- Exact shade catalog from Muse Hair Pro (how many shades, names, hex values).
- Shopify variant structure (how shade + length + texture maps to variants).
- Brand guidelines for widget styling.
- Whether share-with-stylist should use email, SMS, or shareable link.
- Hosting arrangement for backend (Muse Hair Pro's Vercel or separate).

---
*Based on PROJECT.md, ROADMAP.md, and research docs.*
