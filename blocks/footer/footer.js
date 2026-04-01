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

  const sections = footer.querySelectorAll('.section');

  // Section 1: Link columns (h5 + ul pairs)
  const columnsSection = sections[0];
  if (columnsSection) {
    const wrapper = columnsSection.querySelector('.default-content-wrapper');
    if (wrapper) {
      const columns = document.createElement('div');
      columns.className = 'footer-columns';

      const headings = wrapper.querySelectorAll('h5');
      headings.forEach((h5) => {
        const col = document.createElement('div');
        col.className = 'footer-column';
        const heading = h5.cloneNode(true);
        col.append(heading);

        const next = h5.nextElementSibling;
        if (next && next.tagName === 'UL') {
          col.append(next.cloneNode(true));
        }
        columns.append(col);
      });

      wrapper.textContent = '';
      wrapper.append(columns);
    }
  }

  // Section 2: Social icons
  const socialSection = sections[1];
  if (socialSection) {
    const wrapper = socialSection.querySelector('.default-content-wrapper');
    if (wrapper) {
      const socialP = wrapper.querySelector('p');
      const socialRow = document.createElement('div');
      socialRow.className = 'footer-social';
      if (socialP) socialRow.append(socialP.cloneNode(true));

      wrapper.textContent = '';
      wrapper.append(socialRow);
    }
  }

  // Section 3: Copyright
  const copyrightSection = sections[2];
  if (copyrightSection) {
    const wrapper = copyrightSection.querySelector('.default-content-wrapper');
    if (wrapper) {
      const copyrightP = wrapper.querySelector('p');
      const copyrightRow = document.createElement('div');
      copyrightRow.className = 'footer-copyright';
      if (copyrightP) {
        const clone = copyrightP.cloneNode(true);
        const year = new Date().getFullYear();
        clone.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = node.textContent.replace(/©\s*\d{4}/, `© ${year}`);
          }
        });
        copyrightRow.append(clone);
      }

      wrapper.textContent = '';
      wrapper.append(copyrightRow);
    }
  }

  block.append(footer);
}
