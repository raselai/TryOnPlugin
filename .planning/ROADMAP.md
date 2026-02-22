# TryOnPlugin Roadmap

## Milestone: v1.0 - MVP Launch

**Goal:** Ship a working virtual try-on widget that store owners can embed on any e-commerce site. Users click "Try this," upload a photo, see themselves wearing the product, and can add to cart.

**Success Criteria:**
- Widget embeds on Shopify, WooCommerce, and custom sites without breaking host styles
- Try-on generation completes in <30 seconds with clear progress feedback
- Works on mobile and desktop browsers
- Store owner can integrate with copy-paste of single script tag

---

## Phase 1: Widget Foundation

**Goal:** Establish the core widget architecture with style isolation, lazy loading, and modal system that works reliably across any host site.

**Delivers:**
- Tiny loader script (<2KB) that initializes on page load
- "Try this" button injection from data attributes
- Modal overlay with Shadow DOM style isolation
- Configuration parsing from script tag attributes
- Basic state management for widget lifecycle

**Key Requirements Addressed:**
- Embeddable JS widget that works on any website
- Cross-platform compatibility (no framework lock-in)

**Why This Order:** Everything else depends on having a solid, isolated widget shell. CSS/DOM conflicts and z-index issues are the #1 cause of widget failure on real sites - must solve first.

**Verification:**
- [ ] Widget loads on Shopify test store without console errors
- [ ] Widget loads on WooCommerce test store without console errors
- [ ] Modal appears above sticky headers and cookie banners
- [ ] Host site styles do not affect widget appearance
- [ ] Widget styles do not leak to host site
- [ ] Initial loader bundle is <2KB gzipped

---

## Phase 2: Photo Upload Flow

**Goal:** Build the complete photo upload experience with validation, compression, and clear user guidance.

**Delivers:**
- File picker with drag-and-drop support
- Camera capture option for mobile devices
- Client-side image compression (target <1MB)
- EXIF orientation handling
- Photo requirements guidance UI
- Preview with retake option
- Privacy consent disclosure before upload

**Key Requirements Addressed:**
- Photo upload flow for user's full-body image
- Mobile responsiveness

**Why This Order:** Photo upload is the first user interaction after clicking "Try this." Must work smoothly before integrating with API - bad photos will produce bad results regardless of API quality.

**Verification:**
- [ ] 10MB phone photo compresses to <1MB before upload
- [ ] Photos display in correct orientation on iOS and Android
- [ ] User sees clear guidance on photo requirements
- [ ] Consent disclosure appears before first upload
- [ ] Drag-and-drop works on desktop browsers
- [ ] Camera capture works on mobile Safari and Chrome

---

## Phase 3: API Integration

**Goal:** Connect to NanoBana Pro API with robust error handling, progress feedback, and graceful degradation.

**Delivers:**
- NanoBana Pro API client with polling for results
- Progress indicator with status messages during 5-30 second wait
- Timeout handling (60 second max with clear messaging)
- Error states with user-friendly messages and retry option
- Circuit breaker for API outages
- Result image display (zoomable)

**Key Requirements Addressed:**
- Integration with NanoBana Pro API for try-on generation
- Display generated try-on image to user

**Why This Order:** Core functionality - this is what users came for. Photo upload must work first so we have valid input to send to API.

**Verification:**
- [ ] Try-on generates successfully with test photos
- [ ] Progress indicator updates during processing
- [ ] 30+ second API response handled gracefully
- [ ] API timeout shows friendly error with retry button
- [ ] API error (500) shows friendly error with retry button
- [ ] Result image displays at high quality and is zoomable

---

## Phase 4: Actions & Host Integration

**Goal:** Enable user actions from try-on result and communicate with host e-commerce platform.

**Delivers:**
- "Add to Cart" button that triggers host page callback
- "Try Another Product" flow (reuse uploaded photo)
- Close/dismiss functionality (X button, escape key, click outside)
- Custom events for host page integration (`tryon:addToCart`, `tryon:close`)
- Programmatic API for advanced integrations

