import { getBlockId } from '../../scripts/scripts.js';

function getVidyardId(src) {
  const match = src.match(/play\.vidyard\.com\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function openLightbox(videoId) {
  const overlay = document.createElement('div');
  overlay.classList.add('columns-lightbox');

  const content = document.createElement('div');
  content.classList.add('columns-lightbox-content');

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('columns-lightbox-close');
  closeBtn.setAttribute('aria-label', 'Close video');
  closeBtn.textContent = '\u00d7';

  const iframe = document.createElement('iframe');
  iframe.src = `https://play.vidyard.com/${videoId}.html?v=4.2&type=inline&autoplay=1`;
  iframe.setAttribute('allow', 'autoplay; fullscreen');
  iframe.setAttribute('allowfullscreen', '');

  content.append(closeBtn, iframe);
  overlay.append(content);
  document.body.append(overlay);

  const close = () => overlay.remove();
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handler);
    }
  });
}

export default function decorate(block) {
  const blockId = getBlockId('columns');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `columns-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Columns');

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const img = col.querySelector('img');

      if (pic || img) {
        if (!col.querySelector('h1, h2, h3, h4, h5, h6')) {
          col.classList.add('columns-img-col');
        }

        const imgEl = pic ? pic.querySelector('img') : img;
        if (imgEl) {
          const videoId = getVidyardId(imgEl.src);
          if (videoId) {
            const playBtn = document.createElement('button');
            playBtn.classList.add('columns-play-btn');
            playBtn.setAttribute('aria-label', 'Play video');
            col.append(playBtn);
            col.addEventListener('click', () => openLightbox(videoId));
          }
        }
      }
    });
  });
}
