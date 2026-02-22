# Architecture Research

**Domain:** Embeddable Virtual Try-On Widget for E-commerce
**Researched:** 2026-01-18
**Confidence:** MEDIUM-HIGH

## Standard Architecture

### System Overview

```
Host Website (Any E-commerce Platform)
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
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Button    │  │   Modal     │  │  Try-On     │      │
│  │  Injector   │  │  Container  │  │   View      │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         │                │                │              │
│         └────────────────┼────────────────┘              │
│                          │                               │
│  ┌───────────────────────┴───────────────────────┐      │
│  │              STATE MANAGER                     │      │
│  │   (photo, product, status, result)            │      │
│  └───────────────────────┬───────────────────────┘      │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           v
┌──────────────────────────────────────────────────────────┐
│                   API SERVICE LAYER                       │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Photo     │  │  NanoBana   │  │  Callback   │      │
│  │  Upload     │  │   Client    │  │   Bridge    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
                           │
                           v
              ┌────────────────────────┐
              │   NanoBana Pro API     │
              │   (External Service)   │
              └────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Loader** | Entry point; parse config; lazy-load core | Tiny IIFE script (<2KB) |
| **Button Injector** | Find targets; inject "Try this" buttons | DOM mutation, data attribute scanning |
| **Modal Container** | Full-screen overlay; style isolation | Shadow DOM or high z-index overlay |
| **Try-On View** | Photo upload UI; result display; actions | Component with loading/result states |
| **State Manager** | Centralize widget state; drive UI updates | Simple pub/sub or reactive store |
| **Photo Upload** | Handle file input; validate; prepare for API | File API with CORS handling |
| **NanoBana Client** | Call try-on API; poll for results | Async/await with retry logic |
| **Callback Bridge** | Communicate actions to host page | Custom events / postMessage |

## Recommended Project Structure

```
src/
├── loader/                 # Entry point (separate tiny bundle)
│   └── index.ts            # IIFE that initializes TryOnWidget global
├── core/                   # Main widget bundle
│   ├── widget.ts           # Widget orchestrator
│   ├── state.ts            # Simple reactive state
│   └── config.ts           # Configuration parsing
├── components/             # UI components
│   ├── button/             # "Try this" button
│   │   ├── button.ts
│   │   └── button.css
│   ├── modal/              # Overlay container
│   │   ├── modal.ts
│   │   └── modal.css
│   ├── upload/             # Photo upload flow
│   │   ├── upload.ts
│   │   └── upload.css
│   └── result/             # Try-on result display
│       ├── result.ts
│       └── result.css
├── services/               # External communication
│   ├── api.ts              # NanoBana Pro client
│   └── callbacks.ts        # Host page communication
├── styles/                 # Shared styles
│   └── base.css            # Reset, variables
└── types/                  # TypeScript definitions
    └── index.ts
