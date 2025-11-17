// main.js
// Loader, Page Transitions, Tilt, GSAP, Text Hover, Smooth Scroll

(function () {
  // =======================================
  // DOM READY
  // =======================================
  document.addEventListener('DOMContentLoaded', function () {
    const loader = document.querySelector('.loader-overlay');
    const progressBar = document.querySelector('.scroll-progress');
    const loadStart = performance.now();
    const MIN_LOADER_TIME = 650; // ms – Loader soll min. so lange sichtbar bleiben

    // ---------------------------------------
    // Loader ausblenden, wenn alles geladen
    // ---------------------------------------
    window.addEventListener('load', function () {
      const elapsed = performance.now() - loadStart;
      const delay = Math.max(0, MIN_LOADER_TIME - elapsed);

      setTimeout(function () {
        hideLoader(loader);
      }, delay);
    });

    // Fallback: falls "load" aus irgendeinem Grund nie feuert
    setTimeout(function () {
      if (!loader) return;
      if (!loader.classList.contains('is-hidden')) {
        hideLoader(loader);
      }
    }, 3000);

    // ---------------------------------------
    // Scroll-Progress-Bar
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
    // Smooth Scroll mit Lenis
    // ---------------------------------------
    setupLenis();

    // ---------------------------------------
    // Page transitions – interne Links abfangen
    // ---------------------------------------
    setupPageTransitions(loader);

    // ---------------------------------------
    // Tilt effects (VanillaTilt)
    // ---------------------------------------
    setupTilt();

    // ---------------------------------------
    // GSAP animations (Hero idle + Section reveals)
    // ---------------------------------------
    setupGsapMotion();

    // ---------------------------------------
    // Text Hover letter-by-letter
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
    // muss zu deiner CSS-Transition passen
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
    // reflow, damit Transition sicher triggert
    void loader.offsetWidth;
    loader.classList.add('is-active');
  }

  // =======================================
  // Smooth Scroll (Lenis)
  // =======================================

  function setupLenis() {
    if (!window.Lenis) return;

    const lenis = new window.Lenis({
      duration: 1.1,
      smoothWheel: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
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

      // Anker-Links oder spezielle Protokolle ignorieren
      if (href.startsWith('#')) return;

      var url;
      try {
        url = new URL(href, window.location.href);
      } catch (error) {
        return; // ungültige URL – nichts tun
      }

      // Protokolle wie mailto:, tel:, ftp:, blob:, data:, javascript: etc. überspringen
      var protocol = url.protocol;
      var isHttp = protocol === 'http:' || protocol === 'https:';
      if (!isHttp) return;

      // Externe Links oder explizite Ausnahmen ignorieren
      var isExternal = url.origin !== currentOrigin;
      if (isExternal) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;
      if (link.getAttribute('rel') && link.getAttribute('rel').includes('external'))
        return;

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
        const urlToOpen = url.toString();

        if (!loader) {
          window.location.href = urlToOpen;
          return;
        }

        showLoader(loader);

        // kurze Curtain-Zeit, bevor wir wirklich navigieren
        setTimeout(function () {
          window.location.href = urlToOpen;
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

    // Hero idle motion – kleine „float“ Animation
    var heroCard = document.querySelector('.hero-portrait-card');
    if (heroCard && gsap) {
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
        '.project-card, .season-row, .highlight-card, .card, .onoff-card, .hero-portrait-card, .stat-card'
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
    // Ziel-Elemente: Nav, Buttons, Logo-Text, große Headlines
    var targets = document.querySelectorAll(
      '.nav a, .btn, .logo-text, .hero-title, .ontrack-hero-title, .offtrack-hero-title'
    );

    if (!targets.length) return;

    targets.forEach(function (el) {
      var text = el.textContent.trim();
      if (!text) return;

      el.classList.add('js-letter-hover');
      el.setAttribute('data-label', text);

      // Zeichen in Spans wrappen
      el.innerHTML = '';
      var spanWrap = document.createElement('span');
      spanWrap.className = 'letter-row';
      Array.from(text).forEach(function (ch, index) {
        var span = document.createElement('span');
        span.className = 'letter';
        span.textContent = ch;
        span.style.transitionDelay = (index * 0.018).toFixed(3) + 's';
        spanWrap.appendChild(span);
      });
      el.appendChild(spanWrap);

      el.addEventListener('mouseenter', function () {
        el.classList.add('is-hover');
      });

      el.addEventListener('mouseleave', function () {
        el.classList.remove('is-hover');
      });
    });
  }
})();
