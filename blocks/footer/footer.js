import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function decorateColumnsWrapper(wrapper) {
  const columns = document.createElement('div');
  columns.className = 'footer-columns';

  const headings = wrapper.querySelectorAll('h5');
  headings.forEach((h5) => {
    const col = document.createElement('div');
    col.className = 'footer-column';
    col.append(h5.cloneNode(true));

    const next = h5.nextElementSibling;
    if (next?.tagName === 'UL') {
      col.append(next.cloneNode(true));
    }
    columns.append(col);
  });

  wrapper.textContent = '';
  wrapper.append(columns);
}

function decorateSocialWrapper(wrapper) {
  const socialP = wrapper.querySelector('p');
  const socialRow = document.createElement('div');
  socialRow.className = 'footer-social';
  if (socialP) socialRow.append(socialP.cloneNode(true));

  wrapper.textContent = '';
  wrapper.append(socialRow);
}

function updateCopyrightYearText(clone) {
  const year = new Date().getFullYear();
  clone.childNodes.forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE) return;
    node.textContent = node.textContent.replace(/©\s*\d{4}/, `© ${year}`);
  });
}

function decorateCopyrightWrapper(wrapper) {
  const copyrightP = wrapper.querySelector('p');
  const copyrightRow = document.createElement('div');
  copyrightRow.className = 'footer-copyright';
  if (copyrightP) {
    const clone = copyrightP.cloneNode(true);
    updateCopyrightYearText(clone);
    copyrightRow.append(clone);
  }

  wrapper.textContent = '';
  wrapper.append(copyrightRow);
}

/**
 * @param {Element | undefined} section
 * @param {(wrapper: Element) => void} decorateWrapper
 */
function decorateFooterSection(section, decorateWrapper) {
  const wrapper = section?.querySelector('.default-content-wrapper');
  if (!wrapper) return;
  decorateWrapper(wrapper);
}

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

  decorateFooterSection(sections[0], decorateColumnsWrapper);
  decorateFooterSection(sections[1], decorateSocialWrapper);
  decorateFooterSection(sections[2], decorateCopyrightWrapper);

  block.append(footer);
}
