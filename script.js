const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefersLessPower = !!(navigator?.connection && navigator.connection.saveData);

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.loader-overlay');
  const progressBar = document.querySelector('.scroll-progress');

  setupLoader(loader);
  setupPageTransitions(loader);
  setupScrollProgress(progressBar);
  initSmoothScroll();
  initTiltEffects();
  initScrollReveal();
  initHeadsMotion();
  initTextHoverWave();
  markHeroFallback();
  initTrophyCanvas();
  addFloatingTouches();
  logConsoleMessage();
});

// =====================
// Loader
// =====================
function setupLoader(loader) {
  if (!loader) return;
  const loadStart = performance.now();
  const MIN_LOADER_TIME = 650;

  const hide = () => hideLoader(loader);

  window.addEventListener('load', () => {
    const elapsed = performance.now() - loadStart;
    const delay = Math.max(0, MIN_LOADER_TIME - elapsed);
    setTimeout(hide, delay);
  });

  setTimeout(hide, 3200);
}

function hideLoader(loader) {
  if (!loader || loader.classList.contains('is-hidden')) return;
  loader.classList.add('is-leaving');
  setTimeout(() => {
    loader.classList.add('is-hidden');
    loader.classList.remove('is-leaving');
    loader.classList.remove('is-active');
  }, 500);
}

function showLoader(loader) {
  if (!loader) return;
  loader.classList.remove('is-hidden', 'is-leaving');
  void loader.offsetWidth;
  loader.classList.add('is-active');
}

// =====================
// Scroll progress
// =====================
function setupScrollProgress(progressBar) {
  if (!progressBar) return;
  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// =====================
// Smooth scroll
// =====================
function initSmoothScroll() {
  if (isReducedMotion) return;
  const anchors = document.querySelectorAll('a[href^="#"]');
  anchors.forEach((link) => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    link.addEventListener('click', (event) => {
      const target = document.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// =====================
// Page transitions
// =====================
function setupPageTransitions(loader) {
  const links = document.querySelectorAll('a[href]');
  const currentOrigin = window.location.origin;

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return;
    }

    const protocol = url.protocol;
    const isHttp = protocol === 'http:' || protocol === 'https:';
    if (!isHttp) return;

    const isExternal = url.origin !== currentOrigin;
    if (isExternal) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;
    if (link.getAttribute('rel')?.includes('external')) return;

    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }
      event.preventDefault();
      const urlToOpen = url.toString();
      if (!loader) {
        window.location.href = urlToOpen;
        return;
      }
      showLoader(loader);
      setTimeout(() => {
        window.location.href = urlToOpen;
      }, 450);
    });
  });
}

// =====================
// Tilt effects (vanilla)
// =====================
function initTiltEffects() {
  if (isReducedMotion) return;
  const tiltEls = document.querySelectorAll('.js-tilt');
  const tiltSmEls = document.querySelectorAll('.js-tilt-sm');
  if (tiltEls.length) {
    createVanillaTilt(tiltEls, { max: 14, scale: 1.03, glare: true });
  }
  if (tiltSmEls.length) {
    createVanillaTilt(tiltSmEls, { max: 9, scale: 1.015, glare: false });
  }
}

