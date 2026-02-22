# Muse Hair Pro Virtual Try-On — Project State

## Project Reference

**Building:** Hair extension virtual try-on widget for Muse Hair Pro's Shopify store (Gemini AI)
**Core Value:** Let customers visualize hair extensions on themselves before purchasing
**Milestone:** v1.0 - Muse Hair Pro Launch

## Current Position

**Phase:** Phase 0 - Documentation Pivot
**Status:** Pivoting from generic multi-tenant SaaS to dedicated Muse Hair Pro hair extension tool

## Progress

```
Phase 1: Widget Foundation (Shopify)    [████░░░░░░] 40% — loader/modal exist, need Shopify-specific + brand styling
Phase 2: Photo Upload + Live Camera     [███░░░░░░░] 30% — upload exists, camera capture not started
Phase 3: Hair Extension Selectors       [░░░░░░░░░░]  0% — not started (shade, length, texture)
Phase 4: Gemini AI Hair-Specific        [██░░░░░░░░] 20% — Gemini pipeline exists, hair prompts not written
Phase 5: Results + Actions              [█░░░░░░░░░] 10% — basic result display exists, before/after + share + cart not started
Phase 6: Admin Dashboard                [██░░░░░░░░] 20% — Next.js dashboard exists, needs repurpose for shade catalog
Phase 7: Polish + Production            [░░░░░░░░░░]  0% — not started
```

## What to Remove

- Multi-tenant architecture (Store, ApiKey, Plan models)
- Stripe billing integration
- Per-store rate limiting and auth
- Generic product categories (clothing, watch, jewelry, etc.)
- NanoBana Pro API references
- WooCommerce / "any website" support

## What to Add

- Shade picker (color swatches with shade names)
- Length selector (e.g., 14", 18", 22", 26")
- Texture toggle (straight, wavy, curly)
- WebRTC live camera capture
- Before/after comparison view
- Download result image
- Share with stylist feature
- Shopify AJAX Cart API integration
- Admin panel for shade catalog CRUD
- Hair extension-specific Gemini prompts

## Recent Decisions

- Keep Gemini AI (adapt prompts for hair extensions instead of generic categories)
- Single-store for Muse Hair Pro only (remove multi-tenant SaaS complexity)
- Include live camera capture (WebRTC snapshot-based, not real-time AR)
- Shopify-only integration (no WooCommerce/custom sites)

## Blockers/Concerns

- Need shade catalog data from Muse Hair Pro (shade names, hex colors, product SKUs)
- Need Shopify store access for testing and cart API integration
- Need brand guidelines (colors, fonts, logo) for widget styling
- Hair extension prompt engineering needs iteration for realistic results across skin tones

## Session Continuity

Last session: 2026-02-22
Stopped at: Documentation pivot in progress
Resume file: None
