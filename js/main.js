// main.js – Interactions & Animations für Jonas' Portfolio

function initLenis() {
  if (!window.Lenis) return null;

  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1.0,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  return lenis;
}

function initTilt() {
  if (!window.VanillaTilt) return;

  const bigTilt = document.querySelectorAll(".js-tilt");
  const smallTilt = document.querySelectorAll(".js-tilt-sm");

  if (bigTilt.length) {
    VanillaTilt.init(bigTilt, {
      max: 18,
      speed: 400,
      glare: true,
      "max-glare": 0.25,
      scale: 1.02,
    });
  }

  if (smallTilt.length) {
    VanillaTilt.init(smallTilt, {
      max: 10,
      speed: 400,
      glare: false,
      scale: 1.02,
    });
  }
}

function initGsapAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // HERO only auf Seiten, die einen Hero haben
  if (document.querySelector(".hero")) {
    // Intro
    gsap.from(".hero-copy h1", {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
    });

    gsap.from(".hero-text", {
      y: 20,
      opacity: 0,
      duration: 0.7,
      delay: 0.15,
      ease: "power3.out",
    });

    gsap.from(".hero-cta .btn", {
      y: 16,
      opacity: 0,
      duration: 0.6,
      delay: 0.3,
      stagger: 0.08,
      ease: "power3.out",
    });

    gsap.from(".hero-meta .meta-pill", {
      y: 12,
      opacity: 0,
      duration: 0.6,
      delay: 0.4,
      stagger: 0.06,
      ease: "power3.out",
    });

    gsap.from(".hero-stack", {
      y: 32,
      opacity: 0,
      duration: 0.9,
      delay: 0.25,
      ease: "power3.out",
    });

    gsap.from(".hero-stats .stat-card", {
      y: 16,
      opacity: 0,
      duration: 0.7,
      delay: 0.4,
      stagger: 0.07,
      ease: "power3.out",
    });

    // light floating / parallax
    gsap.to(".hero-layer-bg", {
      y: -30,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".hero-layer-lines", {
      y: 40,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".hero-orbit", {
      y: -40,
      x: 30,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(".hero-ghost-title", {
      x: -80,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // kleine float-loop animationen (LN4-Feeling)
    gsap.to(".hero-chip", {
      y: -6,
      repeat: -1,
      yoyo: true,
      duration: 2.2,
      ease: "sine.inOut",
      stagger: 0.3,
    });

    gsap.to(".portrait-inner", {
      y: -10,
      repeat: -1,
      yoyo: true,
      duration: 3.4,
      ease: "sine.inOut",
    });
  }

  // Section Reveals
  gsap.utils.toArray(".section.reveal").forEach((section) => {
    gsap.fromTo(
      section,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
        },
      }
    );
  });

  // Projects & Cards
  gsap.utils.toArray(".project-card").forEach((card) => {
    gsap.from(card, {
      y: 22,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
      },
    });
  });

  gsap.utils.toArray(".timeline-item").forEach((item) => {
    gsap.from(item, {
      x: -18,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
      },
    });
  });
}

function initScrollProgress(lenis) {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;

  const update = () => {
    const scroll =
      lenis && typeof lenis.scroll === "number" ? lenis.scroll : window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scroll / docHeight : 0;
    bar.style.transform = `scaleX(${progress})`;
  };

  if (lenis && lenis.on) {
    lenis.on("scroll", update);
  } else {
    window.addEventListener("scroll", update);
  }

  update();
}

document.addEventListener("DOMContentLoaded", () => {
  const lenis = initLenis(); // Smooth Scroll
  initTilt();                // 3D Face + Stats
  initGsapAnimations();      // Hero, Parallax, Reveals
  initScrollProgress(lenis); // Scroll-Leiste oben
});
