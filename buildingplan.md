# Building Plan - TryOnPlugin

**Goal:** Build a production-ready virtual try-on widget with a secure backend and Gemini-based prompt generation.

## Phase 0: Project Setup
- Define repo structure (widget, backend, shared, docs).
- Choose tooling: TypeScript, Vite/Rollup, minimal UI framework or vanilla.
- Configure build targets and environment config (dev/staging/prod).
- Set up linting, formatting, and CI basics.

## Phase 1: Widget Foundation
- Implement async loader script (<2KB gzipped).
- Inject "Try this" button via data attributes.
- Build modal shell with Shadow DOM isolation.
- Create event bus and lifecycle state management.
- Validate on Shopify, WooCommerce, and a static demo site.

## Phase 2: Photo Upload Flow
- File picker with drag-and-drop and camera capture.
- Client-side compression and EXIF orientation handling.
- Photo guidance UI and preview/retake.
- Consent gate before first upload.
- Mobile-first UX pass and device testing.

## Phase 3: Backend and API Proxy
- Stand up backend service with secure API key storage.
- Implement signed upload URLs or direct upload flow.
- Add rate limiting, retries, and timeouts.
- Centralized logging and error codes for widget.

## Phase 4: Category Inference and Prompt Generation
- Add Gemini text-only classification using product image.
- Define category taxonomy and confidence thresholds.
- Create prompt templates per category.
- Add low-confidence fallback prompt and logging.

## Phase 5: Try-On Generation and Results
- Send user image + product image + prompt to Gemini image model.
- Add progress states and timeout handling.
- Render result with zoom and compare toggles.
- Cache session image for "try another product".

## Phase 6: Host Integration Actions
- Add-to-cart callbacks and custom events.
- Programmatic API (open, close, set product).
- Robust close/dismiss behaviors.

## Phase 7: Performance, UX, and Accessibility
- Bundle size audit and lazy-load heavy code.
- Error boundary to prevent host-site breakage.
- Keyboard navigation and focus trap.
- UX polish, animations, and empty/error states.

## Phase 8: Documentation and Launch
- Integration guide and CSP requirements.
- Privacy notice and data retention policy.
- QA checklist with real merchant sites.
- Release process and monitoring.

---
*Update this plan as scope or sequencing changes.*
