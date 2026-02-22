# Muse Hair Pro Virtual Try-On — Roadmap

## Milestone: v1.0 - Muse Hair Pro Launch

**Goal:** Ship a hair extension virtual try-on widget on Muse Hair Pro's Shopify store. Customers select a shade, length, and texture, upload or capture a photo, and see an AI-generated image of themselves wearing the extensions. They can download, share with their stylist, or add directly to cart.

**Success Criteria:**
- Widget embeds on Muse Hair Pro's Shopify product pages without breaking theme
- Hair extension try-on completes in <30 seconds with progress feedback
- Works on mobile and desktop browsers
- Before/after comparison available for every try-on
- Add to Shopify cart with correct variant (shade + length + texture)
- Admin can manage shade catalog

---

## Phase 1: Widget Foundation (Shopify Embed)

**Goal:** Establish the widget shell with style isolation, lazy loading, and Muse Hair Pro brand styling that works on their Shopify store.

**Delivers:**
- Tiny loader script (<2KB) for Shopify product pages
- "Try On" button injection
- Modal overlay with Shadow DOM style isolation
- Muse Hair Pro brand styling (colors, fonts, logo)
- Configuration parsing from script tag attributes

**Verification:**
- [ ] Widget loads on Muse Hair Pro's Shopify store without console errors
- [ ] Modal appears above all theme elements (header, announcement bar, chat)
- [ ] Host site styles do not affect widget; widget styles do not leak
- [ ] Loader bundle is <2KB gzipped
- [ ] Brand styling matches Muse Hair Pro guidelines

---

## Phase 2: Photo Upload + Live Camera

**Goal:** Build photo input with both file upload and WebRTC camera capture.

**Delivers:**
- File picker with drag-and-drop support
- WebRTC camera capture with live preview and snapshot
- Client-side image compression (<1MB)
- EXIF orientation handling
- Photo requirements guidance UI
- Preview with retake option
- Camera permission denied fallback (defaults to upload)
- Privacy consent before upload

**Verification:**
- [ ] File upload works on desktop and mobile
- [ ] Camera capture works on iOS Safari and Android Chrome
- [ ] Camera permission denied shows friendly fallback to upload
- [ ] 10MB photos compress to <1MB before sending
- [ ] Consent disclosure appears before first upload

---

## Phase 3: Hair Extension Selectors

**Goal:** Build the shade picker, length selector, and texture toggle that load from the backend catalog API.

**Delivers:**
- Shade picker with color swatches and shade names (loaded from API)
- Length selector: 14", 18", 22", 26" (loaded from API)
- Texture toggle: Straight, Wavy, Curly (loaded from API)
- Selection state management
- Visual feedback on selected options
- Catalog loaded from `/api/shades`, `/api/lengths`, `/api/textures`

**Verification:**
- [ ] Shade swatches render with correct colors and names
- [ ] Length options display and are selectable
- [ ] Texture toggle switches between options with visual feedback
- [ ] Selections persist in widget state
- [ ] Catalog data loads from backend API
- [ ] Works on mobile (touch-friendly selector sizing)

---

## Phase 4: Gemini AI Hair-Specific

**Goal:** Replace generic category prompts with hair extension-specific Gemini prompts that produce realistic results.

**Delivers:**
- `hairExtensionPrompt()` function replacing `categoryPrompt()`
- Prompt includes: shade color, length (mapped to body landmarks), texture, blending instructions
- Skin tone preservation in prompts
- Natural root blending instructions
- POST `/api/tryon` endpoint accepting photo + shade + length + texture
- Progress feedback during 5-30 second generation
- Timeout handling (60s) with retry option

**Verification:**
- [ ] Try-on generates realistic hair extension results
- [ ] Results look natural across 4+ diverse skin tones
- [ ] Each shade produces visually distinct, accurate colors
- [ ] Each length option produces visually different results (14" vs 26" is obvious)
- [ ] Straight/wavy/curly textures are clearly distinct
- [ ] Extensions blend naturally with existing hair (not wig-like)
- [ ] 30+ second generation handled with progress messages

---

## Phase 5: Results + Actions

**Goal:** Display results with before/after comparison and enable download, share, and add-to-cart.

**Delivers:**
- Before/after comparison view (slider or toggle)
- Download result as PNG/JPEG
- Share with stylist (generate shareable link or email)
- Add to Shopify cart with correct shade+length+texture variant
- "Try Another Shade" flow (reuse uploaded photo)
- Close/dismiss (X, Escape, click outside)

