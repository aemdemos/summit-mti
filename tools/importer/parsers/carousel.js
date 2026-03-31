/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel block.
 * Base: carousel. Source: https://www.marvell.com/
 * Extracts hero carousel slides from .rebrandingcarousel.
 * Each slide: background image | eyebrow + heading + CTA
 * Generated: 2026-03-26
 */
export default function parse(element, { document }) {
  // Find all carousel slide items
  // Source DOM: .cmp-carousel__item contains .rebrandingteaser > .cmp-teaser > .item
  const slideItems = element.querySelectorAll('.cmp-carousel__item');
  const cells = [];

  slideItems.forEach((slide) => {
    // Cell 1: Images — background + foreground (carousel block JS uses dual-image pattern)
    // Background: CSS background-image on .item element (inline style)
    // Foreground: .mrvll-hero-image img (nested product image, desktop version)
    const imageCell = [];

    // Background image: extract from inline style on .item
    const itemEl = slide.querySelector('.item');
    if (itemEl) {
      const bgStyle = itemEl.style.backgroundImage;
      if (bgStyle) {
        const urlMatch = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          let bgUrl = urlMatch[1];
          // Convert relative /content/dam/... paths to absolute
          if (bgUrl.startsWith('/')) {
            bgUrl = `https://www.marvell.com${bgUrl}`;
          }
          const bgImg = document.createElement('img');
          bgImg.src = bgUrl;
          bgImg.alt = '';
          imageCell.push(bgImg);
        }
      }
    }

    // Foreground/nested image: inside .mrvll-hero-image (desktop version)
    const fgImg = slide.querySelector('.mrvll-hero-image img.d-none.d-md-block')
      || slide.querySelector('.mrvll-hero-image img')
      || slide.querySelector('.item-wrapper img');
    if (fgImg) {
      const fgClone = document.createElement('img');
      fgClone.src = fgImg.currentSrc || fgImg.src;
      fgClone.alt = fgImg.alt || '';
      imageCell.push(fgClone);
    }

    // Fallback: if no separate images found, try any img in slide
    if (imageCell.length === 0) {
      const anyImg = slide.querySelector('img');
      if (anyImg) imageCell.push(anyImg);
    }

    // Cell 2: Content (eyebrow + heading + CTA)
    const contentCell = [];

    // Eyebrow text
    // Source DOM: .mrvll-eyebrow
    const eyebrow = slide.querySelector('.mrvll-eyebrow');
    if (eyebrow) {
      const eyebrowP = document.createElement('p');
      eyebrowP.textContent = eyebrow.textContent.trim();
      contentCell.push(eyebrowP);
    }

    // Heading - multiple h1 elements combined into one
    // Source DOM: .color-white h1 (multiple h1s per slide)
    const headingContainer = slide.querySelector('.color-white, [class*="color-white"]');
    if (headingContainer) {
      const h1s = headingContainer.querySelectorAll('h1');
      if (h1s.length > 0) {
        const combinedHeading = document.createElement('h1');
        const parts = [];
        h1s.forEach((h) => {
          const b = h.querySelector('b');
          parts.push(b ? b.textContent.trim() : h.textContent.trim());
        });
        combinedHeading.textContent = parts.join(' ');
        contentCell.push(combinedHeading);
      }
    }

    // CTA link - desktop version
    // Source DOM: .d-none.d-md-inline-block .mrvll-text-link a
    const ctaContainer = slide.querySelector('.d-none.d-md-inline-block .mrvll-text-link a, .cmp-teaser__ctabutton a');
    if (ctaContainer) {
      const ctaLink = document.createElement('a');
      ctaLink.href = ctaContainer.href;
      ctaLink.textContent = ctaContainer.textContent.trim();
      const ctaP = document.createElement('p');
      ctaP.append(ctaLink);
      contentCell.push(ctaP);
    }

    // Build row: [images, content]
    if (imageCell.length > 0 || contentCell.length > 0) {
      cells.push([imageCell.length > 0 ? imageCell : '', contentCell.length > 0 ? contentCell : '']);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
