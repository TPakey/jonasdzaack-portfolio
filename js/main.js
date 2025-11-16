// main.js – interactions & motion for Jonas' portfolio
// v1: keeps things readable and easy to extend later.

// Smooth scrolling with Lenis
function initLenis() {
  if (!window.Lenis) return null;

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1.0
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  return lenis;
}

// Tilt effects for cards & hero portrait
function initTilt() {
  if (!window.VanillaTilt) return;

  const tiltElements = document.querySelectorAll(".js-tilt, .js-tilt-sm");
  if (!tiltElements.length) return;

  tiltElements.forEach((el) => {
    const isSmall = el.classList.contains("js-tilt-sm");

    VanillaTilt.init(el, {
      max: isSmall ? 8 : 12,
      speed: 400,
      scale: isSmall ? 1.02 : 1.04,
      glare: false,
      "full-page-listening": false
    });
  });
}

// Basic GSAP animations (hero, sections)
function initGsapAnimations() {
  if (!window.gsap) return;

  const { gsap } = window;

  // Hero content fade-in
  const hero = document.querySelector(".hero");
  if (hero) {
    gsap.from(hero.querySelectorAll(".hero-content > *"), {
      opacity: 0,
      y: 24,
      duration: 0.8,
      delay: 0.1,
      stagger: 0.06,
      ease: "power2.out"
    });

    const heroVisual = hero.querySelector(".hero-visual");
    if (heroVisual) {
      gsap.from(heroVisual, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        delay: 0.25,
        ease: "power2.out"
      });
    }
  }

  // Floating orbit / portrait subtle motion
  const orbit = document.querySelector(".hero-orbit-primary");
  if (orbit) {
    gsap.to(orbit, {
      y: -10,
      x: 6,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }

  const portraitInner = document.querySelector(".hero-portrait-inner");
  if (portraitInner) {
    gsap.to(portraitInner, {
      y: -6,
      duration: 3.6,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }

  // Section reveals on scroll
  if (window.ScrollTrigger) {
    gsap.utils.toArray(".section").forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    });
  }
}

// Scroll progress bar at top
function initScrollProgress(lenisInstance) {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;

  function updateProgress(scrollY, maxScroll) {
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
    bar.style.width = `${Math.min(Math.max(progress, 0), 1) * 100}%`;
  }

  function handleScroll() {
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop || 0;
    const docHeight =
      document.documentElement.scrollHeight ||
      document.body.scrollHeight ||
      1;
    const winHeight = window.innerHeight || 1;
    const maxScroll = docHeight - winHeight;
    updateProgress(scrollTop, maxScroll);
  }

  if (lenisInstance && typeof lenisInstance.on === "function") {
    lenisInstance.on("scroll", (e) => {
      const scrollTop = e.scroll || 0;
      const docHeight =
        document.documentElement.scrollHeight ||
        document.body.scrollHeight ||
        1;
      const winHeight = window.innerHeight || 1;
      const maxScroll = docHeight - winHeight;
      updateProgress(scrollTop, maxScroll);
    });
  } else {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }
}

// Init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const lenis = initLenis();
  initTilt();
  initGsapAnimations();
  initScrollProgress(lenis);
});
