# Pitfalls Research — Muse Hair Pro Virtual Try-On

**Domain:** Hair Extension Virtual Try-On for Shopify
**Researched:** 2026-02-22
**Confidence:** MEDIUM-HIGH

---

## Critical Pitfalls

### Pitfall 1: Widget CSS/DOM Conflicts with Shopify Theme

**What goes wrong:**
Widget styles clash with Shopify theme CSS. Buttons, fonts, or colors render incorrectly. Modal appears behind theme elements or breaks product page layout.

**Why it happens:**
Shopify themes use varied CSS frameworks and global styles. Widget shares the DOM with theme. Each theme has different reset styles, z-index stacks, and layout approaches.

**How to avoid:**
- Use Shadow DOM for complete style isolation
- Namespace all class names with `mhp-tryon__` prefix
- Test on Muse Hair Pro's specific Shopify theme during development
- Test on 2-3 additional popular Shopify themes for robustness
- Never use global element selectors inside widget

**Phase to address:** Phase 1 (Widget Foundation)

---

### Pitfall 2: Modal Z-Index Wars

**What goes wrong:**
Try-on modal hidden behind Shopify theme's sticky header, announcement bar, cookie consent, or chat widget.

**How to avoid:**
- Append modal to `document.body` directly
- Use max z-index (2147483647)
- Test with Muse Hair Pro's actual theme including all apps and widgets they use
- Consider using `<dialog>` element with `showModal()`

**Phase to address:** Phase 1 (Widget Foundation)

---

### Pitfall 3: Hair Extension Prompt Quality

**What goes wrong:**
AI-generated images show unrealistic hair: wrong color tone, extensions floating above head, unnatural blending with existing hair, inconsistent length, or hair that looks like a wig rather than extensions.

**Why it happens:**
Generic "add hair" prompts don't account for: natural hair blending at the roots, how extensions attach (clip-in, tape-in, sew-in), color gradient between natural and extension hair, or how hair falls around face and shoulders.

**How to avoid:**
- Craft highly specific prompts: "Add [shade name] hair extensions that blend naturally from the crown, extending to [length] with [texture] texture, maintaining natural hair at the roots"
- Include prompt context about skin tone preservation and lighting consistency
- Test prompts across diverse skin tones and natural hair colors
- Iterate prompts with real customer photos (with permission)
- Include negative prompt guidance to avoid wig-like appearance

**Warning signs:**
- Extensions look "pasted on" rather than blended
- Color doesn't match shade swatch
- Hair defies gravity or physics
- Results look very different across skin tones

**Phase to address:** Phase 4 (Gemini AI Hair-Specific)

---

### Pitfall 4: Hair Color Accuracy Across Skin Tones

**What goes wrong:**
A shade that looks correct on lighter skin appears completely different on darker skin in the AI output. Blonde extensions on dark-skinned models appear washed out or unrealistic. Dark extensions on light-skinned models lose definition.

**Why it happens:**
AI models may have training biases. Lighting and color perception vary dramatically across skin tones. Prompt engineering that works for one skin tone may fail for another.

**How to avoid:**
- Test every shade across at least 4 diverse skin tone reference photos
- Include explicit skin tone preservation in prompts ("maintain the person's natural skin tone and lighting")
- Consider per-shade prompt adjustments for extreme contrasts (platinum blonde on very dark skin)
- Get feedback from diverse testers during development

**Phase to address:** Phase 4 (Gemini AI Hair-Specific)

---

### Pitfall 5: Camera Permissions Denied

**What goes wrong:**
User clicks "Take Photo," browser shows camera permission prompt, user denies or dismisses it. Widget shows blank/broken camera view. On iOS, permission may be permanently blocked.

**Why it happens:**
Users are cautious about camera access. Permission prompts vary by browser. Some users accidentally deny permanently. Shopify pages served over HTTPS (required for WebRTC) but third-party script context may complicate permissions.

**How to avoid:**
- Always provide photo upload as a fallback (never make camera-only)
- Show a friendly message explaining why camera access is needed before triggering the permission
- Handle the `NotAllowedError` gracefully with clear instructions
- Provide "How to enable camera" instructions per browser
- Default to upload tab; camera is secondary option

**Phase to address:** Phase 2 (Photo Upload + Live Camera)

---

### Pitfall 6: Shopify Theme Incompatibility

**What goes wrong:**
Widget works perfectly on test theme but breaks on Muse Hair Pro's actual theme. Cart integration fails because theme uses custom cart drawer. Product page structure differs from expected DOM.

**Why it happens:**
Shopify themes vary wildly. Custom themes may override standard Shopify JavaScript. Cart drawers, quick-add features, and AJAX navigation can intercept widget behavior.