**Key Requirements Addressed:**
- "Add to cart" action from try-on view
- "Try another product" flow (reuse uploaded photo)
- Close/dismiss functionality
- Product image passed via button data attribute

**Why This Order:** Actions depend on having a result to act on. Host integration patterns must be defined after core flow works.

**Verification:**
- [ ] "Add to Cart" dispatches event that host page can listen for
- [ ] "Try Another" allows selecting different product without re-uploading photo
- [ ] Modal closes via X button, escape key, and click outside
- [ ] Session photo persists for multiple try-ons
- [ ] Host page can programmatically open widget via JS API

---

## Phase 5: Polish & Production Readiness

**Goal:** Refine UX, optimize performance, and prepare for real-world deployment.

**Delivers:**
- Loading animations and transitions
- Mobile-optimized touch interactions
- Bundle optimization (target <50KB gzipped for core)
- Error boundary preventing widget crashes from affecting host
- Accessibility basics (keyboard navigation, focus management)
- Production build configuration
- Integration documentation for store owners

**Key Requirements Addressed:**
- Works on any website (Shopify, WooCommerce, custom)
- Mobile responsiveness (final polish)

**Why This Order:** Polish comes after functionality works. Optimization requires measuring real bundle, which requires complete feature set.

**Verification:**
- [ ] Core bundle is <50KB gzipped
- [ ] Lighthouse mobile score doesn't drop when widget added to page
- [ ] Widget is keyboard navigable (tab through controls)
- [ ] Focus trapped inside modal when open
- [ ] Widget crash doesn't break host page
- [ ] Store owner can integrate following documentation alone

---

## Dependencies

```
Phase 1 (Foundation)
    │
    ├──> Phase 2 (Photo Upload) ──> Phase 3 (API Integration)
    │                                       │
    │                                       v
    └─────────────────────────────> Phase 4 (Actions & Host Integration)
                                            │
                                            v
                                    Phase 5 (Polish)
```

- **Phase 2** requires Phase 1 (needs modal to display upload UI)
- **Phase 3** requires Phase 2 (needs photo to send to API)
- **Phase 4** requires Phase 1 and Phase 3 (needs modal + result to act on)
- **Phase 5** requires all previous phases (polish the complete flow)

---

## Out of Scope for v1.0

Explicitly deferred to validate core product first:

- Live camera AR / real-time try-on
- Save/share to social media
- User accounts or login
- Platform-specific apps (Shopify App Store, WooCommerce plugin)
- Analytics dashboard for merchants
- Size recommendation integration
- Outfit builder (multi-item try-on)
- Billing/monetization

---

## Risk Mitigation

| Risk | Mitigation | Phase |
|------|------------|-------|
| CSS conflicts break host sites | Shadow DOM isolation, test on real stores | Phase 1 |
| Modal hidden behind site elements | Append to body, max z-index, test with sticky headers | Phase 1 |
| Large photos cause slow uploads | Client-side compression before upload | Phase 2 |
| API latency frustrates users | Progress feedback, status messages, generous timeout | Phase 3 |
| API outages break widget | Circuit breaker, graceful degradation messaging | Phase 3 |
| Product images unsuitable for API | Document requirements, validate before sending | Phase 3 |
| Bundle bloats host site performance | <2KB loader, lazy load core, bundle analysis | Phase 1, 5 |
| GDPR/privacy compliance | Consent before upload, session-only storage | Phase 2 |

---

## Tech Stack

- **Language:** TypeScript
- **Build:** Vite (or Rollup) for optimized bundles
- **Styling:** CSS-in-JS or bundled CSS within Shadow DOM
- **State:** Lightweight reactive store (vanilla or ~1KB library)
- **API:** Fetch with async/await, polling for results
- **Testing:** Vitest for unit tests, Playwright for integration

---

*Created: 2026-01-18*
