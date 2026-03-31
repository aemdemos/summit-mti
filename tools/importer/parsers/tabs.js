/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs block.
 * Base: tabs. Source: https://www.marvell.com/
 * Extracts Markets tabbed carousel from .rebrandingtabscarousel.
 * Each tab: label | background image + heading + description + CTA
 * Generated: 2026-03-26
 */
export default function parse(element, { document }) {
  // Extract "Markets" heading from nav area — placed as default content before tabs block
  // Source DOM: .mrvll-features-nav h3, or h3.color-white-rebranding
  const marketsHeading = element.querySelector('.mrvll-features-nav h3, h3.color-white-rebranding');
  let headingEl = null;
  if (marketsHeading) {
    headingEl = document.createElement('h3');
    headingEl.textContent = marketsHeading.textContent.trim();
  }

  // Find tab navigation buttons for labels
  // Source DOM: .mrvll-features-nav ul li button
  const tabButtons = element.querySelectorAll('.mrvll-features-nav li button, .rebranding-nav-tab-carousel li button');

  // Find tab content panels (carousel items)
  // Source DOM: .carousel-inner > .item
  const tabPanels = element.querySelectorAll('.carousel-inner > .item');

  const cells = [];
  const panelCount = Math.max(tabButtons.length, tabPanels.length);

  for (let i = 0; i < panelCount; i += 1) {
    // Cell 1: Tab label from navigation button
    const tabLabel = tabButtons[i] ? tabButtons[i].textContent.trim() : `Tab ${i + 1}`;

    // Cell 2: Background image (separate column so tabs.js classifies it as tabs-img-col)
    // Cell 3: Text content (heading + description + CTA)
    const imageCell = [];
    const contentCell = [];
    const panel = tabPanels[i];

    if (panel) {
      // Background image — extracted from CSS background-image inline style on .item
      // (live site uses inline style, not <img> elements)
      const bgStyle = panel.style.backgroundImage;
      if (bgStyle) {
        const urlMatch = bgStyle.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          let bgUrl = urlMatch[1];
          if (bgUrl.startsWith('/')) {
            bgUrl = `https://www.marvell.com${bgUrl}`;
          }
          const bgImg = document.createElement('img');
          bgImg.src = bgUrl;
          bgImg.alt = '';
          imageCell.push(bgImg);
        }
      }

      // Heading
      // Source DOM: .mrvll-feature-text h3
      const heading = panel.querySelector('.mrvll-feature-text h3, .item-wrapper h3');
      if (heading) {
        const h3 = document.createElement('h3');
        h3.textContent = heading.textContent.trim();
        contentCell.push(h3);
      }

      // Description text
      // Source DOM: .mrvll-feature-text p (skip empty p and d-none paragraphs)
      const paragraphs = panel.querySelectorAll('.mrvll-feature-text p');
      paragraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (text && !p.classList.contains('d-none') && !p.classList.contains('d-md-block')) {
          const desc = document.createElement('p');
          desc.textContent = text;
          contentCell.push(desc);
        }
      });

      // CTA link
      // Source DOM: .mrvll-feature-text a.mrvll-text-link
      const ctaLink = panel.querySelector('.mrvll-feature-text a.mrvll-text-link, .mrvll-feature-text a[href]');
      if (ctaLink) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = ctaLink.href;
        a.textContent = ctaLink.textContent.trim();
        p.append(a);
        contentCell.push(p);
      }
    }

    // Three columns: [label, background image, text content]
    const row = [tabLabel];
    if (imageCell.length > 0) row.push(imageCell);
    row.push(contentCell.length > 0 ? contentCell : '');
    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });

  // Insert heading as default content before the tabs block table
  if (headingEl) {
    element.replaceWith(headingEl, block);
  } else {
    element.replaceWith(block);
  }
}
