
// Smooth scrolling with Lenis
let lenis;
function initLenis(){
  lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.0, smoothWheel: true });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  // Sync GSAP with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
  gsap.ticker.lagSmoothing(0);
}

// Swup for page transitions
const swup = new Swup({ preload: true });

function initPage(){
  initLenis();

  // Atropos tilt for the 'face' card
  const faceEl = document.getElementById('faceCard');
  if (faceEl) {
    window.Atropos({ el: faceEl, shadow: true, activeOffset: 36 });
  }

  // Simple staggered reveal using GSAP
  const reveals = gsap.utils.toArray('.reveal');
  gsap.fromTo(reveals, {autoAlpha:0, y:20}, {
    autoAlpha:1, y:0, duration:0.8, stagger:0.12, ease:"power3.out",
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
    }
  });

  // Sticky headline pins on panels if present
  gsap.utils.toArray('.pin').forEach((el)=>{
    ScrollTrigger.create({
      trigger: el,
      start: "top 20%",
      end: "bottom top",
      pin: true,
      pinSpacing: false
    });
  });
}

initPage();
swup.hooks.on('page:view', initPage);
