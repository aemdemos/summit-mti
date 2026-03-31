/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Marvell site cleanup.
 * Removes non-authorable content from marvell.com pages.
 * All selectors from captured DOM (migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove modal overlays that block parsing
    // Found: <div class="container youtube"> (line 2) with #featurenews-video-model modal
    WebImporter.DOMUtils.remove(element, [
      '.container.youtube',
      '#featurenews-video-model',
    ]);

    // Remove inline CSS injection divs
    // Found: <div class="addinlinecss ..."> (lines 1128-1136)
    WebImporter.DOMUtils.remove(element, ['.addinlinecss']);

    // Remove OneTrust/cookie consent if present
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '[class*="ot-sdk"]',
      '[class*="cookie"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove navigation header
    // Found: <header class="mrvll-navigation"> (line 61)
    // and parent: <div class="header ..."> (line 60)
    WebImporter.DOMUtils.remove(element, [
      'header.mrvll-navigation',
      '.header.aem-GridColumn',
    ]);

    // Remove footer
    // Found: <div class="footer ..."> (line 1139) containing <div class="mrvll-footer">
    WebImporter.DOMUtils.remove(element, [
      '.footer.aem-GridColumn',
      '.mrvll-footer',
    ]);

    // Remove search overlay
    // Found: <div id="searchboxContainer" ...> (line 131)
    WebImporter.DOMUtils.remove(element, ['#searchboxContainer']);

    // Remove non-content elements
    WebImporter.DOMUtils.remove(element, [
      'link',
      'noscript',
      'iframe',
    ]);

    // Clean tracking/interaction attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
      el.removeAttribute('data-cmp-hook-carousel');
    });
  }
}
