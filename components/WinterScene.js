
import React, { useEffect, useRef } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

// 移动端极致性能模式
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const P_COUNT = isMobile ? 1800 : 5000; // 进一步下调粒子数

const THEME_TO_IDX = {
  'Classic Gold': 0, 'Crystal Snow': 1, 'Midnight Aurora': 2, 'Royal Ruby': 3
};

const WinterScene = ({ theme, gesture }) => {
  const containerRef = useRef(null);
  const treeRef = useRef(null);
  const bloomRef = useRef(null);
  const posTargetsRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current || typeof window.THREE === 'undefined') return;
    const THREE = window.THREE;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.003);
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 35);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // 强制关闭抗锯齿，换取极致流畅度
      alpha: true, 
      powerPreference: "high-performance" 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = 'block';
    containerRef.current.appendChild(renderer.domElement);

    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 
      theme.bloom, 
      0.4, 
      0.85
    );
    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    composer.addPass(bloomPass);
    bloomRef.current = bloomPass;

    const geometry = new THREE.BufferGeometry();
    const pos = new Float32Array(P_COUNT * 3);
    const cols = new Float32Array(P_COUNT * 3);
    for (let i = 0; i < P_COUNT * 3; i++) { 
      pos[i] = (Math.random() - 0.5) * 60; 
      cols[i] = 1.0; 
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const tree = new THREE.Points(geometry, new THREE.PointsMaterial({ 
      size: isMobile ? 0.25 : 0.15, 
      vertexColors: true, 
      blending: THREE.AdditiveBlending, 
      transparent: true, 
      opacity: 0.8 
    }));
    scene.add(tree);
    treeRef.current = tree;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      const id = requestAnimationFrame(animate);
      timeRef.current += 0.012;
      
      if (treeRef.current && posTargetsRef.current) {
        const p = treeRef.current.geometry.attributes.position;
        const lerpFactor = gesture === 'PINCH' ? 0.08 : 0.04;
        
        // 性能关键：循环展开或跳跃更新
        for (let i = 0; i < P_COUNT * 3; i += 3) {
          let tX = gesture === 'PINCH' ? posTargetsRef.current[i] * 0.15 : posTargetsRef.current[i];
          let tY = gesture === 'PINCH' ? posTargetsRef.current[i+1] * 0.15 : posTargetsRef.current[i+1];
          let tZ = gesture === 'PINCH' ? posTargetsRef.current[i+2] * 0.15 : posTargetsRef.current[i+2];

          p.array[i] += (tX - p.array[i]) * lerpFactor;
          p.array[i+1] += (tY - p.array[i+1]) * lerpFactor;
          p.array[i+2] += (tZ - p.array[i+2]) * lerpFactor;

          if (i % 18 === 0) { // 减少抖动计算密度
            p.array[i] += Math.sin(timeRef.current + i) * 0.015;
          }
        }
        p.needsUpdate = true;
        treeRef.current.rotation.y += gesture === 'PINCH' ? 0.002 : theme.speed;
      }
      
      composer.render();
      return id;
    };
    const animID = animate();

    return () => { 
      cancelAnimationFrame(animID); 
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
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
      
      let angle;
      if (themeIdx === 0) angle = y * 0.8 + i * 0.05;
      else if (themeIdx === 1) angle = Math.random() * Math.PI * 2;
      else if (themeIdx === 2) angle = y * 0.4 + Math.sin(i * 0.01) * 2;
      else angle = y * 1.2 + Math.cos(i * 0.02) * 1.5;

      let r = themeIdx === 1 ? maxR * Math.random() : maxR * (0.8 + Math.random() * 0.2);
      targets[i3] = Math.cos(angle) * r;
      targets[i3 + 1] = y;
      targets[i3 + 2] = Math.sin(angle) * r;
    }
    posTargetsRef.current = targets;

    if (treeRef.current && typeof window.gsap !== 'undefined') {
      const THREE = window.THREE;
      const tc = new THREE.Color(theme.color);
      const ca = treeRef.current.geometry.attributes.color;
      window.gsap.to(ca.array, {
        endArray: Array.from({ length: P_COUNT }, () => [tc.r, tc.g, tc.b]).flat(),
        duration: 0.8,
        onUpdate: () => { ca.needsUpdate = true; }
      });
    }
    if (bloomRef.current) bloomRef.current.strength = theme.bloom;
  }, [theme]);

  return html`<div ref=${containerRef} className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden" />`;
};

export default WinterScene;