**How to avoid:**
- Develop and test on Muse Hair Pro's exact theme from day one
- Use Shopify's standard `/cart/add.js` which works across all themes
- After adding to cart, dispatch both custom event AND try to update cart count element
- Don't assume any specific DOM structure outside the widget
- Ask Muse Hair Pro for a development store with their theme installed

**Phase to address:** Phase 1 (Widget Foundation) and Phase 5 (Results + Actions)

---

### Pitfall 7: Extension Length Realism

**What goes wrong:**
User selects 26" extensions but AI generates hair that looks 14". Or 14" extensions look impossibly long. Length representation is inconsistent and misleading.

**Why it happens:**
AI image generation interprets "length" loosely. What "22 inches" means depends on the person's height, where hair starts, and whether it's straight or curly (curly hair looks shorter due to shrinkage).

**How to avoid:**
- Use relative references in prompts: "hair reaching the mid-back" instead of just "22 inches"
- Map lengths to body landmarks: 14" = shoulders, 18" = mid-back, 22" = waist, 26" = below waist
- Include reference to the person's proportions in the prompt
- Test each length option to verify visual consistency

**Phase to address:** Phase 4 (Gemini AI Hair-Specific)

---

### Pitfall 8: API Latency Destroying User Experience

**What goes wrong:**
User uploads photo, selects options, submits — waits 15-45 seconds staring at a spinner. Assumes it's broken. Abandons.

**How to avoid:**
- Design for 30+ second waits as normal
- Multi-step progress messages: "Uploading photo..." → "Analyzing your look..." → "Applying extensions..." → "Almost ready..."
- Set 60-second timeout with graceful failure and retry
- Allow user to cancel and adjust selections

**Phase to address:** Phase 4 and Phase 5

---

### Pitfall 9: Bundle Bloating Shopify Store

**What goes wrong:**
Widget script slows down Muse Hair Pro's store. PageSpeed score drops. Shopify theme already loads multiple apps.

**How to avoid:**
- Loader <2KB; core widget <50KB gzipped
- Load widget async; never block page render
- Lazy load camera/WebRTC code only when camera tab is selected
- Defer modal content until button click

**Phase to address:** Phase 1 (Widget Foundation) and Phase 7 (Polish)

---

### Pitfall 10: Privacy and Photo Handling

**What goes wrong:**
Customer photos stored without consent. No deletion policy. GDPR or CCPA inquiry.

**How to avoid:**
- Consent before photo upload
- Process photos in memory; don't persist after generation
- Clear privacy notice about photo use
- Delete uploaded photos immediately after Gemini processing
- Never store user photos in database

**Phase to address:** Phase 2 (Photo Upload)

---

### Pitfall 11: CSP Blocking Widget on Shopify

**What goes wrong:**
Widget's backend API calls blocked by Content Security Policy. Camera access blocked. External resources fail to load.

**How to avoid:**
- Document required CSP directives for Muse Hair Pro's store
- Minimize external resource loading
- Use inline styles within Shadow DOM
- Test with Shopify's CSP configuration

**Phase to address:** Phase 1 (Widget Foundation)

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Gemini API | Generic "try on product" prompt | Hair extension-specific prompt with shade, length, texture, blending instructions |
| Gemini API | No timeout handling | 60s timeout with user feedback and retry |
| Gemini API | Sending full-res photos | Compress to <1MB before sending |
| Shopify Cart API | Hardcoded variant IDs | Map shade+length+texture to variant at runtime |
| Shopify Cart API | Not updating cart UI after add | Dispatch cart:updated event and try to update cart count |
| WebRTC Camera | No fallback when denied | Always provide upload as alternative |
| Admin Dashboard | No authentication | ADMIN_SECRET env var or session-based auth |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CSS/DOM conflicts | Phase 1 - Widget Foundation | Widget renders correctly on Muse Hair Pro's Shopify theme |
| Z-index wars | Phase 1 - Widget Foundation | Modal appears above all theme elements |
| Hair prompt quality | Phase 4 - Gemini AI | Test with 10+ diverse photos; results look natural |
| Color across skin tones | Phase 4 - Gemini AI | Test each shade across 4+ skin tones |
| Camera denied | Phase 2 - Camera | Graceful fallback to upload when camera denied |
| Shopify theme compat | Phase 1 + Phase 5 | Works on Muse Hair Pro's actual theme |
| Length realism | Phase 4 - Gemini AI | Each length option produces visually distinct, realistic results |
| API latency | Phase 4 + Phase 5 | 30+ second wait handled with progress feedback |
| Bundle bloat | Phase 1 + Phase 7 | Loader <2KB, core <50KB gzipped |
| Privacy | Phase 2 - Upload | Consent shown; photos deleted after processing |
| CSP blocking | Phase 1 | Widget works on Shopify with default CSP |

---
*Pitfalls research for: Muse Hair Pro Hair Extension Virtual Try-On*
*Researched: 2026-02-22*
