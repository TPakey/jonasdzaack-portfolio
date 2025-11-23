(function () {
  const container = document.querySelector('.hero-scene');
  if (!container) return;

  const frame = container.querySelector('.hero-scene__frame');
  const fallbackEl = container.querySelector('.hero-scene__fallback');

  const textureSources = {
    base: container.getAttribute('data-base') || 'assets/portrait_base.png',
    depth: container.getAttribute('data-depth') || 'assets/portrait_depth.png',
    shadow: container.getAttribute('data-shadow') || 'assets/portrait_shadow.png',
    helmet: container.getAttribute('data-helmet') || 'assets/helmet_overlay.png',
  };

  const fallbackSources = {
    base: 'assets/jonas-hero.png',
    depth: 'assets/jonas-hero-depth.jpg',
    shadow: 'assets/jonas-hero-shadow.png',
    helmet: 'assets/jonas-hero-shadow.png',
  };

  const hasWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (error) {
      return false;
    }
  };

  if (!window.THREE || !hasWebGL()) {
    container.classList.add('is-fallback');
    return;
  }

  const { THREE } = window;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  frame.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 10);
  camera.position.z = 1.8;

  const textureLoader = new THREE.TextureLoader();
  const loadTexture = (url) =>
    new Promise((resolve, reject) => {
      textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        () => reject(url)
      );
    });

  const safeLoad = async (key) => {
    try {
      return await loadTexture(textureSources[key]);
    } catch (error) {
      if (!fallbackSources[key]) throw error;
      return loadTexture(fallbackSources[key]);
    }
  };

  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    centerX: 0.5,
    centerY: 0.45,
  };

  let running = false;
  let inView = true;

  const uniforms = {
    uBaseMap: { value: null },
    uDepthMap: { value: null },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uStrength: { value: 0.065 },
  };

  const overlayUniforms = {
    uHelmetMap: { value: null },
    uShadowMap: { value: null },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uRadius: { value: 0.5 },
  };

  const portraitShader = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uBaseMap;
      uniform sampler2D uDepthMap;
      uniform vec2 uPointer;
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        float depth = texture2D(uDepthMap, vUv).r;
        vec2 parallax = (depth - 0.48) * uStrength * vec2(uPointer.x, -uPointer.y);
        vec2 warpedUv = vUv + parallax;
        vec4 color = texture2D(uBaseMap, warpedUv);
        gl_FragColor = vec4(color.rgb, color.a);
      }
    `,
    transparent: true,
  });

  const overlayShader = new THREE.ShaderMaterial({
    uniforms: overlayUniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uHelmetMap;
      uniform sampler2D uShadowMap;
      uniform vec2 uPointer;
      uniform float uRadius;
      varying vec2 vUv;
      void main() {
        vec2 delta = vUv - uPointer;
        float dist = length(delta);
        float mask = smoothstep(uRadius + 0.18, uRadius, dist);

        vec4 helmet = texture2D(uHelmetMap, vUv);
        float shadow = texture2D(uShadowMap, vUv).r;

        vec3 darken = mix(vec3(0.0), vec3(0.0), shadow);
        vec3 color = helmet.rgb + darken * -0.4;
        float alpha = (helmet.a * 0.9 + shadow * 0.4) * mask;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  const geometry = new THREE.PlaneGeometry(1, 1.2, 1, 1);
  const portraitMesh = new THREE.Mesh(geometry, portraitShader);
  const overlayMesh = new THREE.Mesh(geometry.clone(), overlayShader);
  portraitMesh.position.z = 0;
  overlayMesh.position.z = 0.01;
  scene.add(portraitMesh);
  scene.add(overlayMesh);

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const updatePointer = () => {
    pointer.x += (pointer.targetX - pointer.x) * 0.08;
    pointer.y += (pointer.targetY - pointer.y) * 0.08;

    uniforms.uPointer.value.set(pointer.x, pointer.y);
    overlayUniforms.uPointer.value.set(pointer.centerX, pointer.centerY);
  };

  const renderLoop = () => {
    if (!running || !inView) return;
    requestAnimationFrame(renderLoop);
    updatePointer();
    renderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(renderLoop);
  };

  const stop = () => {
    running = false;
  };

  const onPointerMove = (event) => {
    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    pointer.targetX = (x - 0.5) * 1.2;
    pointer.targetY = (y - 0.5) * 1.2;
    pointer.centerX = x;
    pointer.centerY = y;
  };

  const onPointerLeave = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    pointer.centerX += (0.5 - pointer.centerX) * 0.2;
    pointer.centerY += (0.45 - pointer.centerY) * 0.2;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        inView = entry.isIntersecting;
        if (inView) {
          start();
        } else {
          stop();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(container);

  Promise.all([safeLoad('base'), safeLoad('depth'), safeLoad('shadow'), safeLoad('helmet')])
    .then(([baseMap, depthMap, shadowMap, helmetMap]) => {
      if (!baseMap) throw new Error('Missing base texture');
      uniforms.uBaseMap.value = baseMap;
      uniforms.uDepthMap.value = depthMap || baseMap;
      overlayUniforms.uHelmetMap.value = helmetMap || shadowMap || baseMap;
      overlayUniforms.uShadowMap.value = shadowMap || baseMap;
      resize();
      container.classList.add('is-active');
      fallbackEl?.setAttribute('aria-hidden', 'true');
      start();
    })
    .catch(() => {
      container.classList.add('is-fallback');
      renderer.domElement?.remove();
    });

  window.addEventListener('resize', resize);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerleave', onPointerLeave);
})();