```

### Structure Rationale

- **loader/** separate from **core/**: Loader must be tiny (<2KB) for fast initial load. Core bundle loads lazily when user clicks "Try this."
- **components/**: Each UI piece is self-contained with co-located styles. Easier to test and maintain.
- **services/**: Isolates external communication (API calls, host page callbacks) from UI logic. Easier to mock in tests.
- **styles/**: Shared CSS variables ensure consistent look. All styles scoped via Shadow DOM or CSS-in-JS to avoid host conflicts.

## Architectural Patterns

### Pattern 1: Two-Phase Loading (Loader + Core)

**What:** Tiny loader script loads immediately; full widget bundle loads on-demand.

**When to use:** Always for embeddable widgets. Minimizes impact on host page performance.

**Trade-offs:**
- Pro: Fast initial page load (loader <2KB)
- Pro: Full bundle only loads when needed
- Con: Slight delay on first button click
- Con: Two build outputs to manage

**Example:**
```typescript
// loader/index.ts - shipped as separate tiny bundle
(function() {
  window.TryOnWidget = window.TryOnWidget || {};
  window.TryOnWidget.init = function(config) {
    // Store config, scan for buttons
    document.querySelectorAll('[data-tryon-image]').forEach(btn => {
      btn.addEventListener('click', () => {
        // Lazy load core bundle
        if (!window.TryOnWidget._core) {
          const script = document.createElement('script');
          script.src = 'https://cdn.example.com/tryon-core.js';
          script.onload = () => window.TryOnWidget._core.open(btn);
          document.head.appendChild(script);
        } else {
          window.TryOnWidget._core.open(btn);
        }
      });
    });
  };
})();
```

### Pattern 2: Shadow DOM Style Isolation

**What:** Widget UI renders inside Shadow DOM to prevent CSS conflicts with host page.

**When to use:** Modal and overlay components that must look consistent across any host site.

**Trade-offs:**
- Pro: Complete style isolation - host CSS cannot affect widget
- Pro: Widget CSS cannot leak to host
- Con: Some CSS features (fonts, animations) need explicit handling
- Con: Slightly more complex DOM structure

**Example:**
```typescript
// components/modal/modal.ts
export function createModal(): HTMLElement {
  const host = document.createElement('div');
  host.id = 'tryon-widget-root';

  const shadow = host.attachShadow({ mode: 'closed' });

  // Inject styles into shadow DOM
  const style = document.createElement('style');
  style.textContent = getModalStyles(); // Bundled CSS
  shadow.appendChild(style);

  // Modal content goes here
  const container = document.createElement('div');
  container.className = 'tryon-modal';
  shadow.appendChild(container);

  document.body.appendChild(host);
  return container;
}
```

### Pattern 3: Data Attribute Configuration

**What:** Widget reads configuration from HTML data attributes on script tag and buttons.

**When to use:** Always for embeddable widgets. Allows configuration without JavaScript knowledge.

**Trade-offs:**
- Pro: Non-technical users can configure via HTML
- Pro: Works in CMSes that restrict JavaScript
- Pro: Self-documenting integration
- Con: Complex config may need JSON in attributes

**Example:**
```html
<!-- Store owner adds this to their site -->
<script
  src="https://cdn.example.com/tryon-loader.js"
  data-tryon-api-key="abc123"
  data-tryon-theme="light"
></script>

<!-- On product pages, buttons declare their product -->
<button
  data-tryon-image="https://store.com/products/shirt-123.jpg"
  data-tryon-product-id="shirt-123"
>
  Try this on
</button>
```

```typescript
// core/config.ts
export function parseConfig(): WidgetConfig {
  const script = document.querySelector('script[data-tryon-api-key]');
  return {
    apiKey: script?.getAttribute('data-tryon-api-key') || '',
    theme: script?.getAttribute('data-tryon-theme') || 'light',
  };
}
```

### Pattern 4: Async API with Polling

**What:** Submit try-on request, receive task ID, poll for completion.

**When to use:** When backend processing takes significant time (NanoBana Pro: 5-17 seconds).

**Trade-offs:**
- Pro: Works with async processing services
- Pro: User sees progress updates
- Con: More complex than simple request/response
- Con: Need to handle timeouts and failures

**Example:**
```typescript
// services/api.ts
export async function generateTryOn(
  userPhoto: File,
  productImage: string
): Promise<TryOnResult> {
  // 1. Submit job
  const { taskId } = await submitTryOnJob(userPhoto, productImage);

  // 2. Poll for completion
  const result = await pollForResult(taskId, {
    interval: 2000,      // Poll every 2 seconds
    timeout: 60000,      // Give up after 60 seconds
    onProgress: (status) => {
      // Update UI with progress
      state.set({ status });
    }
  });

  return result;
}

