// main.js – kleine Interactions für Jonas' Portfolio

document.addEventListener("DOMContentLoaded", () => {
  // Fake-3D Portrait Card
  if (window.VanillaTilt) {
    const tiltElements = document.querySelectorAll(".js-tilt");
    if (tiltElements.length) {
      VanillaTilt.init(tiltElements, {
        max: 18,
        speed: 400,
        glare: true,
        "max-glare": 0.25,
        scale: 1.02,
      });
    }
  }

  // GSAP Scroll-Reveals
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Intro
    gsap.from(".hero-copy h1", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.from(".hero-text", {
      y: 18,
      opacity: 0,
      duration: 0.7,
      delay: 0.15,
      ease: "power3.out",
    });

    gsap.from(".hero-cta .btn", {
      y: 14,
      opacity: 0,
      duration: 0.6,
      delay: 0.3,
      stagger: 0.08,
      ease: "power3.out",
    });

    gsap.from(".hero-meta .meta-pill", {
      y: 10,
      opacity: 0,
      duration: 0.5,
      delay: 0.45,
      stagger: 0.06,
      ease: "power3.out",
    });

    gsap.from(".portrait-card", {
      y: 24,
      opacity: 0,
      duration: 0.9,
      delay: 0.2,
      ease: "power3.out",
    });

    gsap.from(".hero-stats .stat-card", {
      y: 12,
      opacity: 0,
      duration: 0.6,
      delay: 0.35,
      stagger: 0.07,
      ease: "power3.out",
    });

    // Sections mit .reveal
    gsap.utils.toArray(".section.reveal").forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
          },
        }
      );
    });
  }
});
