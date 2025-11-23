// Shared interactions across all pages
const currentPage = document.body.dataset.page;
const navLinks = document.querySelectorAll('[data-page-link]');
navLinks.forEach((link) => {
  if (link.dataset.pageLink === currentPage) {
    link.classList.add('is-active');
  }
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
