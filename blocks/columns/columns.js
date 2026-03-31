import { getBlockId } from '../../scripts/scripts.js';

const VIDEO_HOSTS = [
  'play.vidyard.com',
  'youtube.com',
  'youtu.be',
  'www.youtube.com',
  'vimeo.com',
  'player.vimeo.com',
  'wistia.com',
  'fast.wistia.com',
];

/**
 * Converts a video page URL into an embeddable URL.
 * Supports YouTube, Vimeo, Vidyard, Wistia, and falls back to the original URL.
 */
function getYouTubeEmbedUrl(hostname, pathname, searchParams) {
  if (hostname.includes('youtube.com') && searchParams.get('v')) {
    return `https://www.youtube.com/embed/${searchParams.get('v')}?autoplay=1`;
  }
  if (hostname === 'youtu.be') {
    return `https://www.youtube.com/embed${pathname}?autoplay=1`;
  }
  return null;
}

function getVimeoEmbedUrl(hostname, pathname, url) {
  if (hostname === 'vimeo.com' && /^\/\d+/.test(pathname)) {
    return `https://player.vimeo.com/video${pathname}?autoplay=1`;
  }
  if (hostname === 'player.vimeo.com') {
    return `${url}${url.includes('?') ? '&' : '?'}autoplay=1`;
  }
  return null;
}

function getVidyardEmbedUrl(hostname, pathname) {
  if (hostname !== 'play.vidyard.com') return null;
  const raw = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const dotIdx = raw.indexOf('.');
  const id = dotIdx === -1 ? raw : raw.slice(0, dotIdx);
  return `https://play.vidyard.com/${id}?autoplay=1`;
}

function getWistiaEmbedUrl(hostname, pathname) {
  if (!hostname.includes('wistia.com')) return null;
  const match = pathname.match(/medias\/([a-zA-Z0-9]+)/);
  return match ? `https://fast.wistia.net/embed/iframe/${match[1]}?autoPlay=true` : null;
}

function getEmbedUrl(url) {
  try {
    const u = new URL(url);
    const { hostname, pathname, searchParams } = u;

    const youtube = getYouTubeEmbedUrl(hostname, pathname, searchParams);
    if (youtube) return youtube;

    const vimeo = getVimeoEmbedUrl(hostname, pathname, url);
    if (vimeo) return vimeo;

    const vidyard = getVidyardEmbedUrl(hostname, pathname);
    if (vidyard) return vidyard;

    const wistia = getWistiaEmbedUrl(hostname, pathname);
    if (wistia) return wistia;

    // Fallback: use URL as-is (author-provided embed URL)
    return url;
  } catch {
    return url;
  }
}

function openLightbox(videoUrl) {
  const overlay = document.createElement('div');
  overlay.classList.add('columns-lightbox');

  const content = document.createElement('div');
  content.classList.add('columns-lightbox-content');

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('columns-lightbox-close');
  closeBtn.setAttribute('aria-label', 'Close video');
  closeBtn.textContent = '\u00d7';

  const iframe = document.createElement('iframe');
  iframe.src = getEmbedUrl(videoUrl);
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('loading', 'lazy');

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
      // Detect a video link (any supported video host)
      const videoLink = col.querySelector(VIDEO_HOSTS.map((h) => `a[href*="${h}"]`).join(','));
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
