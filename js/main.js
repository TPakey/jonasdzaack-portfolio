// main.js
// Global motion, loader, page transitions, tilt & text hover effects

(function () {
  // =======================================
  // DOM READY
  // =======================================
  document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('.loader-overlay');
    const progressBar = document.querySelector('.scroll-progress');
    const loadStart = performance.now();
    const MIN_LOADER_TIME = 650; // ms – minimum visible loader time

    // ---------------------------------------
    // Loader hide after window fully loaded
    // ---------------------------------------
    window.addEventListener('load', function () {
      const elapsed = performance.now() - loadStart;
      const delay = Math.max(0, MIN_LOADER_TIME - elapsed);

      setTimeout(function () {
        hideLoader(loader);
      }, delay);
    });

    // Fallback: wenn aus irgendeinem Grund "load" nie fired,
    // nach 3s trotzdem schließen, damit Seite nie hängen bleibt.
    setTimeout(function () {
      if (!loader) return;
      if (!loader.classList.contains('is-hidden')) {
        hideLoader(loader);
      }
    }, 3000);

    // ---------------------------------------
    // Scroll progress bar
    // ---------------------------------------
    function updateScrollProgress() {
      if (!progressBar) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      progressBar.style.transform = 'scaleX(' + progress + ')';
    }

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // ---------------------------------------
    // Page transitions – intercept internal links
    // ---------------------------------------
    setupPageTransitions(loader);

    // ---------------------------------------
    // Tilt effects (VanillaTilt)
    // ---------------------------------------
    setupTilt();

    // ---------------------------------------
    // GSAP animations (hero idle + section reveals)
    // ---------------------------------------
    setupGsapMotion();

    // ---------------------------------------
    // Text hover letter-by-letter
    // ---------------------------------------
    setupTextHoverEffects();
  });

  // =======================================
  // Loader helpers
  // =======================================

  function hideLoader(loader) {
    if (!loader) return;
    if (loader.classList.contains('is-hidden')) return;

    loader.classList.add('is-leaving');
    // Zeit muss zu deiner CSS-Animation passen (exit-duration)
    setTimeout(function () {
      loader.classList.add('is-hidden');
      loader.classList.remove('is-leaving');
      loader.classList.remove('is-active');
    }, 500);
  }

  function showLoader(loader) {
    if (!loader) return;
    loader.classList.remove('is-hidden');
    loader.classList.remove('is-leaving');
    // reflow, damit Transition sauber triggert
    void loader.offsetWidth;
    loader.classList.add('is-active');
  }

  // =======================================
  // Page transitions
  // =======================================

  function setupPageTransitions(loader) {
    const links = document.querySelectorAll('a[href]');
    const currentOrigin = window.location.origin;

    links.forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      // Anker-Links ignorieren
      if (href.startsWith('#')) return;

      // Externe Links ignorieren
      const isAbsolute = /^https?:\/\//i.test(href);
      if (isAbsolute && !href.startsWith(currentOrigin)) return;

      link.addEventListener('click', function (event) {
        // Neue Tabs etc. nicht abfangen
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        event.preventDefault();
        const url = link.href;

        if (!loader) {
          window.location.href = url;
          return;
        }

        showLoader(loader);

        // kurze Curtain-Zeit, bevor wir wirklich navigieren
        setTimeout(function () {
          window.location.href = url;
        }, 450);
      });
    });
  }

  // =======================================
  // Tilt Effects
  // =======================================

  function setupTilt() {
    if (!window.VanillaTilt) return;

    var tiltEls = document.querySelectorAll('.js-tilt');
    if (tiltEls.length) {
      window.VanillaTilt.init(tiltEls, {
        max: 13,
        speed: 800,
        scale: 1.03,
        glare: true,
        'max-glare': 0.18,
      });
    }

    var tiltSmEls = document.querySelectorAll('.js-tilt-sm');
    if (tiltSmEls.length) {
      window.VanillaTilt.init(tiltSmEls, {
        max: 8,
        speed: 600,
        scale: 1.02,
        glare: false,
      });
    }
  }

  // =======================================
  // GSAP + ScrollTrigger
  // =======================================

  function setupGsapMotion() {
    if (!window.gsap) return;

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero idle motion (Home Hero – Focus Head)
    var heroCard = document.querySelector('.hero-portrait-card');
    if (heroCard) {
      gsap.to(heroCard, {
        y: -12,
        duration: 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      var rings = document.querySelectorAll('.hero-bg-ring');
      if (rings.length) {
        gsap.to(rings, {
          scale: 1.08,
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 0.15,
        });
      }
    }

    if (!ScrollTrigger) return;

    // Sections mit .section.reveal leicht einblenden / sliden
    gsap.utils.toArray('.section.reveal').forEach(function (section) {
      var yOffset = section.classList.contains('section-alt') ? 40 : 60;

      gsap.from(section, {
        opacity: 0,
        y: yOffset,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Cards / Rows im Inneren: kleine Stagger-Animation
      var cards = section.querySelectorAll(
        '.project-card, .season-row, .highlight-card, .card, .onoff-card, .hero-portrait-card'
      );

      if (cards.length) {
        gsap.from(cards, {
          opacity: 0,
          y: 30,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });
  }

  // =======================================
  // Text Hover Letter-by-Letter
  // =======================================

  function setupTextHoverEffects() {
    // Ziel-Elemente: Nav, Buttons, Logo-Text, große Hero-Headline
    var targets = document.querySelectorAll(
      '.nav a, .btn, .logo-text, .hero-title'
    );

    targets.forEach(function (el) {
      // Bereits gesplittet?
      if (el.dataset.split === 'chars') return;

      var text = el.textContent;
      if (!text || !text.trim()) return;

      // Inhalt leeren & in Spans pro Zeichen aufteilen
      el.textContent = '';
      el.classList.add('hover-split');

      var chars = [];
      for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = text[i];

        if (text[i] === ' ') {
          span.classList.add('char-space');
        }

        el.appendChild(span);
        chars.push(span);
      }

      el.dataset.split = 'chars';

      // Hover-Animation: Buchstaben mit kleinem Delay nach oben schieben
      el.addEventListener('mouseenter', function () {
        chars.forEach(function (char, index) {
          char.style.transitionDelay = index * 0.02 + 's';
          char.style.transform = 'translateY(-100%)';
        });
      });

      el.addEventListener('mouseleave', function () {
        chars.forEach(function (char, index) {
          char.style.transitionDelay = index * 0.015 + 's';
          char.style.transform = 'translateY(0)';
        });
      });
    });
  }
})();

function initHeroParallax() {
  const stack = document.querySelector("[data-hero-parallax]");
  if (!stack) return;

  const strength = 10; // max. Rotation in Grad

  function handleMove(e) {
    const rect = stack.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateX = y * -strength;
    const rotateY = x * strength;

    stack.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, 0)`;
  }

  function reset() {
    stack.style.transform = "rotateX(0deg) rotateY(0deg) translate3d(0,0,0)";
  }

  stack.addEventListener("pointermove", handleMove);
  stack.addEventListener("pointerleave", reset);
}

document.addEventListener("DOMContentLoaded", () => {
  // ...hier deine bisherigen Inits...
  initHeroParallax();
});