async function pollForResult(
  taskId: string,
  options: PollOptions
): Promise<TryOnResult> {
  const start = Date.now();

  while (Date.now() - start < options.timeout) {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`);
    const data = await response.json();

    if (data.status === 'completed') {
      return data.result;
    }
    if (data.status === 'failed') {
      throw new Error(data.error);
    }

    options.onProgress?.(data.status);
    await sleep(options.interval);
  }

  throw new Error('Try-on timed out');
}
```

## Data Flow

### Request Flow (Try-On Generation)

```
User clicks "Try this"
        │
        v
┌─────────────────┐
│ Button captures │
│ product image   │───> productImageUrl from data-tryon-image
│ from attribute  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Modal opens     │
│ Upload view     │
└────────┬────────┘
         │
         v
User uploads photo
         │
         v
┌─────────────────┐
│ Photo validated │───> Check dimensions, file type
│ Preview shown   │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────┐
│         API Service                  │
│  1. Upload photo to temp storage    │
│  2. Call NanoBana Pro API           │
│  3. Poll for result                 │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────┐
│ Result received │───> Try-on image URL
│ Display to user │
└────────┬────────┘
         │
         v
User chooses action:
├─> "Add to Cart" ───> Callback to host page
├─> "Try Another" ───> New product, same photo
└─> "Close"       ───> Cleanup
```

### State Management

```
┌──────────────────────────────────────────────────────┐
│                    WIDGET STATE                       │
├──────────────────────────────────────────────────────┤
│  currentView: 'upload' | 'processing' | 'result'     │
│  userPhoto: File | null                              │
│  productImage: string | null                         │
│  processingStatus: string                            │
│  resultImage: string | null                          │
│  error: string | null                                │
└──────────────────────────────────────────────────────┘
                         │
                         │ (subscribe)
                         v
┌──────────────────────────────────────────────────────┐
│                    UI COMPONENTS                      │
│                                                      │
│   [Upload View]  [Processing View]  [Result View]   │
│         │               │                 │          │
│         └───────────────┼─────────────────┘          │
│                         │                            │
│                    Renders based on                  │
│                    currentView state                 │
└──────────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Configuration Flow:** Script tag data attributes -> Loader parses -> Config object -> Widget initialization
2. **Product Flow:** Button data attribute -> Click handler -> Modal state -> API request
3. **Photo Flow:** File input -> Validation -> Preview -> Upload -> API request
4. **Result Flow:** API response -> State update -> Result view render -> User action -> Callback to host

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10K stores | Single CDN-hosted bundle. No concerns. |
| 10K-100K stores | Consider CDN with edge caching. Monitor API rate limits. |
| 100K+ stores | May need regional API endpoints. Widget versioning strategy becomes critical. |

### Scaling Priorities

1. **First bottleneck:** NanoBana Pro API rate limits. Solution: Implement client-side queue, show wait time estimates.
2. **Second bottleneck:** CDN bandwidth costs. Solution: Aggressive caching, bundle splitting.

Note: For this project, scaling is not an immediate concern. Focus on clean architecture that makes scaling possible later.

## Anti-Patterns

### Anti-Pattern 1: Heavy Loader

**What people do:** Bundle everything into one script that loads immediately.

**Why it's wrong:**
- Slows down host page
- Wasted bandwidth if user never clicks "Try this"
- Store owners will complain about performance impact

**Do this instead:** Two-phase loading. Tiny loader (<2KB) + lazy-loaded core bundle.

### Anti-Pattern 2: Global CSS

**What people do:** Add widget styles directly to document without scoping.

**Why it's wrong:**
- Widget styles leak to host page (breaks their design)
- Host styles leak to widget (breaks widget design)
- Impossible to predict what conflicts will occur

**Do this instead:** Shadow DOM for complete isolation, or very specific CSS class prefixes with `!important` as fallback.

### Anti-Pattern 3: Blocking API Calls

**What people do:** Make API calls synchronously or without proper loading states.

**Why it's wrong:**
- UI freezes during processing
- Users think widget is broken
- No way to show progress for long operations

**Do this instead:** Always async with loading states. For long operations (try-on generation), show progress updates via polling.

### Anti-Pattern 4: No Error Handling

**What people do:** Assume API calls succeed, show nothing on failure.

**Why it's wrong:**
- Users get stuck on loading screen
- No way to recover
- Support nightmare

**Do this instead:** Every async operation needs success, error, and timeout handling. Show user-friendly error messages with retry options.

### Anti-Pattern 5: Direct DOM Manipulation Without Cleanup

**What people do:** Inject elements without tracking them for cleanup.

**Why it's wrong:**
- Memory leaks on single-page apps
- Duplicate widgets after navigation
- Zombie event listeners

**Do this instead:** Track all injected elements. Provide `destroy()` method. Clean up on navigation events.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| NanoBana Pro API | REST with polling | Need API key. Handle rate limits. 5-17 second processing time. |
| CDN (for bundle hosting) | Static file hosting | Version bundles for cache busting. |
| Photo upload storage | Presigned URLs or direct | May need temp storage before API call. |

### Host Page Communication

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Widget -> Host (Add to Cart) | Custom Event | `window.dispatchEvent(new CustomEvent('tryon:addToCart', { detail: { productId } }))` |
| Widget -> Host (Analytics) | Custom Events | Allow host to track usage. |
| Host -> Widget (Configuration) | Data Attributes | On script tag and buttons. |
| Host -> Widget (Programmatic) | Global API | `window.TryOnWidget.open(config)` for advanced users. |

**Example callback bridge:**
```typescript
// services/callbacks.ts
export function notifyAddToCart(productId: string) {
  // Custom event for host page to listen
  window.dispatchEvent(new CustomEvent('tryon:addToCart', {
    detail: { productId },
    bubbles: true
  }));

  // Also call callback if provided in config
  const config = getConfig();
  if (config.onAddToCart) {
    config.onAddToCart(productId);
  }
}
```

## Build Order Implications

Based on component dependencies, recommended build order:

### Phase 1: Foundation
1. **Loader** - Entry point, must work standalone
2. **Configuration parsing** - Required by everything else
3. **State management** - Core infrastructure for UI

### Phase 2: Core UI
4. **Modal container** - Required by all views
5. **Upload view** - First user interaction
6. **Photo validation** - Before API integration works

### Phase 3: API Integration
7. **NanoBana Pro client** - Core try-on functionality
8. **Processing view** - Loading/progress states
9. **Result view** - Display generated images

### Phase 4: Host Integration
10. **Callback bridge** - Add to cart, analytics
11. **Error handling** - All edge cases
12. **Polish** - Animations, mobile optimization

This order ensures each phase delivers testable, demo-able functionality.

## Sources

**Embeddable Widget Patterns:**
- [Creating 3rd-party Embeddable Widgets in HTML and JS](https://blog.bguiz.com/articles/embeddable-widgets-html-javascript/)
- [Building an Embeddable Javascript Widget](https://www.gorillasun.de/blog/building-an-embeddable-javascript-widget/)
- [Create Embeddable React Widget](https://embeddable.co/blog/create-embeddable-react-widget)
- [Building an embeddable Widget - DEV Community](https://dev.to/woovi/building-an-embeddable-widget-2jlk)
- [How to Build an Embedded Widget with React & Redux](https://ryan-baker.medium.com/how-to-build-an-embedded-widget-with-react-redux-52a26604ccca)

**Shadow DOM and Style Isolation:**
- [Using shadow DOM - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [Shadow DOM vs. iFrame - HackerNoon](https://hackernoon.com/shadow-dom-vs-iframes-which-one-actually-works)
- [Best practices for using third-party embeds - web.dev](https://web.dev/articles/embed-best-practices)
- [How to Use Shadow DOM to Isolate Styles](https://www.courier.com/blog/how-to-use-the-shadow-dom-to-isolate-styles-on-a-dom-that-isnt-yours)

**Virtual Try-On Technology:**
- [Virtual Try-On Technology Guide - MobiDev](https://mobidev.biz/blog/augmented-reality-virtual-try-on-technology-for-ecommerce)
- [Image-Based Virtual Try-On Survey](https://arxiv.org/html/2311.04811v2)
- [Virtual Try-On for E-commerce Guide - Zakeke](https://www.zakeke.com/pillars/virtual-try-on-for-ecommerce-a-complete-guide/)

**Module Formats and Build:**
- [UMD Patterns - GitHub](https://github.com/umdjs/umd)
- [JavaScript Module Formats Comparison](https://medium.com/sessionstack-blog/how-javascript-works-the-module-pattern-comparing-commonjs-amd-umd-and-es6-modules-437f77548437)
- [Webpack Output Configuration](https://webpack.js.org/configuration/output/)

**State Management:**
- [VanJS - 1.0kB Reactive Framework](https://vanjs.org/)
- [Build a state management system with vanilla JavaScript - CSS-Tricks](https://css-tricks.com/build-a-state-management-system-with-vanilla-javascript/)

**Async Processing:**
- [Efficient S3 File Upload Pipeline](https://medium.com/@kubasukowski/efficient-s3-file-upload-pipeline-with-presigned-urls-event-triggers-and-lambda-processing-49811c276c46)
- [Building an image processing app with GraphQL and async serverless](https://hasura.io/blog/building-an-image-processing-app-with-graphql-and-serverless)

---
*Architecture research for: Embeddable Virtual Try-On Widget*
*Researched: 2026-01-18*
