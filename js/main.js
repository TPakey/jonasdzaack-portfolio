// main.js
// Jonas Portfolio – Loader, Page Transitions, Smooth Scroll, Hero Motion

// ======================
// Loader / curtain
// ======================
function initLoader() {
  const loader = document.querySelector(".loader-overlay");
  if (!loader) return;

  // Warten, bis wirklich alle Assets geladen sind
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("is-hidden");
    }, 800); // Gefühlte "Curtain"-Zeit
  });
}

// ======================
// Page transitions (Curtain between pages)
// ======================
function initPageTransitions() {
  const loader = document.querySelector(".loader-overlay");
  const links = document.querySelectorAll("a[href]");

  if (!links.length) return;

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    // Externe Links / Anker / Downloads einfach durchlassen
    if (
      href.startsWith("http") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    link.addEventListener("click", (event) => {
      // Cmd+Click / Strg+Click / neues Tab nicht kaputt machen
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank"
      ) {
        return;
      }

      event.preventDefault();

      if (!loader) {
        window.location.href = href;
        return;
      }

      // Loader wieder einblenden
      loader.classList.remove("is-hidden");

      // Mini-Delay, damit CSS-Transition greifen kann
      void loader.offsetHeight;

      setTimeout(() => {
        window.location.href = href;
      }, 500);
    });
  });
}

// ======================
// Lenis smooth scroll
// ======================
let lenis;

function initLenis() {
  if (!window.Lenis) return;

  lenis = new Lenis({
    smooth: true,
    lerp: 0.1, // Wie stark "nachzieht"
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

// ======================
// Scroll progress bar
// ======================
function initScrollProgress() {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;

  const update = () => {
    const scrollTop =
      window.scrollY || document.documentElement.scrollTop || 0;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
    bar.style.width = `${ratio * 100}%`;
  };

  window.addEventListener("scroll", update, { passive: true });
  update();
}

// ======================
// Reveal-on-scroll mit GSAP
// ======================
function initRevealOnScroll() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const sections = document.querySelectorAll(".reveal");
  sections.forEach((section) => {
    gsap.fromTo(
      section,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        },
      }
    );
  });
}

// ======================
// Hero Motion (Tilt + Idle Animation)
// ======================
function initHeroMotion() {
  const heroCard = document.querySelector(".hero-portrait-card");
  const smallTiltEls = document.querySelectorAll(".js-tilt-sm");

  // VanillaTilt – Fake 3D
  if (window.VanillaTilt) {
    if (heroCard) {
      VanillaTilt.init(heroCard, {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.15,
        gyroscope: true,
      });
    }

    if (smallTiltEls.length) {
      VanillaTilt.init(smallTiltEls, {
        max: 12,
        speed: 500,
        scale: 1.03,
        glare: false,
      });
    }
  }

  // GSAP Idle Motion
  if (!window.gsap) return;

  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
  });

  if (heroCard) {
    tl.to(
      heroCard,
      {
        y: -12,
        duration: 3,
        ease: "sine.inOut",
      },
      0
    );
  }

  const rings = document.querySelectorAll(".hero-bg-ring");
  rings.forEach((ring, index) => {
    tl.to(
      ring,
      {
        scale: 1.03 + index * 0.03,
        opacity: 0.7,
        duration: 3 + index,
        ease: "sine.inOut",
      },
      0
    );
  });

  const orbit = document.querySelector(".hero-bg-orbit");
  if (orbit) {
    gsap.to(orbit, {
      rotate: 360,
      duration: 18,
      ease: "none",
      repeat: -1,
    });
  }
}

// ======================
// Init
// ======================
document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initPageTransitions();
  initLenis();
  initScrollProgress();
  initRevealOnScroll();
  initHeroMotion();
});
