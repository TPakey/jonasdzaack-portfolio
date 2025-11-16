// main.js – Jonas Portfolio
// Smooth scroll, section reveals, tilt effects & LN-inspired loader curtain

// ===========================
// Smooth scrolling with Lenis
// ===========================
let lenis;

function initLenis() {
  if (window.Lenis) {
    lenis = new Lenis({
      smooth: true,
      lerp: 0.12,
      wheelMultiplier: 1.1
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }
}

// ===========================
// Scroll progress bar
// ===========================
function initScrollProgress() {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;

  const updateBar = () => {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.setProperty("--scroll-progress", `${progress}%`);
    bar.style.transform = `scaleX(${progress / 100})`;
  };

  updateBar();
  window.addEventListener("scroll", updateBar, { passive: true });
}

// ===========================
// GSAP Section reveals
// ===========================
function initGsapReveals() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const sections = document.querySelectorAll(".section.reveal");
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
          toggleActions: "play none none reverse"
        }
      }
    );
  });
}

// ===========================
// Tilt effects for cards / hero
// ===========================
function initTilt() {
  const elements = document.querySelectorAll(".js-tilt, .js-tilt-sm");
  if (!elements.length || !window.VanillaTilt) return;

  elements.forEach((el) => {
    const isSmall = el.classList.contains("js-tilt-sm");
    VanillaTilt.init(el, {
      max: isSmall ? 8 : 14,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      scale: 1.02
    });
  });
}

// ===========================
// Loader & page transitions
// ===========================
function initLoader() {
  const loader = document.querySelector(".loader-overlay");
  if (!loader) return;

  const HIDE_DELAY = 800; // ms after load
  const NAV_DELAY = 500; // ms before navigating on click

  // Helper: hide loader after page fully loaded
  function hideLoader() {
    // falls schon versteckt, nicht doppelt
    if (!loader.classList.contains("is-hidden")) {
      setTimeout(() => {
        loader.classList.add("is-hidden");
      }, HIDE_DELAY);
    }
  }

  window.addEventListener("load", hideLoader);

  // Helper: check if link is “internal”
  function isInternalLink(link) {
    const href = link.getAttribute("href");
    if (!href) return false;

    // Hash-only Links (#section)
    if (href.startsWith("#")) return false;

    // Mailto / Tel
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;

    // Absolute URLs
    if (href.startsWith("http://") || href.startsWith("https://")) {
      try {
        const url = new URL(href);
        return url.origin === window.location.origin;
      } catch {
        return false;
      }
    }

    // Relative URLs wie "on-track.html", "folder/page.html"
    return true;
  }

  // Interne Links abfangen und Curtain animieren
  const links = document.querySelectorAll("a[href]");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) return;

      // Modifier-Keys: neuen Tab etc. erlauben
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button === 1
      ) {
        return;
      }

      // target blank → nicht abfangen
      if (link.target && link.target === "_blank") {
        return;
      }

      if (!isInternalLink(link)) {
        return;
      }

      // Hash-navigations nicht künstlich laden lassen
      if (href.startsWith("#")) return;

      event.preventDefault();

      // Loader wieder einblenden
      loader.classList.remove("is-hidden");

      // Kleiner “Curtain”-Lag, dann navigieren
      setTimeout(() => {
        window.location.href = href;
      }, NAV_DELAY);
    });
  });
}

// ===========================
// Init on DOMContentLoaded
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  initLenis();
  initScrollProgress();
  initGsapReveals();
  initTilt();
  initLoader();
});
