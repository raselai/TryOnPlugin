# TryOnPlugin

## What This Is

A virtual try-on widget for e-commerce stores selling wearable products. Store owners embed a JavaScript snippet on their product pages, adding a "Try this" button next to "Add to Cart." Shoppers click it, upload a full-body photo, and see an AI-generated image of themselves wearing the product — powered by NanoBana Pro API.

## Core Value

Let shoppers visualize products on themselves before buying — reducing purchase hesitation and returns.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Embeddable JS widget that works on any website (Shopify, WooCommerce, custom)
- [ ] "Try this" button that opens try-on interface
- [ ] Photo upload flow for user's full-body image
- [ ] Integration with NanoBana Pro API for try-on generation
- [ ] Display generated try-on image to user
- [ ] "Add to cart" action from try-on view
- [ ] "Try another product" flow (reuse uploaded photo)
- [ ] Close/dismiss functionality
- [ ] Product image passed via button data attribute

### Out of Scope

- Live camera AR / real-time try-on — complexity, focus on photo upload first
- Save/share to social — not needed for v1 validation
- Monetization/billing — free while validating product-market fit
- Platform-specific apps (Shopify App Store, WooCommerce plugin) — JS snippet works everywhere, apps come later
- User accounts/login — keep it frictionless

## Context

- **Integration approach:** Universal JS snippet that store owners add to their site. Platform-specific wrappers (Shopify app, WP plugin) deferred to later.
- **Product data:** Store provides product image URL via button data attribute (`data-tryon-image`)
- **Try-on tech:** Using NanoBana Pro API for image generation (researched, not yet integrated)
- **Target customers:** E-commerce stores selling wearables (clothing, shoes, watches, accessories)
- **Business model:** Free during validation phase

## Constraints

- **API dependency**: NanoBana Pro API — core functionality depends on this external service
- **Cross-platform**: Must work on any website regardless of tech stack (vanilla JS, no framework lock-in for widget)
- **Product images**: Quality of try-on depends on clean product images from stores

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Photo upload over live AR | More achievable for v1, still compelling UX | — Pending |
| Universal JS snippet over platform apps | Works everywhere, faster to ship, apps can wrap it later | — Pending |
| NanoBana Pro API for try-on | Existing API handles the hard AI problem | — Pending |
| All wearables vs single category | User wants broad applicability, API supports it | — Pending |

---
*Last updated: 2025-01-18 after initialization*
