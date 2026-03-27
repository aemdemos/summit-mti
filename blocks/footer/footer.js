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

      // Find social links row (paragraph containing icon spans)
      const allPs = wrapper.querySelectorAll('p');
      const socialP = [...allPs].find((p) => p.querySelector('.icon'));
      const socialRow = document.createElement('div');
      socialRow.className = 'footer-social';
      if (socialP) {
        socialRow.append(socialP.cloneNode(true));
      }

      // Find copyright row (paragraph containing "Copyright")
      const copyrightP = [...allPs].find((p) => p.textContent.includes('Copyright'));
      const copyrightRow = document.createElement('div');
      copyrightRow.className = 'footer-copyright';
      if (copyrightP) {
        const clone = copyrightP.cloneNode(true);
        // Update copyright year dynamically
        const year = new Date().getFullYear();
        clone.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = node.textContent.replace(/©\s*\d{4}/, `© ${year}`);
          }
        });
        copyrightRow.append(clone);
      }

      // Replace section content with structured footer
      wrapper.textContent = '';
      wrapper.append(columns, socialRow, copyrightRow);
    }
  }

  block.append(footer);
}
