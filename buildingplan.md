# Building Plan — Muse Hair Pro Virtual Try-On

**Goal:** Build a hair extension virtual try-on widget for Muse Hair Pro's Shopify store with Gemini AI, shade/length/texture selectors, camera capture, and Shopify cart integration.

## Phase 0: Project Pivot ✅
- ~~Remove multi-tenant architecture (Store, ApiKey, Plan models).~~
- ~~Remove Stripe billing integration and related routes.~~
- ~~Remove generic product category logic.~~
- ~~Update Prisma schema: add Shade, Length, Texture, AdminUser models.~~
- ~~Update backend to serve single-store (no per-store auth).~~
- ~~Clean up widget config (remove API key requirement).~~

## Phase 1: Widget Foundation (Shopify Embed) ✅
- ~~Loader script (<2KB) for Shopify product pages.~~
- ~~"Try On" button injection (data-tryon-open attribute).~~
- ~~Modal with Shadow DOM style isolation.~~
- ~~Muse Hair Pro brand styling (rose-gold palette, warm tones).~~
- ~~Public API: TryOnWidget.open() / .close() without product image dependency.~~
- ~~State management: Shade/Length/Texture types, catalog, selectors view.~~
- ~~API service: submitTryOn sends shadeId/lengthId/textureId.~~
- ~~Demo page: hair extension landing with shade dots and info cards.~~
- Test on Muse Hair Pro's actual Shopify theme.

## Phase 2: Photo Upload + Live Camera ✅
- ~~File picker with drag-and-drop.~~
- ~~WebRTC camera capture with live preview and snapshot (Camera.ts).~~
- ~~Upload/Camera tab toggle in Upload view.~~
- ~~Client-side compression (<2MB) and EXIF handling.~~
- ~~Camera permission denied → fallback message with "upload instead" guidance.~~
- ~~Camera not supported → tabs hidden, dropzone shown directly.~~
- ~~Front-facing camera with mirror preview, un-mirrored capture.~~
- ~~Photo guidance UI and consent gate.~~

## Phase 3: Hair Extension Selectors ✅
- ~~Shade picker: color swatch grid from `/api/shades` with selected name display.~~
- ~~Length selector: button group with inches + body landmark from `/api/lengths`.~~
- ~~Texture toggle: button group from `/api/textures`.~~
- ~~Catalog fetch with parallel API calls and caching (fetchCatalog).~~
- ~~Selection state management (setState updates, re-render on change).~~
- ~~Flow: Upload → preview "Choose Extensions" → Selectors → "See My Look" → Processing.~~
- ~~"Try Another Shade" returns to selectors (keeps photo, clears shade).~~
- ~~Loading spinner while catalog fetches, error retry on failure.~~

## Phase 4: Gemini AI Hair-Specific ✅
- ~~`hairExtensionPrompt(shade, length, texture)` with structured prompt sections.~~
- ~~Detailed prompt: color blending at roots, highlights/lowlights, texture-specific styling (straight/wavy/curly), face preservation.~~
- ~~POST `/api/tryon` accepting photo + shadeId + lengthId + textureId.~~
- ~~Gemini safety filter handling (SAFETY, RECITATION finish reasons).~~
- ~~Text-instead-of-image fallback detection with debug logging.~~
- ~~Granular error codes: SAFETY_BLOCK, RATE_LIMITED, NO_IMAGE, API_SERVER_ERROR.~~
- ~~In-memory IP rate limiting (10 req/min) on /api/tryon.~~
- ~~Retry with exponential backoff (withRetry, 2 retries).~~
- ~~120s server timeout with AbortController.~~

## Phase 5: Results + Actions ✅
- ~~Before/after comparison slider (draggable + touch, Before/After labels, handle grip).~~
- ~~Tab toggle: "Before / After" vs "Result Only" views.~~
- ~~Selection info bar showing shade (with color chip), length, texture.~~
- ~~Download result image as PNG with shade name in filename.~~
- ~~Share with stylist: Web Share API (with image file) → clipboard fallback.~~
- ~~Add to Shopify cart via `/cart/add.js` with shopifyVariantId → event fallback.~~
- ~~Toast notifications for cart add and clipboard copy.~~
- ~~"Try Another Shade" reusing cached photo (returns to selectors).~~
- ~~Original photo stored as data URL (Upload + Camera) for before/after.~~
- ~~Close/dismiss (X, Escape, click outside).~~

## Phase 6: Admin Dashboard
- Repurpose existing Next.js dashboard.
- Admin login with ADMIN_SECRET.
- Shade CRUD: name, hex color, display order, Shopify variant mapping.
- Length and texture CRUD.
- Preview swatches in admin UI.

## Phase 7: Polish + Production ✅
- ~~Mobile UX: responsive styles (480px breakpoint), full-width buttons, larger tap targets, bottom-sheet modal, portrait camera aspect ratio.~~
- ~~Bundle sizes: loader.js 0.79KB gzipped, widget.js 11.44KB gzipped (both well under targets).~~
- ~~Error boundary: try/catch on init, global error/rejection handlers, prevents widget crashes from affecting Shopify store.~~
- ~~Accessibility: focus trap (Tab cycles within modal), aria-modal, role="dialog", aria-labelledby, focus restore on close.~~
- ~~Vercel config: removed old x-tryon-api-key header, added x-admin-secret, 120s function timeout, CORS headers.~~
- ~~Production sourcemaps: hidden (not linked in JS, available for error tracking).~~

---
*Update this plan as scope or sequencing changes.*
