import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';
import { createSliderControls, initSlider, showSlide } from '../../scripts/slider.js';

export { showSlide };

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  // Handle dual images: if image column has 2+ images,
  // first = slide background, remaining = foreground image(s)
  const imageCol = slide.querySelector('.carousel-slide-image');
  if (imageCol) {
    const imgs = imageCol.querySelectorAll('img');
    if (imgs.length >= 2) {
      const bgImg = imgs[0];
      const bgSrc = bgImg.currentSrc || bgImg.src;
      slide.classList.add('has-bg-image');
      slide.style.backgroundImage = `url('${bgSrc}')`;
      slide.style.backgroundSize = 'cover';
      slide.style.backgroundPosition = 'center';
      const bgPicture = bgImg.closest('picture') || bgImg;
      const bgParent = bgPicture.parentElement;
      bgPicture.remove();
      if (bgParent && bgParent !== imageCol && !bgParent.children.length) {
        bgParent.remove();
      }
    }
  }

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

const AUTOPLAY_INTERVAL = 5000;

function startAutoplay(block) {
  let timer = null;

  const advance = () => {
    const current = parseInt(block.dataset.activeSlide, 10) || 0;
    showSlide(block, current + 1, 'auto');
  };

  const start = () => {
    if (!timer) timer = setInterval(advance, AUTOPLAY_INTERVAL);
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  const reset = () => {
    stop();
    start();
  };

  // Pause on hover
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);

  // Reset timer on manual interaction
  block.addEventListener('click', (e) => {
    if (e.target.closest('button')) reset();
  });

  // Pause when page hidden or carousel out of viewport
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start(); else stop();
  }, { threshold: 0.5 });
  observer.observe(block);
}

export default async function decorate(block) {
  const blockId = getBlockId('carousel');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `carousel-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  slidesWrapper.setAttribute('tabindex', '0');
  slidesWrapper.setAttribute('aria-label', 'Carousel slides');
  block.prepend(slidesWrapper);

  if (!isSingleSlide) {
    const { indicatorsNav, buttonsContainer } = createSliderControls(rows.length);
    block.append(indicatorsNav);
    container.append(buttonsContainer);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, blockId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    initSlider(block);
    slidesWrapper.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const current = parseInt(block.dataset.activeSlide, 10) || 0;
      const next = e.key === 'ArrowLeft' ? current - 1 : current + 1;
      e.preventDefault();
      showSlide(block, next, 'auto');
    });
    startAutoplay(block);
  }
}
