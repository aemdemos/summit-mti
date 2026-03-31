# Marvell Homepage Migration Report

**Source:** https://www.marvell.com/
**Target:** AEM Edge Delivery Services
**Branch:** `homepage-migration`

---

## Homepage Structure Map

The homepage is composed of the following sections, listed top to bottom:

| # | Section | Reference Description | EDS Block | Status |
|---|---------|----------------------|-----------|--------|
| 1 | Header / Navigation | Logo, mega menu (Products/Company/Support), language selector, user login, search bar | `header` | Completed |
| 2 | Hero Carousel | Centered (max-width 1410px) image carousel with 5 slides. Each slide: dual images (bg + foreground), eyebrow label, H1 title, CTA button. Auto-rotates every 5s. | `carousel` | Completed |
| 3 | Text + Video (Columns) | "Marvell Enables AI Infrastructure" — full-width black bg with 20px bleed behind carousel. Left: H2 (43px, white), body text (#c8c9c7), white CTA button with arrow. Right: Vidyard video thumbnail with play button overlay and lightbox popup. | `columns` | Completed |
| 4 | Markets Tabs | "Markets" heading with 3 tabs (Data Center, Enterprise, Carrier). Each tab: image left, H3 + text + link right, prev/next arrows | `tabs` | Completed |
| 5 | More to Explore (Cards) | H3 section heading + 3 image cards. Each card: CSS background-image, H3 title, CTA link with blue arrow | `cards` | Completed |
| 6 | Footer | 4-column link grid (Company, Support, Careers, Worldwide), social icons, copyright with dynamic year | `footer` | Completed |

---

## Block Migration Status

### Completed

| Block | Files | Notes |
|-------|-------|-------|
| **Header** | `blocks/header/header.js`, `blocks/header/header.css` | Full mega menu, language selector, search bar, user login. Conditional bottom border on dropdown open. Mobile hamburger menu. |
| **Footer** | `blocks/footer/footer.js`, `blocks/footer/footer.css`, `blocks/footer/footer-tokens.css` | 4-column grid, social icons (Facebook, X, YouTube, Instagram, LinkedIn), dynamic copyright year. DA-safe selectors (content-based, not class-based). |
| **Carousel** | `blocks/carousel/carousel.js`, `blocks/carousel/carousel.css`, `blocks/carousel/carousel-tokens.css` | Centered hero carousel (max-width 1410px, matching header). Dark slides with dual images: first image as CSS background, second as foreground positioned right (48%) with 40px inner padding. Text overlay left (50% max-width) with eyebrow/H1/CTA. H1 constrained to 400px max-width for 3-line wrapping. White CTA button with SVG arrow and hover slide animation. SVG circle nav arrows at bottom-left (carousel-arrow.svg), dot indicators hidden. Left-edge gradient overlay for text readability. Auto-rotation at 5s interval with pause on hover, visibility, and viewport awareness. Instant slide transitions (no smooth scroll). Responsive tokens for mobile/tablet/desktop. |
| **Columns** | `blocks/columns/columns.js`, `blocks/columns/columns.css`, `blocks/columns/columns-tokens.css` | Full-width black background via `::before` pseudo-element (100vw) with 20px upward bleed behind carousel for seamless dark-to-dark flow. Two-column flex layout: left text column (H2 43px white, body text 15.2px #c8c9c7, white CTA button with nav-arrow-right.svg mask and hover slide animation), right image column with fully content-driven Vidyard video (author provides thumbnail image + video URL, JS adds play button overlay and lightbox). Video URL stored as `data-video-url` attribute on column (link removed from DOM to prevent layout shift on click). Play button overlay (100px circle SVG) centered on thumbnail. Click opens lightbox modal with Vidyard embed player (dark 85% opacity backdrop, close on ×/Escape/backdrop click). Padding 100px top/bottom (60px mobile). Responsive tokens for mobile/desktop. |

| **Tabs** | `blocks/tabs/tabs.js`, `blocks/tabs/tabs.css`, `blocks/tabs/tabs-tokens.css` | "Markets" heading (centered, uppercase). 3 tabs (Data Center, Enterprise, Carrier) with blue underline on active tab. Each panel: background image left (50%), text right with H3 + body text + CTA link. CTA: white text, uppercase, blue nav-arrow-right.svg arrow with hover shift animation (right 22px→15px). Prev/next navigation arrows overlapping bottom of panel. Responsive: stacked layout on mobile, side-by-side on desktop. |
| **Cards** | `blocks/cards/cards.js`, `blocks/cards/cards.css`, `blocks/cards/cards-tokens.css`, `blocks/card/card.js` | "More to Explore" centered H3 section heading. 3 cards in responsive grid (auto-fill, min 280px). Each card: CSS background-image (set by JS from author `<img>`), 130%→150% background-size zoom on hover (0.15s ease-out). White H3 heading (29.6px/600 weight), uppercase CTA link (12.8px/700 weight, 1.6px letter-spacing) with blue nav-arrow-right.svg arrow and hover shift (right 10px→3px, no opacity change). Card height: 200px mobile, 260px desktop (box-sizing: border-box with 45px padding). Empty card rows filtered in JS (no image + no text = skip). |

---

## Content Files

| File | Purpose | Status |
|------|---------|--------|
| `content/index.plain.html` | Homepage content (all blocks) | Created |
| `content/nav.plain.html` | Navigation structure | Created |
| `content/footer.plain.html` | Footer content | Created |

---

## Shared Assets

| Asset | Path | Status |
|-------|------|--------|
| Marvell logo | `icons/marvell-logo.svg` | Created |
| Search icon | `icons/search.svg` | Created |
| User icon | `icons/user.svg` | Created |
| Facebook icon | `icons/icon-social-facebook.svg` | Created |
| X/Twitter icon | `icons/icon-social-twitter.svg` | Created |
| YouTube icon | `icons/icon-social-youtube.svg` | Created |
| Instagram icon | `icons/icon-social-instagram.svg` | Created |
| LinkedIn icon | `icons/icon-social-linkedin.svg` | Created |
| Carousel nav arrow | `icons/carousel-arrow.svg` | Created |
| CTA arrow (right) | `icons/nav-arrow-right.svg` | Created |
| Video play button | `icons/video-play.svg` | Created |

---

## Key Styling Differences (Our Site vs Reference)

1. ~~**Carousel** — Reference uses centered dark carousel with dual images; ours showed image and text side-by-side~~ **RESOLVED**
2. ~~**Columns** — Reference has dark (#1a1a2e) background section with video play button; ours has white background~~ **RESOLVED**
3. ~~**Tabs** — Reference has image+text layout per tab with carousel arrows; ours is text-only~~ **RESOLVED**
4. ~~**Cards** — Reference uses background images with gradient overlay and white text; ours shows black placeholder boxes~~ **RESOLVED**

---

## Migration Complete

All 6 blocks (Header, Footer, Carousel, Columns, Tabs, Cards) have been migrated and polished to match the reference site. Key polish items completed:

- **Carousel**: CSS background-image approach for consistent slide sizing
- **Columns**: Fully content-driven video (author-editable thumbnail + URL), layout shift fix on play click
- **Tabs**: Background images per tab panel, CTA blue arrow with hover shift, prev/next navigation
- **Cards**: CSS background-image tiles with zoom hover (130%→150%), blue arrow CTA with hover shift (no opacity), empty card filtering, section spacing fix
