import { getBlockId } from '../../scripts/scripts.js';

function getVidyardId(url) {
  const match = url.match(/play\.vidyard\.com\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

function loadVidyardApi() {
  if (window.VidyardV4) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://play.vidyard.com/embed/v4.js';
    script.async = true;
    script.onload = resolve;
    document.head.append(script);
  });
}

function openLightbox(videoUrl) {
  const videoId = getVidyardId(videoUrl);
  if (!videoId) return;

  const overlay = document.createElement('div');
  overlay.classList.add('columns-lightbox');

  const content = document.createElement('div');
  content.classList.add('columns-lightbox-content');

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('columns-lightbox-close');
  closeBtn.setAttribute('aria-label', 'Close video');
  closeBtn.textContent = '\u00d7';

  const player = document.createElement('div');
  player.classList.add('columns-lightbox-player');

  const embed = document.createElement('img');
  embed.src = `https://play.vidyard.com/${videoId}.jpg`;
  embed.className = 'vidyard-player-embed';
  embed.dataset.uuid = videoId;
  embed.dataset.v = '4';
  embed.dataset.type = 'inline';
  embed.dataset.autoplay = '1';
  player.append(embed);

  content.append(closeBtn, player);
  overlay.append(content);
  document.body.append(overlay);

  loadVidyardApi().then(() => {
    if (window.VidyardV4) window.VidyardV4.api.renderDOMPlayers();
  });

  const close = () => {
    if (window.VidyardV4) {
      const players = window.VidyardV4.api.getPlayersByUUID(videoId);
      if (players && players.length) players[0].pause();
    }
    overlay.remove();
  };
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

/**
 * Decorates a column that contains a video link.
 * Content-driven: uses author-provided image as thumbnail.
 * The video URL is read from the authored link, stored as a data attribute,
 * then the link paragraph is removed from the rendered DOM.
 * Authors edit the thumbnail image and video URL in the source document.
 */
function setupVideoColumn(col, videoLink) {
  col.classList.add('columns-img-col');

  // Store video URL as data attribute, then remove the link from rendered DOM
  col.dataset.videoUrl = videoLink.href;
  const linkP = videoLink.closest('p');
  if (linkP) linkP.remove();

  // Add play button overlay
  const playBtn = document.createElement('button');
  playBtn.classList.add('columns-play-btn');
  playBtn.setAttribute('aria-label', 'Play video');
  col.append(playBtn);

  col.addEventListener('click', () => openLightbox(col.dataset.videoUrl));
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
      // Detect a video link (author-editable URL)
      const videoLink = col.querySelector('a[href*="play.vidyard.com"]');
      if (videoLink) {
        setupVideoColumn(col, videoLink);
        return;
      }

      // Image-only column (no heading = image column)
      const pic = col.querySelector('picture');
      const img = col.querySelector('img');
      if ((pic || img) && !col.querySelector('h1, h2, h3, h4, h5, h6')) {
        col.classList.add('columns-img-col');
      }
    });
  });
}
