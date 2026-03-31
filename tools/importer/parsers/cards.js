/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://www.marvell.com/
 * Extracts "More to Explore" card tiles from .colctrl.
 * Each card: background image + title + CTA link
 * Generated: 2026-03-26
 */
export default function parse(element, { document }) {
  // Find all tile items
  // Source DOM: .colctrl > .row > .col-sm-4 > .tile .marvell-tile
  const tiles = element.querySelectorAll('.tile .marvell-tile, .marvell-tile, .tile a');
  const cells = [];

  tiles.forEach((tile) => {
    // Image cell — extract background-image from the tile link
    const imageCell = [];
    const bgImage = tile.style.backgroundImage;
    if (bgImage) {
      const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (urlMatch) {
        const img = document.createElement('img');
        img.src = urlMatch[1];
        img.alt = '';
        imageCell.push(img);
      }
    }

    // Content cell — title + CTA link
    const contentCell = [];

    // Title
    // Source DOM: .richtext-content h3 .subsection-title
    const titleEl = tile.querySelector('.subsection-title, .richtext-content h3, h3');
    if (titleEl) {
      const h3 = document.createElement('h3');
      h3.textContent = titleEl.textContent.trim();
      contentCell.push(h3);
    }

    // CTA link text
    // Source DOM: .mrvll-text-link or .btn-link
    const ctaEl = tile.querySelector('.mrvll-text-link, .btn-link');
    if (ctaEl) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      // Use the tile's href since the CTA span itself is not a link
      a.href = tile.href || tile.closest('a')?.href || '#';
      a.textContent = ctaEl.textContent.trim();
      p.append(a);
      contentCell.push(p);
    }

    if (contentCell.length > 0) {
      if (imageCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else {
        cells.push([contentCell]);
      }
    }
  });

  if (cells.length === 0) {
    element.remove();
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
