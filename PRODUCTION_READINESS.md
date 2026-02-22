# Muse Hair Pro Virtual Try-On — Production Readiness

## Overview

The TryOnPlugin is being pivoted from a generic multi-tenant SaaS to a dedicated hair extension virtual try-on tool for Muse Hair Pro's Shopify store, powered by Google Gemini AI.

---

## What to Remove (from previous multi-tenant architecture)

| Component | Files | Reason |
|-----------|-------|--------|
| Multi-tenant auth | `backend/src/middleware/auth.ts` | No per-store API keys; single-store tool |
| Stripe billing | `backend/src/services/billing.ts`, `backend/src/routes/billing.ts` | No billing; built for one client |
| Stripe webhooks | `backend/src/routes/webhooks.ts` | No subscription lifecycle |
| Store management routes | `backend/src/routes/stores.ts` | No store signup or management |
| Rate limiting per tenant | `backend/src/middleware/rateLimit.ts` | No multi-tenant rate limits |
| Store/ApiKey/Plan DB models | `backend/prisma/schema.prisma` | Replace with Shade/Length/Texture models |
| Usage tracking service | `backend/src/services/usage.ts` | No per-store usage quotas |
| Widget API key parsing | `widget/src/loader.ts`, `widget/src/config.ts` | No API key needed; single backend |

---

## What to Add

### New Database Schema (Prisma)

```prisma
model Shade {
  id            String   @id @default(cuid())
  name          String   // e.g., "Jet Black", "Honey Blonde"
  hexColor      String   // e.g., "#1B1B1B"
  displayOrder  Int      @default(0)
  shopifyVariantId String? // Maps to Shopify variant
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Length {
  id            String   @id @default(cuid())
  label         String   // e.g., "14 inches"
  inches        Int      // e.g., 14
  bodyLandmark  String   // e.g., "shoulders", "mid-back", "waist"
  displayOrder  Int      @default(0)
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Texture {
  id            String   @id @default(cuid())
  name          String   // e.g., "Straight", "Wavy", "Curly"
  displayOrder  Int      @default(0)
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model AdminUser {
  id            String   @id @default(cuid())
  email         String   @unique
  createdAt     DateTime @default(now())
}
```

### New API Endpoints

#### Public Endpoints (Widget)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/shades` | List active shades (ordered) |
| GET | `/api/lengths` | List active lengths (ordered) |
| GET | `/api/textures` | List active textures (ordered) |
| POST | `/api/tryon` | Generate hair extension try-on image |

#### Admin Endpoints (Dashboard — requires ADMIN_SECRET)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/login` | Verify admin secret |
| GET | `/api/admin/shades` | List all shades (including inactive) |
| POST | `/api/admin/shades` | Create shade |
| PUT | `/api/admin/shades/:id` | Update shade |
| DELETE | `/api/admin/shades/:id` | Delete shade |
| GET | `/api/admin/lengths` | List all lengths |
| POST | `/api/admin/lengths` | Create length |
| PUT | `/api/admin/lengths/:id` | Update length |
| DELETE | `/api/admin/lengths/:id` | Delete length |
| GET | `/api/admin/textures` | List all textures |
| POST | `/api/admin/textures` | Create texture |
| PUT | `/api/admin/textures/:id` | Update texture |
| DELETE | `/api/admin/textures/:id` | Delete texture |

### New Backend Services

| Service | File | Description |
|---------|------|-------------|
| Gemini Hair Service | `backend/src/services/gemini.ts` | Hair extension-specific prompt generation + Gemini API call |
| Photo Service | `backend/src/services/photo.ts` | Photo validation and processing |
| Catalog Service | `backend/src/services/catalog.ts` | Shade/Length/Texture CRUD operations |
| Admin Auth Middleware | `backend/src/middleware/adminAuth.ts` | Verify ADMIN_SECRET header |

### New Widget Components

| Component | File | Description |
|-----------|------|-------------|
| Camera Capture | `widget/src/components/camera/` | WebRTC camera with preview + snapshot |
| Shade Picker | `widget/src/components/selectors/shade.ts` | Color swatch grid |
| Length Selector | `widget/src/components/selectors/length.ts` | Length option buttons |
| Texture Toggle | `widget/src/components/selectors/texture.ts` | Texture toggle buttons |
| Before/After | `widget/src/components/result/beforeAfter.ts` | Slider or toggle comparison |
| Actions | `widget/src/components/actions/` | Download, share, add-to-cart buttons |
| Shopify Bridge | `widget/src/services/shopify.ts` | Cart API integration |

---

## Project Structure (Updated)

