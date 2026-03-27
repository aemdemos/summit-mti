import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Build structured footer from content
  const section = footer.querySelector('.section');
  if (section) {
    const wrapper = section.querySelector('.default-content-wrapper');
    if (wrapper) {
      // Build link columns from h5 + ul pairs
      const columns = document.createElement('div');
      columns.className = 'footer-columns';

      const headings = wrapper.querySelectorAll('h5');
      headings.forEach((h5) => {
        const col = document.createElement('div');
        col.className = 'footer-column';
        const heading = h5.cloneNode(true);
        col.append(heading);

        // Get the ul that follows this h5
        const next = h5.nextElementSibling;
        if (next && next.tagName === 'UL') {
          col.append(next.cloneNode(true));
        }
        columns.append(col);
      });

      // Build social links row
      const socialP = wrapper.querySelector('p.social-links');
      const socialRow = document.createElement('div');
      socialRow.className = 'footer-social';
      if (socialP) {
        socialRow.append(socialP.cloneNode(true));
      }

      // Build copyright row
      const copyrightP = wrapper.querySelector('p.copyright');
      const copyrightRow = document.createElement('div');
      copyrightRow.className = 'footer-copyright';
      if (copyrightP) {
        copyrightRow.append(copyrightP.cloneNode(true));
      }

      // Replace section content with structured footer
      wrapper.textContent = '';
      wrapper.append(columns, socialRow, copyrightRow);
    }
  }

  block.append(footer);
}
