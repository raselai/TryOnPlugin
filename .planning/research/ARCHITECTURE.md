# Architecture Research — Muse Hair Pro Virtual Try-On

**Domain:** Hair Extension Virtual Try-On Widget for Shopify
**Researched:** 2026-02-22
**Confidence:** MEDIUM-HIGH

## System Overview

```
Muse Hair Pro Shopify Store
============================================================
                           |
                    [Script Tag]
                           |
                           v
┌──────────────────────────────────────────────────────────┐
│                    WIDGET LOADER                          │
│    loader.js (tiny IIFE, <2KB)                           │
│    - Parse data attributes                               │
│    - Initialize global namespace                         │
│    - Lazy-load main bundle when needed                   │
└────────────────────────┬─────────────────────────────────┘
                         │ (on button click)
                         v
┌──────────────────────────────────────────────────────────┐
│                     WIDGET CORE                           │
│                                                          │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │ Camera/Upload │  │  Shade/Length/ │  │  Before/     │ │
│  │    View       │  │  Texture      │  │  After       │ │
│  │               │  │  Selectors    │  │  Result      │ │
│  └───────┬───────┘  └───────┬───────┘  └──────┬───────┘ │
│          │                  │                  │         │
│          └──────────────────┼──────────────────┘         │
│                             │                            │
│  ┌──────────────────────────┴──────────────────────────┐ │
│  │                   STATE MANAGER                      │ │
│  │  { userPhoto, selectedShade, selectedLength,        │ │
│  │    selectedTexture, resultImage, originalImage }     │ │
│  └──────────────────────────┬──────────────────────────┘ │
│                             │                            │
│  ┌──────────────────────────┴──────────────────────────┐ │
│  │                  SHOPIFY BRIDGE                      │ │
│  │  Add-to-cart (AJAX Cart API), variant mapping       │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │
                           v
┌──────────────────────────────────────────────────────────┐
│                   BACKEND (Fastify)                       │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Photo     │  │   Shade     │  │   Gemini Hair   │  │
│  │  Handler    │  │   Catalog   │  │   Extension     │  │
│  │             │  │   API       │  │   Service        │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  ADMIN API                           │ │
│  │  Shade CRUD, Length CRUD, Texture CRUD              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │
              ┌────────────┼────────────────┐
              v                             v
┌────────────────────────┐    ┌──────────────────────────┐
│   Google Gemini API    │    │   Shopify Cart API       │
│   (Image Generation)   │    │   (Add to Cart)          │
└────────────────────────┘    └──────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **Loader** | Entry point; parse config; lazy-load core | Tiny IIFE (<2KB) on Shopify product pages |
| **Camera/Upload View** | Photo upload + WebRTC camera capture | File API + navigator.mediaDevices.getUserMedia |
| **Shade/Length/Texture Selectors** | User selects hair extension options | Color swatches, length buttons, texture toggle |
| **Before/After Result** | Display original vs try-on image | Slider comparison or toggle view |
| **State Manager** | Centralize widget state; drive UI updates | Simple pub/sub reactive store |
| **Shopify Bridge** | Map selections to Shopify variants; add to cart | Shopify AJAX Cart API (`/cart/add.js`) |
| **Photo Handler** | Receive upload; compress; validate | Backend endpoint with image processing |
| **Shade Catalog API** | Serve shade, length, texture options | REST endpoints reading from Prisma DB |
| **Gemini Hair Extension Service** | Generate try-on with hair-specific prompts | Gemini image generation with tuned prompts |
| **Admin API** | CRUD for shade catalog | Protected endpoints for admin dashboard |

## Recommended Project Structure

```
widget/
├── src/
│   ├── loader.ts              # IIFE entry point (<2KB)
│   ├── core/
│   │   ├── widget.ts          # Widget orchestrator
│   │   ├── state.ts           # Reactive state management
│   │   └── config.ts          # Configuration parsing
│   ├── components/
│   │   ├── modal/             # Overlay container (Shadow DOM)
│   │   ├── camera/            # WebRTC camera capture
│   │   ├── upload/            # Photo upload (file + drag-drop)
│   │   ├── selectors/         # Shade, length, texture pickers
│   │   ├── result/            # Before/after display
│   │   └── actions/           # Download, share, add-to-cart
│   ├── services/
│   │   ├── api.ts             # Backend API client
│   │   └── shopify.ts         # Shopify AJAX Cart bridge
│   └── styles/
│       └── base.css           # Reset, brand variables
│
backend/
├── prisma/
│   └── schema.prisma          # Shade, Length, Texture, AdminUser models
├── src/
│   ├── routes/
│   │   ├── tryon.ts           # POST /api/tryon
│   │   ├── catalog.ts         # GET /api/shades, /api/lengths, /api/textures
│   │   └── admin.ts           # Admin CRUD endpoints
│   ├── services/
│   │   ├── gemini.ts          # Hair extension prompt generation + Gemini call
│   │   └── photo.ts           # Photo processing and validation
│   ├── middleware/
│   │   └── adminAuth.ts       # Admin authentication
│   └── server.ts              # Fastify server
│
dashboard/                     # Next.js admin dashboard
├── app/
│   ├── page.tsx               # Admin login
│   ├── shades/page.tsx        # Shade catalog management
│   ├── lengths/page.tsx       # Length management
│   └── textures/page.tsx      # Texture management
```

## Architectural Patterns

### Pattern 1: WebRTC Camera Capture

**What:** Use WebRTC to access device camera, capture a snapshot, and use as user photo.

**When to use:** Mobile-first — customers want to snap a quick selfie rather than browse files.

**Trade-offs:**
- Pro: Faster flow on mobile; no file browsing needed
- Pro: Better photo quality guidance (live preview)
- Con: Camera permission prompt may confuse some users
- Con: Not all browsers support getUserMedia identically

**Flow:**
```
User clicks "Take Photo"
    → Request camera permission (getUserMedia)
    → Show live preview in <video> element
    → User clicks "Capture"
    → Draw video frame to <canvas>
    → Convert canvas to Blob
    → Use as userPhoto in state
