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

function openLightbox(videoId) {
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

function setupVideoColumn(col, videoId) {
  col.classList.add('columns-img-col');

  const img = document.createElement('img');
  img.src = `https://play.vidyard.com/${videoId}.jpg`;
  img.alt = '';

  const p = document.createElement('p');
  p.append(img);
  col.replaceChildren(p);

  const playBtn = document.createElement('button');
  playBtn.classList.add('columns-play-btn');
  playBtn.setAttribute('aria-label', 'Play video');
  col.append(playBtn);
  col.addEventListener('click', () => openLightbox(videoId));
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
      // Check for author-editable video link
      const videoLink = col.querySelector('a[href*="play.vidyard.com"]');
      if (videoLink) {
        const videoId = getVidyardId(videoLink.href);
        if (videoId) {
          setupVideoColumn(col, videoId);
          return;
        }
      }

      // Fallback: detect Vidyard thumbnail in image src
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
