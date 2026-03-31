/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://www.marvell.com/
 * Extracts two-column layout from .tile-with-video section.
 * Column 1: heading + text + CTA | Column 2: video thumbnail image
 * Generated: 2026-03-26
 */
export default function parse(element, { document }) {
  // Column 1: Text content
  // Source DOM: .left-section contains h2, p, .ctabutton a
  const leftSection = element.querySelector('.left-section, .col-sm-6:first-child');
  const col1 = [];

  if (leftSection) {
    // Heading
    // Source DOM: .left-section h2
    const heading = leftSection.querySelector('h2, h3, h1');
    if (heading) col1.push(heading);

    // Description paragraph
    // Source DOM: .left-section > p
    const desc = leftSection.querySelector('p');
    if (desc) col1.push(desc);

    // CTA link
    // Source DOM: .ctabutton .mrvll-text-link a
    const ctaLink = leftSection.querySelector('.mrvll-text-link a, .ctabutton a, a[href]');
    if (ctaLink) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaLink.href;
      a.textContent = ctaLink.textContent.trim();
      p.append(a);
      col1.push(p);
    }
  }

  // Column 2: Video thumbnail image + editable Vidyard URL
  // Both are author-editable: change the image to swap the thumbnail,
  // edit the URL to point to a different video, or remove both to drop the video.
  // Source DOM: .right-section .vidyard-add-play-icon img.tile-popup-vidyard
  const rightSection = element.querySelector('.right-section, .col-sm-6:last-child');
  const col2 = [];

  if (rightSection) {
    const videoImg = rightSection.querySelector('.tile-popup-vidyard, .vidyard-add-play-icon img, img');
    if (videoImg) {
      const uuid = videoImg.getAttribute('data-uuid')
        || videoImg.getAttribute('data-video-url');
      if (uuid) {
        // Thumbnail image (editable by author)
        const thumbImg = document.createElement('img');
        thumbImg.src = `https://play.vidyard.com/${uuid}.jpg`;
        thumbImg.alt = '';
        col2.push(thumbImg);

        // Video URL link (editable by author)
        const videoUrl = `https://play.vidyard.com/${uuid}`;
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = videoUrl;
        a.textContent = videoUrl;
        p.append(a);
        col2.push(p);
      } else {
        col2.push(videoImg);
      }
    }
  }

  const cells = [
    [col1.length > 0 ? col1 : '', col2.length > 0 ? col2 : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