```

### Pattern 2: Shopify AJAX Cart API

**What:** Add items to Shopify cart without page reload using `/cart/add.js`.

**When to use:** After try-on, user clicks "Add to Cart" — add the correct shade/length/texture variant.

**Trade-offs:**
- Pro: No page reload; seamless UX
- Pro: Well-documented Shopify API
- Con: Must map shade+length+texture to correct Shopify variant ID
- Con: Cart UI update depends on theme (may need to trigger cart drawer)

**Example:**
```typescript
// services/shopify.ts
export async function addToShopifyCart(variantId: string, quantity = 1) {
  const response = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: variantId, quantity }]
    })
  });

  if (!response.ok) throw new Error('Failed to add to cart');

  // Trigger cart drawer/notification (theme-specific)
  document.dispatchEvent(new CustomEvent('cart:updated'));
  return response.json();
}
```

### Pattern 3: Shadow DOM Style Isolation

Same as before — widget UI renders inside Shadow DOM to prevent CSS conflicts with Shopify theme.

### Pattern 4: Two-Phase Loading

Same as before — tiny loader + lazy-loaded core on button click.

## Data Flow

### Try-On Generation Flow

```
User selects shade + length + texture
    │
    v
User uploads photo OR captures via camera
    │
    v
┌─────────────────────┐
│ Client-side:        │
│ - Compress image    │
│ - Validate dims     │
│ - Show preview      │
└────────┬────────────┘
         │
         v
┌─────────────────────────────────────┐
│ POST /api/tryon                      │
│ Body: { photo, shade, length,       │
│         texture }                    │
│                                      │
│ Backend:                             │
│ 1. Validate photo                   │
│ 2. Look up shade details from DB    │
│ 3. Build hair extension prompt      │
│ 4. Call Gemini image generation     │
│ 5. Return result image              │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────┐
│ Display result:     │
│ - Before/after view │
│ - Download button   │
│ - Share button      │
│ - Add to Cart       │
└─────────────────────┘
```

### State Management

```
┌──────────────────────────────────────────────────────┐
│                    WIDGET STATE                       │
├──────────────────────────────────────────────────────┤
│  currentView: 'selectors' | 'capture' | 'processing'│
│              | 'result'                               │
│  userPhoto: Blob | null                              │
│  originalImage: string | null  (data URL of photo)   │
│  selectedShade: Shade | null                         │
│  selectedLength: Length | null                        │
│  selectedTexture: Texture | null                     │
│  resultImage: string | null    (data URL of result)  │
│  processingStatus: string                            │
│  error: string | null                                │
│  catalog: { shades[], lengths[], textures[] }        │
└──────────────────────────────────────────────────────┘
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Gemini API | REST image generation | Hair extension-specific prompts; 5-30s processing |
| Shopify AJAX Cart API | `/cart/add.js` | Map shade+length+texture to variant ID |
| Shopify Storefront | Script tag embed | Widget loaded on product pages |

### Host Page Communication

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Widget → Shopify Cart | Fetch to `/cart/add.js` | Add selected variant to cart |
| Widget → Host (Events) | Custom Events | `tryon:addToCart`, `tryon:complete`, `tryon:close` |
| Host → Widget (Config) | Data Attributes | On script tag for backend URL |

## Anti-Patterns

### Anti-Pattern 1: Polling for AI Results
**Why wrong for us:** Gemini API returns results synchronously (not task-based). No need for polling pattern — simple request/response with timeout.
**Do instead:** Single POST with generous timeout (60s). Show progress animation client-side.

### Anti-Pattern 2: Storing Variant IDs in Widget
**Why wrong:** Variant IDs change when Shopify products are updated.
**Do instead:** Map shade+length+texture to variant at runtime via Shopify product data or backend lookup.

### Anti-Pattern 3: Generic Product Prompts
**Why wrong:** Generic "try this product on" prompts produce poor results for hair.
**Do instead:** Hair extension-specific prompts that specify color blending, placement (head/shoulders), length, and texture.

---
*Architecture research for: Muse Hair Pro Hair Extension Virtual Try-On*
*Researched: 2026-02-22*
