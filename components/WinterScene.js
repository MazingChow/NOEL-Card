
import React, { useEffect, useRef } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);
const P_COUNT = 6500;
const THEME_TO_IDX = {
  'Classic Gold': 0, 'Crystal Snow': 1, 'Midnight Aurora': 2, 'Royal Ruby': 3
};

const WinterScene = ({ theme, gesture }) => {
  const containerRef = useRef(null);
  const treeRef = useRef(null);
  const bloomRef = useRef(null);
  const posTargetsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof window.THREE === 'undefined') return;
    const THREE = window.THREE;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.003);
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2.0, 0.4, 0.85);
    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    composer.addPass(bloomPass);
    bloomRef.current = bloomPass;

    const geometry = new THREE.BufferGeometry();
    const pos = new Float32Array(P_COUNT * 3);
    const cols = new Float32Array(P_COUNT * 3);
    for (let i = 0; i < P_COUNT * 3; i++) { pos[i] = (Math.random() - 0.5) * 60; cols[i] = 1.0; }
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const tree = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.13, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.85 }));
    scene.add(tree);
    treeRef.current = tree;

    let time = 0;
    const animate = () => {
      const id = requestAnimationFrame(animate);
      time += 0.01;
      if (treeRef.current && posTargetsRef.current) {
        const p = treeRef.current.geometry.attributes.position;
        const l = gesture === 'PINCH' ? 0.09 : 0.04;
        for (let i = 0; i < P_COUNT * 3; i++) {
          let t = gesture === 'PINCH' ? posTargetsRef.current[i] * 0.1 : posTargetsRef.current[i];
          p.array[i] += (t - p.array[i]) * l;
          if (i % 3 === 0) p.array[i] += Math.sin(time * 2 + i) * 0.03;
        }
        p.needsUpdate = true;
        treeRef.current.rotation.y += gesture === 'PINCH' ? 0.005 : theme.speed;
      }
      if (bloomRef.current) bloomRef.current.strength = theme.bloom + Math.sin(time * 2) * 0.3;
      composer.render();
      return id;
    };
    const animID = animate();
    return () => { cancelAnimationFrame(animID); renderer.dispose(); };
  }, []);

  useEffect(() => {
    if (!treeRef.current) return;
    const targets = new Float32Array(P_COUNT * 3);
    const h = 35;
    const themeIdx = THEME_TO_IDX[theme.name] ?? 0;
    for (let i = 0; i < P_COUNT; i++) {
      const i3 = i * 3;
      const y = (i / P_COUNT) * h - h / 2;
      const normY = (y + h / 2) / h;
      const maxR = (1 - normY) * 12;
      let angle = themeIdx === 0 ? y * 0.8 + i * 0.05 : themeIdx === 1 ? Math.random() * Math.PI * 2 : y * 0.4 + Math.sin(i * 0.01) * 2;
      let r = themeIdx === 1 ? maxR * Math.random() : maxR * (0.8 + Math.random() * 0.2);
      targets[i3] = Math.cos(angle) * r; targets[i3 + 1] = y; targets[i3 + 2] = Math.sin(angle) * r;
    }
    posTargetsRef.current = targets;
    if (treeRef.current && typeof window.gsap !== 'undefined') {
      const THREE = window.THREE;
      const tc = new THREE.Color(theme.color);
      const ca = treeRef.current.geometry.attributes.color;
      for (let i = 0; i < P_COUNT; i++) {
        window.gsap.to(ca.array, { [i * 3]: tc.r, [i * 3 + 1]: tc.g, [i * 3 + 2]: tc.b, duration: 1.2, onUpdate: () => { ca.needsUpdate = true; } });
      }
    }
  }, [theme]);

  return html`<div ref=${containerRef} className="absolute inset-0 z-0 bg-black" />`;
};

export default WinterScene;
