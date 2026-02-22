# Muse Hair Pro Virtual Try-On

## What This Is

A virtual try-on widget for Muse Hair Pro's Shopify store that lets customers visualize hair extensions on themselves before purchasing. Customers select a shade, length, and texture, upload or capture a photo, and see an AI-generated image of themselves wearing the hair extensions — powered by Google Gemini.

## Core Value

Let customers see how hair extensions will look on them before buying — reducing purchase hesitation, minimizing shade-matching returns, and increasing confidence in online hair extension purchases.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Embeddable JS widget for Muse Hair Pro's Shopify store
- [ ] Shade picker with color swatches and shade names
- [ ] Length selector (14", 18", 22", 26")
- [ ] Texture toggle (straight, wavy, curly)
- [ ] Photo upload flow (file picker, drag-and-drop)
- [ ] Live camera capture (WebRTC snapshot)
- [ ] Gemini AI hair extension try-on generation
- [ ] Before/after comparison view
- [ ] Download result image
- [ ] Share with stylist (email/link)
- [ ] Add to Shopify cart with selected variant
- [ ] Admin panel for managing shade catalog, lengths, and textures
- [ ] Mobile-responsive design

### Out of Scope

- Multi-tenant SaaS / serving other stores — single-store for Muse Hair Pro only
- Billing/monetization — built for one client
- Non-Shopify platforms — Shopify only
- Real-time AR / live video try-on — snapshot-based only
- User accounts/login — keep it frictionless for customers
- Wig try-on — hair extensions only
- Automated shade matching via AI — manual selection by customer

## Context

- **Integration approach:** Shopify script tag embed on Muse Hair Pro's product pages
- **Product data:** Shade, length, and texture options loaded from backend API; mapped to Shopify variants for cart
- **Try-on tech:** Google Gemini for image generation with hair extension-specific prompts
- **Target customers:** Women shopping for hair extensions online at Muse Hair Pro
- **Business model:** Custom tool for Muse Hair Pro (not SaaS)

## Constraints

- **API dependency:** Google Gemini API — core try-on generation depends on this
- **Shopify-specific:** Widget must integrate with Shopify's theme system and AJAX Cart API
- **Hair realism:** AI output quality depends on prompt engineering for natural-looking hair across different skin tones, hair colors, and lighting conditions
- **Shade accuracy:** Color representation must be consistent between shade picker swatches and AI-generated results

## Key Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Gemini AI over NanoBana Pro | Already integrated; supports image generation with prompts; can be tuned for hair | Confirmed |
| Single-store over multi-tenant | Reduces complexity; built specifically for Muse Hair Pro's needs | Confirmed |
| Shopify-only over universal embed | Focused integration with Shopify Cart API and theme system | Confirmed |
| Snapshot camera over real-time AR | Much simpler; WebRTC snapshot is sufficient for hair visualization | Confirmed |
| Manual shade selection over auto-match | Simpler UX; customers know what shade they want; avoids AI shade-matching errors | Confirmed |
| Hair extensions only (no wigs) | Focused scope; different visualization approach needed for wigs | Confirmed |

---
*Last updated: 2026-02-22 after pivot to Muse Hair Pro*
