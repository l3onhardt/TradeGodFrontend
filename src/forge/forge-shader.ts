import * as THREE from 'three';
import curlSrc from '../shaders/curl-noise.glsl';
import fbmSrc from '../shaders/fbm.glsl';
import ringVertexBody from '../shaders/ring-form.glsl';
import type { Flags } from '../lib/feature-flags';

export interface ForgeScene { setPhase(p: number): void; dispose(): void }

export async function createForgeScene(canvas: HTMLCanvasElement, flags: Flags): Promise<ForgeScene> {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, flags.dprCap));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 14;

  // particle count respects the lowEnd cap; full path (non-reduced) reaches 8000, lowEnd halves
  const N = Math.min(flags.particleCap, flags.lowEnd ? 4000 : 8000);
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(N * 3);
  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = Math.random() * 24 - 12;
    positions[i * 3 + 1] = Math.random() * 24 - 12;
    positions[i * 3 + 2] = Math.random() * 24 - 12;
    seeds[i] = Math.random();
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const vertexShader = `
    uniform float uPhase;
    attribute float aSeed;
    ${curlSrc}
    ${fbmSrc}
    void main() {
      ${ringVertexBody}
    }
  `;
  const fragmentShader = `
    void main() {
      gl_FragColor = vec4(0.831, 0.686, 0.471, 0.9); // ~#d4af78 ember, additive blend
    }
  `;
  const mat = new THREE.ShaderMaterial({
    uniforms: { uPhase: { value: 0 } },
    vertexShader, fragmentShader,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const points = new THREE.Points(geom, mat);
  scene.add(points);

  let raf = 0;
  let phase = 0;
  function tick(): void {
    mat.uniforms.uPhase.value = phase;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  tick();

  return {
    setPhase(p: number) { phase = p; },
    dispose() {
      cancelAnimationFrame(raf);
      geom.dispose();
      mat.dispose();
      renderer.dispose();
    },
  };
}