**Verification:**
- [ ] Before/after comparison works with slider or toggle
- [ ] Download saves high-quality image to device
- [ ] Share generates link or email with result
- [ ] Add to Cart adds correct Shopify variant
- [ ] "Try Another Shade" reuses photo without re-upload
- [ ] Modal closes via X, Escape, and click outside

---

## Phase 6: Admin Dashboard

**Goal:** Repurpose existing Next.js dashboard for shade catalog management.

**Delivers:**
- Admin login (simple secret-based auth)
- Shade CRUD: name, hex color, display order, Shopify variant mapping
- Length CRUD: label, description, body landmark reference
- Texture CRUD: name, icon/image
- Preview shade swatches in admin
- Prisma schema with Shade, Length, Texture, AdminUser models

**Verification:**
- [ ] Admin can log in with ADMIN_SECRET
- [ ] Admin can create, edit, delete, and reorder shades
- [ ] Admin can manage lengths and textures
- [ ] Changes immediately reflected in widget catalog
- [ ] Shade colors in admin match widget rendering

---

## Phase 7: Polish + Production

**Goal:** Final mobile optimization, testing, and production deployment.

**Delivers:**
- Mobile UX polish (touch interactions, responsive layout)
- Loading animations and transitions
- Bundle optimization (core <50KB gzipped)
- Error boundary preventing widget crashes from affecting Shopify store
- Accessibility basics (keyboard navigation, focus management)
- Production deployment to Vercel
- Monitoring and error logging

**Verification:**
- [ ] Core bundle is <50KB gzipped
- [ ] Widget is keyboard navigable
- [ ] Widget crash doesn't break Shopify store
- [ ] Works on iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari
- [ ] Full flow works on Muse Hair Pro's production Shopify store

---

## Dependencies

```
Phase 1 (Widget Foundation)
    │
    ├──> Phase 2 (Photo + Camera)
    │         │
    │         └──> Phase 3 (Selectors) ──> Phase 4 (Gemini AI)
    │                                              │
    │                                              v
    │                                      Phase 5 (Results + Actions)
    │                                              │
    │                                              v
    └─────────────────────────────────────> Phase 7 (Polish)

Phase 6 (Admin Dashboard) — can run in parallel after Phase 3
```

---

## Out of Scope for v1.0

- Multi-tenant SaaS / other stores
- Billing/monetization
- Non-Shopify platforms
- Real-time AR / live video try-on
- User accounts/login
- Wig try-on
- Automated shade matching
- Analytics dashboard

---

## Risk Mitigation

| Risk | Mitigation | Phase |
|------|------------|-------|
| CSS conflicts with Shopify theme | Shadow DOM isolation, test on actual theme | Phase 1 |
| Modal hidden behind theme elements | Append to body, max z-index, test with all store apps | Phase 1 |
| Hair extensions look unrealistic | Iterative prompt engineering with diverse test photos | Phase 4 |
| Color inaccurate across skin tones | Test each shade across 4+ skin tones, per-shade prompt tuning | Phase 4 |
| Camera permission denied | Always provide upload fallback, explain why camera needed | Phase 2 |
| Shopify theme breaks widget | Develop on actual theme from day one | Phase 1 |
| Extension length looks wrong | Map lengths to body landmarks in prompts | Phase 4 |
| API latency frustrates users | Progress messages, 60s timeout, cancel + retry | Phase 4 |
| Bundle bloats Shopify store | <2KB loader, lazy load core, bundle analysis | Phase 1, 7 |
| Privacy concerns | Consent before upload, delete photos after processing | Phase 2 |

---

## Tech Stack

- **Language:** TypeScript
- **Widget Build:** Vite
- **Widget Styling:** CSS within Shadow DOM
- **Widget State:** Lightweight reactive store (vanilla)
- **Backend:** Fastify (Node.js)
- **Database:** PostgreSQL with Prisma ORM
- **AI:** Google Gemini API (image generation)
- **E-commerce:** Shopify AJAX Cart API
- **Camera:** WebRTC (getUserMedia)
- **Dashboard:** Next.js (repurposed from existing)
- **Deployment:** Vercel
- **Testing:** Vitest for unit tests, Playwright for integration

---
*Created: 2026-02-22*
