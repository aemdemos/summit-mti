import { getBlockId } from '../../scripts/scripts.js';
import { createCard } from '../card/card.js';

export default function decorate(block) {
  const blockId = getBlockId('cards');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `Cards for ${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Cards');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = createCard(row);

    // Skip empty cards (no image and no text content)
    const imgDiv = li.querySelector('.cards-card-image');
    const img = imgDiv?.querySelector('img');
    const hasText = li.textContent.trim().length > 0;
    if (!img && !hasText) return;

    // Use the image as CSS background-image on the card for consistent sizing
    if (img) {
      li.style.backgroundImage = `url('${img.src}')`;
      imgDiv.remove();
    }

    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
