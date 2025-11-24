// Shared interactions across all pages
const currentPage = document.body.dataset.page;
const navLinks = document.querySelectorAll('[data-page-link]');
navLinks.forEach((link) => {
  if (link.dataset.pageLink === currentPage) {
    link.classList.add('is-active');
  }
});

// Lightweight loader + page transition
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const pageTransition = (() => {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  overlay.dataset.state = prefersReducedMotion ? 'hidden' : 'loading';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="transition-backdrop"></div>
    <div class="transition-art">
      <div class="sky-halo"></div>
      <div class="helmet-visor"></div>
    </div>
    <div class="transition-glow"></div>
  `;
  document.body.appendChild(overlay);

  const transitionDuration = 650;

  const enterPage = () => {
    if (prefersReducedMotion) return;
    requestAnimationFrame(() => {
      overlay.dataset.state = 'hidden';
    });
  };

  const navigate = (url) => {
    if (!url || prefersReducedMotion) {
      window.location.href = url;
      return;
    }

    overlay.dataset.state = 'navigating';

    window.setTimeout(() => {
      window.location.href = url;
    }, transitionDuration);
  };

  return { enterPage, navigate, overlay };
})();

window.addEventListener('load', pageTransition.enterPage);

const transitionLinks = document.querySelectorAll('a[href$=".html"], a[data-transition-link]');

transitionLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');

    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      link.target === '_blank' ||
      href === window.location.pathname.split('/').pop()
    ) {
      return;
    }

    event.preventDefault();
    pageTransition.navigate(href);
  });
});

// Smooth scroll for in-page anchors
const internalLinks = document.querySelectorAll('a[href^="#"]');
internalLinks.forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Small utility: animate cards on hover for pointer devices
const cards = document.querySelectorAll('.card');
cards.forEach((card) => {
  card.addEventListener('pointerenter', () => {
    card.style.transform = 'translateY(-2px)';
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});
