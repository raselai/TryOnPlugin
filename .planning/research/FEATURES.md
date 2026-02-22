# Feature Research — Hair Extension Virtual Try-On

**Domain:** Hair Extension Virtual Try-On for Shopify
**Researched:** 2026-02-22
**Confidence:** MEDIUM-HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features customers assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Photo upload** | Core functionality — users need to provide their image | LOW | File picker + drag-drop; already partially built |
| **Live camera capture** | Mobile users expect to snap a selfie directly | MEDIUM | WebRTC snapshot; preview before submitting |
| **Shade selector** | Users must pick the hair extension color they want to try | LOW | Color swatches with shade names from catalog |
| **Length selector** | Hair extension length significantly changes the look | LOW | Dropdown or buttons: 14", 18", 22", 26" |
| **Texture toggle** | Straight, wavy, and curly look very different | LOW | Toggle buttons with visual icons |
| **AI-generated result** | Core output — showing user with extensions | HIGH | Gemini generates realistic hair overlay |
| **Before/after comparison** | Users need to see the difference clearly | MEDIUM | Slider or toggle between original and result |
| **Mobile responsiveness** | 60%+ of Shopify traffic is mobile | MEDIUM | Must work on iOS Safari and Android Chrome |
| **Loading state feedback** | AI generation takes 5-30 seconds | LOW | Progress indicator with status messages |
| **Download result image** | Users want to save and review later | LOW | Canvas-based download as PNG/JPEG |
| **Add to Shopify cart** | Seamless transition from try-on to purchase | MEDIUM | Shopify AJAX Cart API with correct variant ID |
| **Close/dismiss modal** | Users need to exit easily | LOW | X button, escape key, click outside |

### Differentiators (Competitive Advantage)

Features that set Muse Hair Pro apart from competitors.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Multi-shade session** | Try several shades without re-uploading photo | LOW | Cache user photo, regenerate with different shade |
| **Share with stylist** | Send try-on result to stylist for professional advice | LOW | Email link or downloadable comparison image |
| **Color matching suggestion** | AI suggests closest shade based on natural hair color | HIGH | Requires color analysis; defer to post-launch |
| **Realistic shadow/layering** | Extensions blend naturally with existing hair | HIGH | Prompt engineering for natural hair blending |
| **Side-by-side shade comparison** | Compare two shades at once | MEDIUM | Split-screen with two AI results |

### Anti-Features (Explicitly Avoid)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time video AR** | "Like a mirror" experience | Heavy compute, mobile performance issues, AR SDK complexity | WebRTC snapshot is fast enough; results are higher quality with Gemini |
| **User accounts/login** | Save try-on history | Creates friction, reduces adoption; privacy concerns | Session-based storage, download to save |
| **Wig support** | "While we're at it" | Different visualization approach; wigs cover all hair vs extensions adding length | Focus on extensions; wigs are a separate product |
| **Automated shade matching** | AI picks best shade | Inaccurate across skin tones; leads to wrong purchases and returns | Manual selection with good swatches; stylist consultation for guidance |
| **3D/AR hair simulation** | More realistic | Extremely complex; not needed for purchase decision; device compatibility | 2D AI generation is proven and works on all devices |

## MVP vs Post-Launch

### MVP (Launch With)

- [x] Photo upload (file picker + drag-drop)
- [ ] Live camera capture (WebRTC)
- [ ] Shade selector (color swatches)
- [ ] Length selector
- [ ] Texture toggle
- [ ] Gemini AI hair extension generation
- [ ] Before/after comparison
- [ ] Download result image
- [ ] Share with stylist
- [ ] Add to Shopify cart
- [ ] Mobile responsive modal
- [ ] Loading states and error handling
- [ ] Admin panel for shade catalog CRUD

### Post-Launch

- [ ] Multi-shade session (try multiple without re-upload)
- [ ] Side-by-side shade comparison
- [ ] Color matching suggestion
- [ ] Analytics (try-on rate, conversion lift)
- [ ] A/B testing different prompt styles

## Feature Prioritization

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Shade selector | HIGH | LOW | P1 |
| Length selector | HIGH | LOW | P1 |
| Texture toggle | HIGH | LOW | P1 |
| Camera capture | HIGH | MEDIUM | P1 |
| AI generation (Gemini) | HIGH | MEDIUM | P1 |
| Before/after | HIGH | MEDIUM | P1 |
| Download result | HIGH | LOW | P1 |
| Add to cart | HIGH | MEDIUM | P1 |
| Share with stylist | MEDIUM | LOW | P1 |
| Admin panel | HIGH | MEDIUM | P1 |
| Multi-shade session | HIGH | LOW | P2 |
| Shade comparison | MEDIUM | MEDIUM | P2 |
| Color matching | MEDIUM | HIGH | P3 |
| Analytics dashboard | MEDIUM | MEDIUM | P3 |

## Key Metrics to Track

| Metric | What It Measures | Target |
|--------|------------------|--------|
| Try-on initiation rate | % of product page visitors who click "Try On" | 10-20% |
| Try-on completion rate | % of initiations that produce a successful result | >75% |
| Add-to-cart rate (post-try-on) | % of completed try-ons that add to cart | 30-50% |
| Share rate | % of completed try-ons shared with stylist | 10-20% |
| Download rate | % of completed try-ons downloaded | 20-40% |
| Shade switch rate | Avg shades tried per session | 2-3 |
| Time to result | Seconds from submission to displayed result | <20s |
| Conversion lift | Purchase rate with try-on vs without | +25-35% |
| Return rate reduction | Returns for extensions purchased via try-on | -15-25% |

---
*Feature research for: Muse Hair Pro Hair Extension Virtual Try-On*
*Researched: 2026-02-22*
