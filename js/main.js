const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefersLessPower = !!(navigator?.connection && navigator.connection.saveData);

// Shared state
let lenisInstance = null;

// =====================
// Entry
// =====================
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.loader-overlay');
  const progressBar = document.querySelector('.scroll-progress');

  setupLoader(loader);
  setupPageTransitions(loader);
  setupScrollProgress(progressBar);
  initSmoothScroll();
  initTilt();
  initGsapMotion();
  initTextHoverWave();
  initHeroDepth();
  initTrophyScene();
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
// Smooth scroll + ScrollTrigger bridge
// =====================
function initSmoothScroll() {
  if (isReducedMotion || prefersLessPower) return;
  if (!window.Lenis) return;

  lenisInstance = new window.Lenis({
    duration: 1.1,
    smoothWheel: true,
    smoothTouch: false,
  });

  let lastScroll = 0;
  lenisInstance.on('scroll', ({ scroll }) => {
    lastScroll = scroll;
  });

  const raf = (time) => {
    lenisInstance?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  if (window.ScrollTrigger) {
    window.gsap?.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (typeof value === 'number') {
          lenisInstance?.scrollTo(value, { immediate: true });
        }
        return lastScroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });
    lenisInstance.on('scroll', window.ScrollTrigger.update);
    window.ScrollTrigger.addEventListener('refresh', () => lenisInstance?.update());
    window.ScrollTrigger.refresh();
  }
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
// Tilt effects
// =====================
function initTilt() {
  if (!window.VanillaTilt) return;
  const tiltEls = document.querySelectorAll('.js-tilt');
  if (tiltEls.length) {
    window.VanillaTilt.init(tiltEls, {
      max: 13,
      speed: 800,
      scale: 1.03,
      glare: true,
      'max-glare': 0.18,
    });
  }

  const tiltSmEls = document.querySelectorAll('.js-tilt-sm');
  if (tiltSmEls.length) {
    window.VanillaTilt.init(tiltSmEls, {
      max: 8,
      speed: 600,
      scale: 1.02,
      glare: false,
    });
  }
}

