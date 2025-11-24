const currentPage = document.body.dataset.page;
const navLinks = document.querySelectorAll('[data-page-link]');
navLinks.forEach((link) => {
  if (link.dataset.pageLink === currentPage) {
    link.classList.add('is-active');
  }
});

// Lightweight loader
const loader = document.querySelector('.loader-overlay');
window.addEventListener('load', () => {
  window.setTimeout(() => {
    loader?.classList.add('hidden');
  }, 180);
});

// Smooth scroll for anchors
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
