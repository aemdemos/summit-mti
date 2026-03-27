import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.classList.contains('nav-drop');
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
  // hide overlay when collapsing all sections
  const overlay = document.querySelector('.nav-overlay');
  if (overlay && !expanded) {
    overlay.classList.remove('nav-overlay-active');
  }
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

const MAX_BREADCRUMB_DEPTH = 20;

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    let depth = 0;
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
      depth += 1;
    } while (menuItem && depth < MAX_BREADCRUMB_DEPTH);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  crumbs.unshift({ title: 'Home', url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs.at(-1).url = null;
  }
  crumbs.at(-1)['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * Detects mega menu items and adds appropriate classes.
 * A nav-drop is a mega menu if its child <ul> contains <li> with
 * nested <ul> (3+ levels of nesting indicating category groups).
 * @param {Element} navSections The nav sections element
 */
function decorateMegaMenu(navSections) {
  navSections.querySelectorAll('.nav-drop').forEach((navDrop) => {
    const childUl = navDrop.querySelector(':scope > ul');
    if (!childUl) return;
    // Check for deeply nested content (li > strong + ul pattern = category groups)
    const hasCategories = childUl.querySelector(':scope > li > ul');
    if (hasCategories) {
      navDrop.classList.add('nav-mega');
      // Mark italic items as sub-headers (e.g. "BY TYPE", "BY MARKET")
      // Support both li > em (local) and li > p > em (DA)
      childUl.querySelectorAll(':scope > li > em, :scope > li > p > em').forEach((em) => {
        em.closest('li').classList.add('mega-sub-header');
      });
      // Mark bold items that have child <ul> as category columns
      // Support both li > strong (local) and li > p > strong (DA)
      childUl.querySelectorAll(':scope > li > strong, :scope > li > p > strong').forEach((strong) => {
        const li = strong.closest('li');
        if (li.querySelector(':scope > ul')) {
          li.classList.add('mega-category');
        }
      });
      // Mark headingless items that have child <ul> as continuation columns
      // This allows authors to split a long list into multiple columns by
      // creating a new list item with nested links but no bold heading
      childUl.querySelectorAll(':scope > li').forEach((li) => {
        if (li.classList.length > 0) return; // already classified
        if (li.querySelector(':scope > ul') && !li.querySelector(':scope > strong, :scope > p > strong')) {
          li.classList.add('mega-category');
        }
      });
      // Mark categories with many items for potential multi-column layout
      childUl.querySelectorAll('.mega-category > ul').forEach((catUl) => {
        if (catUl.children.length >= 6) {
          catUl.closest('.mega-category').classList.add('mega-wide');
        }
      });
      // Mark direct links at the same level as market links
      // Support both li > a (local) and li > p > a (DA)
      childUl.querySelectorAll(':scope > li > a, :scope > li > p > a').forEach((a) => {
        const li = a.closest('li');
        if (!li.classList.contains('mega-category') && !li.classList.contains('mega-sub-header')) {
          li.classList.add('mega-market-link');
        }
      });

      // Detect promo card items (li with picture in mega menu)
      childUl.querySelectorAll(':scope > li').forEach((li) => {
        const pic = li.querySelector('picture');
        if (pic) {
          li.classList.remove('mega-market-link');
          li.classList.add('mega-promo');
          // Use the picture's img src as background image
          const img = pic.querySelector('img');
          if (img) {
            li.style.backgroundImage = `url('${img.src}')`;
          }
          pic.remove();
          // Style the CTA link as a button
          const ctaLink = li.querySelector(':scope > a, :scope > p > a');
          if (ctaLink) {
            ctaLink.classList.add('mega-promo-cta');
          }
          // Wrap remaining text nodes and strong in a container
          const textWrapper = document.createElement('div');
          textWrapper.classList.add('mega-promo-text');
          [...li.childNodes].forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE
              || (node.nodeType === Node.ELEMENT_NODE
                && node.tagName !== 'A'
                && !node.classList.contains('mega-promo-cta'))) {
              textWrapper.append(node);
            }
          });
          li.prepend(textWrapper);
          // Mark parent mega menu as having promo for CSS padding
          navDrop.classList.add('has-mega-promo');
        }
      });
    }
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', (e) => {
        if (isDesktop.matches) {
          // Prevent click on links inside mega menu from toggling
          if (e.target.closest('a') && e.target.closest('.nav-mega > ul')) return;
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          // Show/hide overlay for mega menu
          const overlay = document.querySelector('.nav-overlay');
          if (overlay && navSection.classList.contains('nav-mega')) {
            overlay.classList.toggle('nav-overlay-active', !expanded);
          }
        }
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button')?.classList.remove('button');
    });
    // Decorate mega menu structure
    decorateMegaMenu(navSections);
  }

  // Decorate icons in nav tools
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    // Convert icon images (local <img> or DA <picture>) to icon spans
    // Icon name is derived from alt text, so authors control icons via the document
    navTools.querySelectorAll('picture, img').forEach((el) => {
      const img = el.tagName === 'PICTURE' ? el.querySelector('img') : el;
      if (!img) return;
      const alt = img.getAttribute('alt');
      if (alt) {
        const span = document.createElement('span');
        span.className = `icon icon-${alt}`;
        (el.tagName === 'PICTURE' ? el : img).replaceWith(span);
      }
    });
    decorateIcons(navTools);
    // Remove button classes from tools
    navTools.querySelectorAll('.button-container').forEach((bc) => {
      bc.classList.remove('button-container');
      bc.querySelector('.button')?.classList.remove('button');
    });
    // Build language selector dropdown from globe icon with nested links
    const globeLi = navTools.querySelector('.icon-globe')?.closest('li');
    const langUl = globeLi?.querySelector(':scope > ul');
    if (globeLi && langUl) {
      globeLi.classList.add('nav-lang-selector');
      // Mark the current language as active
      const currentUrl = window.location.origin;
      langUl.querySelectorAll('a').forEach((a) => {
        const linkUrl = new URL(a.href, window.location.origin).origin;
        if (linkUrl === currentUrl) {
          a.closest('li').classList.add('nav-lang-active');
        }
      });
      // Toggle dropdown on click
      globeLi.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // let link clicks navigate
        e.stopPropagation();
        const isOpen = globeLi.classList.toggle('nav-lang-open');
        if (isOpen) {
          // Close on outside click
          const closeHandler = (ev) => {
            if (!globeLi.contains(ev.target)) {
              globeLi.classList.remove('nav-lang-open');
              document.removeEventListener('click', closeHandler);
            }
          };
          document.addEventListener('click', closeHandler);
        }
      });
    }
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Create overlay for mega menu backdrop
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => {
    toggleAllNavSections(navSections, false);
    overlay.classList.remove('nav-overlay-active');
  });
  block.append(overlay);

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
