import * as THREE from 'three';
import type { Flags } from '../lib/feature-flags';

/**
 * Persistent low-ember fluid background. A full-screen additive shader that
 * breathes behind every section. Only mounted in the non-reduced, non-lowEnd path
 * (main.ts gates the call); lowEnd devices keep the CSS gradient fallback in base.css.
 */
export function mountFluidBg(flags: Flags): () => void {
  const canvas = document.getElementById('fluid') as HTMLCanvasElement | null;
  if (!canvas) return () => {};

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch {
    // No WebGL context — leave the CSS gradient fallback visible.
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, flags.dprCap));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uEmber: { value: new THREE.Color(0x7e6a4e) }, // #d4af78 dimmed toward desaturation for ambient bg
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `void main(){ gl_Position = vec4(position, 1.0); }`,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  const onPointer = (e: PointerEvent) => {
    uniforms.uMouse.value.set(
      e.clientX / window.innerWidth,
      1 - e.clientY / window.innerHeight,
    );
  };
  window.addEventListener('pointermove', onPointer);

  let raf = 0;
  const tick = () => {
    uniforms.uTime.value = performance.now() / 1000;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  // dispose
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointer);
    quad.geometry.dispose();
    mat.dispose();
    renderer.dispose();
  };
}

// FBM-based ember curtain. Low alpha so it never competes with section content.
const FRAGMENT = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uEmber;
uniform vec2 uResolution;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 3.0 + uMouse * 2.0;
  float n = fbm(p + uTime * 0.05) * 0.5 + fbm(p * 2.0 - uTime * 0.03) * 0.5;
  vec3 col = uEmber * smoothstep(0.4, 0.95, n) * 0.22;
  gl_FragColor = vec4(col, n * 0.5);
}
`;