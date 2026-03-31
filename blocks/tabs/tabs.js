// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';

function switchTab(block, tablist, index) {
  block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
    panel.setAttribute('aria-hidden', true);
  });
  tablist.querySelectorAll('button').forEach((btn) => {
    btn.setAttribute('aria-selected', false);
  });
  const buttons = tablist.querySelectorAll('button');
  const panels = block.querySelectorAll('[role=tabpanel]');
  if (buttons[index]) buttons[index].setAttribute('aria-selected', true);
  if (panels[index]) panels[index].setAttribute('aria-hidden', false);
}

export default async function decorate(block) {
  const blockId = getBlockId('tabs');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `tabs-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Tabs');

  // Look for a heading in the section above the tabs block
  const section = block.closest('.section');
  const sectionHeading = section
    ? section.querySelector(':scope > .default-content-wrapper h3') : null;

  // Build header container: heading | tabs (inline)
  const header = document.createElement('div');
  header.className = 'tabs-header';

  // If there's a section heading, move it into the header row
  if (sectionHeading) {
    sectionHeading.className = 'tabs-heading';
    header.append(sectionHeading);
  }

  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tablist-${blockId}`;

  // the first cell of each row is the title of the tab
  const rows = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0);

  const tabHeadings = rows.map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = `tabpanel-${blockId}-tab-${i + 1}`;

    // decorate tabpanel
    const tabpanel = rows[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // classify remaining columns (after removing tab heading)
    const cols = [...tabpanel.children];
    cols.forEach((col) => {
      if (col === tab) return;
      const img = col.querySelector('picture, img');
      const hasHeading = col.querySelector('h1, h2, h3, h4, h5, h6');
      if (img && !hasHeading) {
        col.classList.add('tabs-img-col');
        // set image as panel background for desktop layout
        const imgEl = img.tagName === 'IMG' ? img : img.querySelector('img');
        if (imgEl) tabpanel.style.backgroundImage = `url(${imgEl.src})`;
      } else {
        col.classList.add('tabs-text-col');
      }
    });

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.textContent = tab.textContent;
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      switchTab(block, tablist, i);
    });

    tablist.append(button);

    // remove the tab heading cell from the panel
    tab.remove();

    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }
  });

  header.append(tablist);
  block.prepend(header);

  // Build prev/next navigation — placed after panels (bottom-left)
  const nav = document.createElement('div');
  nav.className = 'tabs-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'tabs-nav-prev';
  prevBtn.setAttribute('aria-label', 'Previous tab');
  prevBtn.setAttribute('type', 'button');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'tabs-nav-next';
  nextBtn.setAttribute('aria-label', 'Next tab');
  nextBtn.setAttribute('type', 'button');

  prevBtn.addEventListener('click', () => {
    const current = tablist.querySelector('[aria-selected="true"]');
    const buttons = [...tablist.querySelectorAll('button')];
    const idx = buttons.indexOf(current);
    const prev = idx > 0 ? idx - 1 : buttons.length - 1;
    switchTab(block, tablist, prev);
  });

  nextBtn.addEventListener('click', () => {
    const current = tablist.querySelector('[aria-selected="true"]');
    const buttons = [...tablist.querySelectorAll('button')];
    const idx = buttons.indexOf(current);
    const next = idx < buttons.length - 1 ? idx + 1 : 0;
    switchTab(block, tablist, next);
  });

  nav.append(prevBtn, nextBtn);
  block.append(nav);
}