function createVanillaTilt(elements, options = {}) {
  const settings = Object.assign({ max: 12, scale: 1.02, glare: false }, options);
  elements.forEach((el) => {
    const glareLayer = settings.glare ? createGlareLayer(el) : null;
    el.classList.add('tilt-ready');

    let frame = null;
    let targetX = 0;
    let targetY = 0;
    let targetScale = 1;
    let currentX = 0;
    let currentY = 0;
    let currentScale = 1;

    const apply = () => {
      frame = null;
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      currentScale += (targetScale - currentScale) * 0.12;

      el.style.transform = `perspective(900px) rotateX(${currentY.toFixed(2)}deg) rotateY(${currentX.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;

      if (glareLayer) {
        const angle = Math.atan2(currentY, currentX);
        glareLayer.style.background = `radial-gradient(circle at ${50 + Math.sin(angle) * 30}% ${50 - Math.cos(angle) * 30}%, rgba(255,255,255,0.28), transparent 55%)`;
      }
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const handleMove = (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      targetX = (x - 0.5) * settings.max;
      targetY = -(y - 0.5) * settings.max;
      targetScale = settings.scale;
      requestUpdate();
    };

    const handleLeave = () => {
      targetX = 0;
      targetY = 0;
      targetScale = 1;
      requestUpdate();
    };

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerleave', handleLeave);
  });
}

function createGlareLayer(el) {
  const layer = document.createElement('span');
  layer.className = 'tilt-glare';
  el.appendChild(layer);
  return layer;
}

// =====================
// Scroll reveals
// =====================
function initScrollReveal() {
  const sections = document.querySelectorAll('.section.reveal');
  if (!sections.length) return;

  const cardSelector =
    '.project-card, .season-row, .highlight-card, .card, .onoff-card, .hero-portrait-card, .stat-card, .hof-card';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        const cards = entry.target.querySelectorAll(cardSelector);
        cards.forEach((card, index) => {
          card.style.transitionDelay = `${Math.min(index * 60, 420)}ms`;
          card.classList.add('is-visible');
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach((section) => observer.observe(section));
}

// =====================
// Text Hover Wave 2.0
// =====================
function initTextHoverWave() {
  const targets = document.querySelectorAll(
    '.nav a, .btn, .logo-text, .hero-title, .ontrack-hero-title, .offtrack-hero-title, .section-header h2, .hof-card h3'
  );
  if (!targets.length) return;

  targets.forEach((el) => {
    const text = el.textContent.trim();
    if (!text) return;

    const segments = segmentText(text);
    el.classList.add('js-letter-hover');
    el.innerHTML = '';
    const row = document.createElement('span');
    row.className = 'letter-row';

    segments.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = char;
      span.style.transitionDelay = `${(index * 0.018).toFixed(3)}s`;
      row.appendChild(span);
    });

    el.appendChild(row);

    el.addEventListener('mouseenter', () => el.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => el.classList.remove('is-hover'));
  });
}

function segmentText(text) {
  if (window.Intl?.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

// =====================
// Hero portrait fallback
// =====================
function markHeroFallback() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  canvas.classList.add('is-hidden');
  const portraitCard = canvas.closest('.portrait-card');
  portraitCard?.classList.add('hero--no-3d');
  const fallback = canvas.nextElementSibling;
  fallback?.classList.add('is-visible');
}

// =====================
// Trophy Canvas (2D replacement)
// =====================
function initTrophyCanvas() {
  const canvas = document.getElementById('trophyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.classList.add('is-hidden');
    return;
  }

  let ratio = window.devicePixelRatio || 1;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.imageSmoothingEnabled = true;
  };
  resize();
  window.addEventListener('resize', resize);

  const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollInfluence = 0;

  const handlePointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    tilt.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    tilt.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
  };

  const handlePointerLeave = () => {
    tilt.targetX = 0;
    tilt.targetY = 0;
  };

  const updateScrollInfluence = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollInfluence = (window.scrollY / maxScroll) * 0.6;
  };

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  window.addEventListener('scroll', updateScrollInfluence, { passive: true });
  updateScrollInfluence();

  const drawScene = (time, staticFrame = false) => {
    const w = canvas.width / ratio;
    const h = canvas.height / ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(1, '#1f2a44');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w * 0.25, h * 0.25, 10, w * 0.5, h * 0.5, w * 0.7);
    glow.addColorStop(0, 'rgba(213, 255, 79, 0.12)');
    glow.addColorStop(1, 'rgba(93, 63, 211, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    tilt.x += (tilt.targetX - tilt.x) * 0.08;
    tilt.y += (tilt.targetY - tilt.y) * 0.08;

    const t = staticFrame ? 0 : time * 0.001;
    const rotation = t * 0.6 + scrollInfluence + tilt.x * 0.01;
    const bob = staticFrame ? 0 : Math.sin(t * 1.4) * 4;

    ctx.save();
    ctx.translate(w / 2, h / 2 + bob);
    ctx.rotate(rotation + tilt.y * 0.01);
    const scale = 0.92 + Math.sin(t * 0.8) * 0.04;
    ctx.scale(scale, scale);
    drawTrophyShape(ctx, Math.min(w, h) * 0.28, tilt);
    ctx.restore();

    drawSparkles(ctx, w, h, t);
  };

  if (isReducedMotion || prefersLessPower) {
    drawScene(0, true);
    return;
  }

  const loop = (time) => {
    drawScene(time);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function drawTrophyShape(ctx, size) {
  const cupWidth = size * 0.9;
  const cupHeight = size * 0.9;
  const stemHeight = size * 0.6;
  const baseWidth = size * 0.7;
  const baseHeight = size * 0.18;

  // Cup
  const gradient = ctx.createLinearGradient(0, -cupHeight, 0, cupHeight);
  gradient.addColorStop(0, '#ffd166');
  gradient.addColorStop(1, '#d9a441');
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#f8e7c4';
  ctx.lineWidth = size * 0.02;

  ctx.beginPath();
  ctx.moveTo(-cupWidth / 2, -cupHeight * 0.6);
  ctx.bezierCurveTo(-cupWidth * 0.65, -cupHeight * 0.3, -cupWidth * 0.5, cupHeight * 0.1, -cupWidth * 0.35, cupHeight * 0.2);
  ctx.lineTo(-cupWidth * 0.25, cupHeight * 0.22);
  ctx.lineTo(0, cupHeight * 0.35);
  ctx.lineTo(cupWidth * 0.25, cupHeight * 0.22);
  ctx.lineTo(cupWidth * 0.35, cupHeight * 0.2);
  ctx.bezierCurveTo(cupWidth * 0.5, cupHeight * 0.1, cupWidth * 0.65, -cupHeight * 0.3, cupWidth / 2, -cupHeight * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Handles
  ctx.beginPath();
  ctx.moveTo(-cupWidth / 2, -cupHeight * 0.5);
  ctx.bezierCurveTo(-cupWidth * 0.9, -cupHeight * 0.3, -cupWidth * 0.85, cupHeight * 0.2, -cupWidth * 0.5, cupHeight * 0.25);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cupWidth / 2, -cupHeight * 0.5);
  ctx.bezierCurveTo(cupWidth * 0.9, -cupHeight * 0.3, cupWidth * 0.85, cupHeight * 0.2, cupWidth * 0.5, cupHeight * 0.25);
  ctx.stroke();

  // Stem
  ctx.fillStyle = '#f6c358';
  ctx.beginPath();
  ctx.moveTo(-cupWidth * 0.12, cupHeight * 0.35);
  ctx.lineTo(-cupWidth * 0.18, cupHeight * 0.35 + stemHeight * 0.3);
  ctx.lineTo(-cupWidth * 0.12, cupHeight * 0.35 + stemHeight * 0.6);
  ctx.lineTo(cupWidth * 0.12, cupHeight * 0.35 + stemHeight * 0.6);
  ctx.lineTo(cupWidth * 0.18, cupHeight * 0.35 + stemHeight * 0.3);
  ctx.lineTo(cupWidth * 0.12, cupHeight * 0.35);
  ctx.closePath();
  ctx.fill();

  // Base
  const baseGradient = ctx.createLinearGradient(-baseWidth / 2, 0, baseWidth / 2, 0);
  baseGradient.addColorStop(0, '#2c2c34');
  baseGradient.addColorStop(1, '#17171f');
  ctx.fillStyle = baseGradient;
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(
      -baseWidth / 2,
      cupHeight * 0.35 + stemHeight * 0.6,
      baseWidth,
      baseHeight,
      baseHeight / 2
    );
    ctx.fill();
  } else {
    ctx.fillRect(-baseWidth / 2, cupHeight * 0.35 + stemHeight * 0.6, baseWidth, baseHeight);
  }
}

function drawSparkles(ctx, w, h, t) {
  const count = 8;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + t * 0.4;
    const radius = Math.sin(t * 0.7 + i) * 6 + Math.min(w, h) * 0.18;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const size = (Math.sin(t * 1.2 + i) + 1.5) * 1.4;
    ctx.fillStyle = 'rgba(213, 255, 79, 0.75)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// =====================
// Heads section motion
// =====================
function initHeadsMotion() {
  if (isReducedMotion) return;
  const section = document.querySelector('.heads-section');
  if (!section) return;

  const bubbles = section.querySelectorAll('.head-bubble');
  if (!bubbles.length) return;

  const applyShift = (x = 0, y = 0) => {
    bubbles.forEach((bubble) => {
      const shift = parseFloat(bubble.dataset.shift || '12');
      bubble.style.setProperty('--head-shift-x', `${x * shift}px`);
      bubble.style.setProperty('--head-shift-y', `${y * shift * 0.6}px`);
      bubble.style.setProperty('--float-rot', `${x * 0.6}deg`);
    });
  };

  applyShift(0, 0);

  section.addEventListener('pointermove', (event) => {
    const rect = section.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    applyShift(relX * 1.4, relY);
  });

  section.addEventListener('pointerleave', () => applyShift(0, 0));

  const handleScroll = () => {
    const rect = section.getBoundingClientRect();
    const visible = Math.min(1, Math.max(0, 1 - Math.abs(rect.top) / window.innerHeight));
    applyShift(0, (0.5 - visible) * 0.4);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

// =====================
// Floating touches
// =====================
function addFloatingTouches() {
  const heroCard = document.querySelector('#home-hero .portrait-card');
  if (heroCard) {
    heroCard.classList.add('is-floating');
  }
  document.querySelectorAll('.hero-bg-ring').forEach((ring, index) => {
    ring.classList.add('ring-pulse');
    ring.style.animationDelay = `${index * 0.18}s`;
  });
}

// =====================
// Console message
// =====================
function logConsoleMessage() {
  try {
    console.log('%cOn Track · Jonas Dzaack', 'padding:6px 10px;background:#0f172a;color:#d5ff4f;font-weight:700;');
  } catch (err) {
    // noop
  }
}
