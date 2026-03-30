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
| 3 | Text + Video (Columns) | "Marvell Enables AI Infrastructure" — left text with H2, paragraph, CTA; right side video thumbnail with play button | `columns` | Pending |
| 4 | Markets Tabs | "Markets" heading with 3 tabs (Data Center, Enterprise, Carrier). Each tab: image left, H3 + text + link right, prev/next arrows | `tabs` | Pending |
| 5 | More to Explore (Cards) | H3 section heading + 3 image cards. Each card: background image, H3 title, CTA link | `cards` | Pending |
| 6 | Footer | 4-column link grid (Company, Support, Careers, Worldwide), social icons, copyright with dynamic year | `footer` | Completed |

---

## Block Migration Status

### Completed

| Block | Files | Notes |
|-------|-------|-------|
| **Header** | `blocks/header/header.js`, `blocks/header/header.css` | Full mega menu, language selector, search bar, user login. Conditional bottom border on dropdown open. Mobile hamburger menu. |
| **Footer** | `blocks/footer/footer.js`, `blocks/footer/footer.css`, `blocks/footer/footer-tokens.css` | 4-column grid, social icons (Facebook, X, YouTube, Instagram, LinkedIn), dynamic copyright year. DA-safe selectors (content-based, not class-based). |
| **Carousel** | `blocks/carousel/carousel.js`, `blocks/carousel/carousel.css`, `blocks/carousel/carousel-tokens.css` | Centered hero carousel (max-width 1410px, matching header). Dark slides with dual images: first image as CSS background, second as foreground positioned right (48%) with 40px inner padding. Text overlay left (50% max-width) with eyebrow/H1/CTA. H1 constrained to 400px max-width for 3-line wrapping. White CTA button with SVG arrow and hover slide animation. SVG circle nav arrows at bottom-left (carousel-arrow.svg), dot indicators hidden. Left-edge gradient overlay for text readability. Auto-rotation at 5s interval with pause on hover, visibility, and viewport awareness. Instant slide transitions (no smooth scroll). Responsive tokens for mobile/tablet/desktop. |

### Pending

| Block | Existing Code | What Needs to Be Done |
|-------|--------------|----------------------|
| **Columns** | `blocks/columns/columns.js`, `blocks/columns/columns.css` | Style to match reference: dark background section, left-aligned text with H2/paragraph/CTA, right-side video thumbnail with play button overlay. Current rendering is basic two-column with no dark theme. |
| **Tabs** | `blocks/tabs/tabs.js`, `blocks/tabs/tabs.css` | Style to match reference: "Markets" heading, underlined active tab, tab content with image left + text right layout, prev/next carousel arrows within each tab panel. Current rendering is functional but unstyled. |
| **Cards** | `blocks/cards/cards.js`, `blocks/cards/cards.css` | Style to match reference: 3 cards in a row, background images with dark gradient overlay, white text overlay (H3 + CTA), hover effect. Current rendering shows cards stacked with black placeholder images. |

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

---

## Key Styling Differences (Our Site vs Reference)

1. ~~**Carousel** — Reference uses centered dark carousel with dual images; ours showed image and text side-by-side~~ **RESOLVED**
2. **Columns** — Reference has dark (#1a1a2e) background section with video play button; ours has white background
3. **Tabs** — Reference has image+text layout per tab with carousel arrows; ours is text-only
4. **Cards** — Reference uses background images with gradient overlay and white text; ours shows black placeholder boxes

---

## Next Steps

1. ~~Style the **Carousel** block to match the reference hero layout~~ **DONE**
2. Style the **Columns** block with dark background and video integration
3. Style the **Tabs** block with image+text layout per tab
4. Style the **Cards** block with image overlays and CTAs