```
TryOnPlugin/
├── backend/                    # Fastify API server
│   ├── prisma/
│   │   ├── schema.prisma      # Shade, Length, Texture, AdminUser models
│   │   └── seed.ts            # Shade catalog seeding
│   ├── src/
│   │   ├── middleware/
│   │   │   └── adminAuth.ts   # Admin secret authentication
│   │   ├── routes/
│   │   │   ├── tryon.ts       # POST /api/tryon
│   │   │   ├── catalog.ts     # GET shades, lengths, textures
│   │   │   └── admin.ts       # Admin CRUD endpoints
│   │   ├── services/
│   │   │   ├── gemini.ts      # Hair extension Gemini service
│   │   │   ├── photo.ts       # Photo processing
│   │   │   └── catalog.ts     # DB operations for catalog
│   │   ├── db.ts              # Prisma client
│   │   ├── server.ts          # Main server
│   │   └── types.ts           # TypeScript types
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
│
├── dashboard/                  # Next.js admin dashboard
│   ├── app/
│   │   ├── page.tsx           # Admin login
│   │   ├── shades/page.tsx    # Shade catalog management
│   │   ├── lengths/page.tsx   # Length management
│   │   └── textures/page.tsx  # Texture management
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── utils.ts           # Utilities
│   └── package.json
│
├── widget/                     # Embeddable Shopify widget
│   ├── src/
│   │   ├── loader.ts          # Async loader (<2KB)
│   │   ├── core/
│   │   │   ├── widget.ts      # Widget orchestrator
│   │   │   ├── state.ts       # Reactive state
│   │   │   └── config.ts      # Config parsing
│   │   ├── components/
│   │   │   ├── modal/         # Shadow DOM modal
│   │   │   ├── camera/        # WebRTC capture
│   │   │   ├── upload/        # File upload
│   │   │   ├── selectors/     # Shade, length, texture
│   │   │   ├── result/        # Before/after display
│   │   │   └── actions/       # Download, share, cart
│   │   ├── services/
│   │   │   ├── api.ts         # Backend client
│   │   │   └── shopify.ts     # Shopify Cart API
│   │   └── styles/
│   │       └── base.css       # Brand styles
│   └── package.json
│
└── demo/                       # Demo/test page
```

---

## Environment Variables

### Backend

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
GEMINI_API_KEY=your_gemini_api_key
ADMIN_SECRET=your_admin_secret
SHOPIFY_STORE_URL=https://musehairpro.myshopify.com
CDN_URL=https://your-widget-cdn.vercel.app
```

### Dashboard

```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_ADMIN_SECRET=your_admin_secret
```

### Widget

```
# Configured via script tag data attributes:
# data-tryon-api="https://your-backend.vercel.app"
```

---

## Verification Checklist

### Hair Extension Try-On Quality
- [ ] Extensions look realistic and blend naturally with existing hair
- [ ] Each shade produces visually accurate color matching swatches
- [ ] Results are consistent across 4+ diverse skin tones
- [ ] Length differences are clearly visible (14" vs 26")
- [ ] Texture differences are clearly visible (straight vs wavy vs curly)
- [ ] Extensions don't look like wigs (natural root blending)

### Selectors
- [ ] Shade swatches load from API with correct colors and names
- [ ] Length options are selectable and clearly labeled
- [ ] Texture toggle works with visual feedback
- [ ] Selections persist across the session
- [ ] Touch-friendly sizing on mobile

### Before/After + Actions
- [ ] Before/after comparison view works (slider or toggle)
- [ ] Download saves high-quality image to device
- [ ] Share with stylist generates working link or email
- [ ] "Try Another Shade" reuses photo without re-upload

### Shopify Cart Integration
- [ ] Add to Cart adds correct variant to Shopify cart
- [ ] Shade + length + texture correctly maps to variant ID
- [ ] Cart UI updates after adding (cart count, drawer)
- [ ] Works with Muse Hair Pro's specific Shopify theme

### Camera + Upload
- [ ] Camera capture works on iOS Safari and Android Chrome
- [ ] Camera permission denied shows upload fallback
- [ ] File upload works with drag-and-drop and file picker
- [ ] 10MB photos compress to <1MB
- [ ] Consent shown before first upload

### Admin Dashboard
- [ ] Admin can log in with ADMIN_SECRET
- [ ] Admin can create, edit, delete shades with color preview
- [ ] Admin can manage lengths and textures
- [ ] Changes immediately reflected in widget

### Production
- [ ] Widget loads on Muse Hair Pro's Shopify store without errors
- [ ] Loader <2KB gzipped; core <50KB gzipped
- [ ] Modal appears above all Shopify theme elements
- [ ] No CSS leaks between widget and theme
- [ ] Photos deleted after Gemini processing (no permanent storage)
- [ ] Works on mobile Safari, Chrome; desktop Chrome, Firefox, Safari

---

## Local Development

### Backend

```bash
cd backend
cp .env.example .env
# Fill in: DATABASE_URL, GEMINI_API_KEY, ADMIN_SECRET
npm install
npx prisma db push
npm run db:seed
npm run dev
# Server runs on http://localhost:8787
```

### Dashboard

```bash
cd dashboard
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_ADMIN_SECRET
npm install
npm run dev
# Dashboard runs on http://localhost:3000
```

### Widget

```bash
cd widget
npm install
npm run dev
# Widget dev server on http://localhost:5173
```

---

## Deployment (Vercel)

1. Push code to GitHub.
2. Import repository in Vercel 3 times:
   - **Backend:** Root directory = `backend`
   - **Dashboard:** Root directory = `dashboard`
   - **Widget:** Root directory = `widget`
3. Set environment variables for each deployment.
4. Add widget script tag to Muse Hair Pro's Shopify theme.

---

**Target launch: Muse Hair Pro Shopify Store**