// =====================
// GSAP motion
// =====================
function initGsapMotion() {
  if (!window.gsap) return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const heroCard = document.querySelector('#home-hero .portrait-card');
  if (heroCard) {
    gsap.to(heroCard, {
      y: -12,
      duration: 5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    const rings = document.querySelectorAll('.hero-bg-ring');
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

  gsap.utils.toArray('.section.reveal').forEach((section) => {
    const yOffset = section.classList.contains('section-alt') ? 40 : 60;
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

    const cards = section.querySelectorAll(
      '.project-card, .season-row, .highlight-card, .card, .onoff-card, .hero-portrait-card, .stat-card, .hof-card'
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
// Hero Depth WebGL
// =====================
function initHeroDepth() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') {
    canvas?.classList.add('is-hidden');
    canvas?.closest('.portrait-card')?.classList.add('hero--no-3d');
    return;
  }
  const portraitCard = canvas.closest('.portrait-card');
  if (isReducedMotion || prefersLessPower) {
    canvas.classList.add('is-hidden');
    portraitCard?.classList.add('hero--no-3d');
    const fallback = canvas.nextElementSibling;
    if (fallback) fallback.classList.add('is-visible');
    return;
  }

  const loader = new THREE.TextureLoader();
  const baseMap = loader.load('assets/jonas-hero.png');
  const depthMap = loader.load('assets/jonas-hero-depth.jpg');
  const shadowMap = loader.load('assets/jonas-hero-shadow.png');

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -2, 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

  const uniforms = {
    uBaseMap: { value: baseMap },
    uDepthMap: { value: depthMap },
    uShadowMap: { value: shadowMap },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uStrength: { value: 0.12 },
    uTime: { value: 0 },
  };

  const geometry = new THREE.PlaneGeometry(1.4, 1.8, 80, 80);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      uniform sampler2D uDepthMap;
      uniform float uStrength;
      void main() {
        vUv = uv;
        vec4 depthSample = texture2D(uDepthMap, uv);
        float depth = depthSample.r;
        vec3 displaced = position + normal * (depth - 0.5) * uStrength;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uBaseMap;
      uniform sampler2D uShadowMap;
      uniform vec2 uMouse;
      uniform float uTime;
      void main(){
        vec4 baseColor = texture2D(uBaseMap, vUv);
        vec4 shadowColor = texture2D(uShadowMap, vUv);
        float dist = distance(vUv, uMouse);
        float blob = smoothstep(0.55, 0.18, dist);
        float pulse = 0.04 * sin(uTime * 0.8);
        float blend = clamp(blob + pulse, 0.0, 1.0);
        vec3 finalColor = mix(baseColor.rgb, shadowColor.rgb, blend);
        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  portraitCard?.classList.add('hero--has-3d');

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
  };
  resize();
  window.addEventListener('resize', resize);

  const mouse = new THREE.Vector2(0.5, 0.5);
  const targetMouse = new THREE.Vector2(0.5, 0.5);
  let targetStrength = 0.18;

  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    targetMouse.x = (event.clientX - rect.left) / rect.width;
    targetMouse.y = 1 - (event.clientY - rect.top) / rect.height;
    targetStrength = 0.22;
  };

  const onPointerLeave = () => {
    targetMouse.set(0.5, 0.5);
    targetStrength = 0.08;
  };

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);

  const clock = new THREE.Clock();
  function render() {
    requestAnimationFrame(render);
    uniforms.uTime.value = clock.getElapsedTime();
    mouse.lerp(targetMouse, 0.08);
    uniforms.uMouse.value.copy(mouse);
    uniforms.uStrength.value = THREE.MathUtils.lerp(uniforms.uStrength.value, targetStrength, 0.06);
    renderer.render(scene, camera);
  }
  render();
}

// =====================
// Trophy Scene (On Track)
// =====================
function initTrophyScene() {
  const canvas = document.getElementById('trophyCanvas');
  if (!canvas || typeof THREE === 'undefined' || !THREE.GLTFLoader) return;
  if (isReducedMotion || prefersLessPower) {
    canvas.classList.add('is-hidden');
    return;
  }

  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.set(0, 1.4, 4.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const keyLight = new THREE.DirectionalLight(0xfff1c1, 1.2);
  keyLight.position.set(2.4, 3, 1.5);
  const rimLight = new THREE.DirectionalLight(0x8de0ff, 0.5);
  rimLight.position.set(-2, 1.5, -1.2);
  scene.add(ambient, keyLight, rimLight);

  let trophy;
  let scrollInfluence = 0;
  const hoverTarget = new THREE.Vector2();
  const hover = new THREE.Vector2();
  const loader = new THREE.GLTFLoader();
  loader.load(
    'assets/trophy.glb',
    (gltf) => {
      trophy = gltf.scene;
      trophy.traverse((child) => {
        if (child.isMesh) {
          child.material.metalness = 0.8;
          child.material.roughness = 0.35;
        }
      });
      trophy.position.set(0, -0.9, 0);
      scene.add(trophy);
    },
    undefined,
    (err) => console.error('Trophy load error', err)
  );

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
  };
  resize();
  window.addEventListener('resize', resize);

  if (window.ScrollTrigger) {
    window.ScrollTrigger.create({
      trigger: canvas.closest('.trophy-section') || canvas,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        scrollInfluence = self.progress * Math.PI * 0.35;
      },
    });
  }

  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    hoverTarget.set(x, y);
  };

  const onPointerLeave = () => {
    hoverTarget.set(0, 0);
  };

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);

  const clock = new THREE.Clock();
  function render() {
    requestAnimationFrame(render);
    const t = clock.getElapsedTime();
    if (trophy) {
      hover.lerp(hoverTarget, 0.08);
      trophy.rotation.y = t * 0.35 + scrollInfluence;
      trophy.rotation.x = THREE.MathUtils.lerp(trophy.rotation.x, hover.y * 0.35, 0.08);
      trophy.rotation.z = THREE.MathUtils.lerp(trophy.rotation.z, -hover.x * 0.35, 0.08);
    }
    renderer.render(scene, camera);
  }
  render();
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
