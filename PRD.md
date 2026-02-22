# PRD - TryOnPlugin

**Product:** TryOnPlugin Virtual Try-On Widget
**Author:** Codex
**Date:** 2026-01-18
**Status:** Draft for production planning

## 1) Summary

TryOnPlugin is an embeddable JavaScript widget for e-commerce stores selling wearables. Store owners add a single script tag and a data attribute on product pages to enable a "Try this" button. Shoppers upload a full-body photo, the widget sends it with the product image to NanoBana Pro API, and displays an AI-generated try-on image. The goal is to reduce hesitation and returns by improving purchase confidence.

## 2) Goals

- Ship a production-ready, cross-platform widget that works on Shopify, WooCommerce, and custom sites.
- Provide a smooth try-on flow that handles slow AI generation gracefully.
- Maintain host-site safety: no CSS/DOM conflicts, minimal performance impact.
- Ensure basic privacy compliance for user photos and consent.

## 3) Non-Goals (v1)

- Live camera AR or real-time try-on.
- Social sharing or user accounts.
- Platform-specific apps (Shopify App Store, WooCommerce plugin).
- Billing/monetization.
- Analytics dashboard for merchants.

## 4) Target Users and Personas

- Store Owner: Wants a copy-paste integration, minimal site impact, and improved conversion.
- Shopper: Wants fast, low-friction visualization and clear guidance on photo requirements.

## 5) User Journeys

### Shopper
1. Clicks "Try this" on a product page.
2. Sees modal with guidance and consent.
3. Uploads full-body photo (mobile camera or file picker).
4. Waits while try-on is generated with progress cues.
5. Views result, optionally compares or tries another product.
6. Adds to cart or closes modal.

### Store Owner
1. Adds script tag to site and data attribute to product button.
2. Verifies widget loads without breaking site.
3. Monitors basic integration logs or errors (if available).

## 6) Core Requirements

### Functional Requirements (Must Have)

- Embeddable JS widget that works on any website.
- "Try this" button opens a modal try-on interface.
- Full-body photo upload flow with validation and preview.
- Client-side image compression and EXIF orientation handling.
- Explicit consent before first upload.
- Integration with NanoBana Pro API for try-on generation.
- Progress feedback for 5-30+ second generation times.
- Result image display with zoom.
- "Add to cart" action from try-on view (via events or callbacks).
- "Try another product" flow using the same uploaded photo.
- Close/dismiss behavior (X, Esc, click outside).
- Product image passed via data attribute (e.g., `data-tryon-image`).

### Non-Functional Requirements

- Style isolation: Shadow DOM and namespaced classes; no global selectors.
- Z-index safety: modal appended to `document.body`, max z-index.
- Performance: loader <2KB gzipped; core widget <50KB gzipped; async load.
- Reliability: timeouts, retries (for 5xx), circuit breaker for outages.
- Privacy: minimal retention, clear notice, deletion path; no API key in client.
- Compatibility: modern evergreen browsers; mobile Safari and Chrome tested.
- Security: origin validation, rate limiting on backend proxy, signed URLs.
- CSP compatibility: documented required directives, minimal external resources.

## 7) Product Scope by Phase

### Phase 1 - Widget Foundation
- Lightweight loader and button injection.
- Modal overlay with Shadow DOM.
- Config parsing via script attributes.
- Base state management.

### Phase 2 - Photo Upload Flow
- Photo picker, camera capture, drag-and-drop.
- Compression, orientation fix, and validation.
- Guidance UI and consent before upload.

### Phase 3 - API Integration
- NanoBana Pro API client via backend proxy.
- Progress states and timeouts (60-120s).
- Error handling and retry UX.
- Result rendering.

### Phase 4 - Actions and Host Integration
- Add-to-cart event dispatch and hooks.
- Try-another-product flow with cached photo.
- Programmatic API for advanced integration.

### Phase 5 - Polish and Production Readiness
- Animations and mobile UX polish.
- Accessibility basics (focus trap, keyboard nav).
- Bundle optimization and error boundaries.
- Integration documentation.

## 8) Feature Prioritization (MVP)

**P1 (Launch):**
- Embeddable widget
- Modal try-on UX
- Photo upload + compression + consent
- NanoBana Pro API integration
- Progress and timeout handling
- Display result
- Close/dismiss
- Add-to-cart event

**P2 (Post-validation):**
- Try another product without re-upload
- Zoom and compare view
- Additional host integration APIs

**P3 (Future):**
- Platform-specific apps
- Analytics dashboard
- Size recommendations

## 9) UX and Visual Requirements

- Clear guidance on photo requirements with visuals.
- Multi-step status messages during generation.
- Error states with plain-language messaging and retry.
- Expectation setting: visualization, not guaranteed fit.

## 10) Platform and Integration Details

### Widget Integration
- Script tag: async loader and minimal config attributes.
- Product button: `data-tryon-image` and optional product metadata.
- Event-based integration: `tryon:addToCart`, `tryon:close`.

### API Integration
- Client calls backend proxy; backend holds NanoBana Pro API key.
- Backend handles retries, rate limiting, timeouts, and logging.
- Payload includes user photo and product image; validates file types and size.

### Prompt Generation and Category Inference
- Backend derives product category from the product image only using Gemini (text-only response).
- Category taxonomy (v1): clothing, watch, jewelry, sunglasses, shoes, bag, other.
- Prompt generator selects a short, category-specific template that focuses on placement and preservation (face, skin tone, lighting).
- Final request to image model includes: user image + product image + generated prompt.
- Low-confidence classification falls back to a safe "accessory on body" prompt and logs for review.

## 11) Privacy, Compliance, and Data Retention

- Explicit consent before upload; link to privacy notice.
- Store photos only as needed for processing; default deletion after session or 24 hours.
- Document data flow and retention for store owners (data controller).
- Provide deletion request path.

## 12) Analytics and Telemetry (Minimal for v1)

- Widget load success/failure.
- Try-on start, upload complete, generation success/failure.
- Average generation time and timeout rate.
- Error categories (API error, validation error, CSP blocked).

## 13) Risks and Mitigations

- CSS conflicts: Shadow DOM, namespaced classes, no global selectors.
- Modal hidden by stacking context: append to body, max z-index.
- API latency: progress states, long timeouts, cancel support.
- API outages: circuit breaker, friendly fallback messaging.
- Photo quality issues: guidance, validation, compression.
- Performance regression on host sites: async load, small bundle.
- CSP blocking: document required CSP and minimize external resources.
- Privacy violations: explicit consent, limited retention, delete path.

## 14) Acceptance Criteria

- Works on Shopify, WooCommerce, and a custom site without style conflicts.
- Loader <2KB gzipped; core widget <50KB gzipped.
- Handles 30+ second generation with user feedback.
- Mobile upload works on iOS Safari and Android Chrome.
- API failures show clear retry options.
- Consent shown before first upload.

## 15) Dependencies

- NanoBana Pro API availability and SLAs.
- Backend proxy service for secure API usage.
- CDN or hosting for widget assets.

## 16) Open Questions

- Final API contract and rate limits for NanoBana Pro.
- Store owner onboarding flow and documentation hosting.
- Whether to offer self-hosted assets for strict CSP customers.

---
*Based on PROJECT.md, ROADMAP.md, and PITFALLS.md research.*
