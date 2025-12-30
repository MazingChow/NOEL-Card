
import React, { useEffect, useRef } from 'react';
import { Theme, GestureType } from '../types';

declare const THREE: any;

interface WinterSceneProps {
  theme: Theme;
  gesture: GestureType;
}

const WinterScene: React.FC<WinterSceneProps> = ({ theme, gesture }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const treeRef = useRef<any>(null);
  const composerRef = useRef<any>(null);
  const bloomRef = useRef<any>(null);
  const posTargetsRef = useRef<Float32Array | null>(null);

  const P_COUNT = 6500;

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.003);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 
      2.0, 0.4, 0.85
    );
    bloomPass.threshold = 0.2;
    bloomPass.strength = 2.0;
    bloomRef.current = bloomPass;

    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Particle Geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(P_COUNT * 3);
    const colors = new Float32Array(P_COUNT * 3);

    const initialPositions = new Float32Array(P_COUNT * 3);
    for (let i = 0; i < P_COUNT * 3; i++) {
      initialPositions[i] = (Math.random() - 0.5) * 60;
      colors[i] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85
    });

    const tree = new THREE.Points(geometry, material);
    scene.add(tree);
    treeRef.current = tree;

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      if (treeRef.current && posTargetsRef.current) {
        const posAttr = treeRef.current.geometry.attributes.position;
        const lerp = gesture === 'PINCH' ? 0.09 : 0.04;
        
        for (let i = 0; i < P_COUNT * 3; i++) {
          let target = gesture === 'PINCH' ? posTargetsRef.current[i] * 0.1 : posTargetsRef.current[i];
          posAttr.array[i] += (target - posAttr.array[i]) * lerp;
          if (i % 3 === 0) posAttr.array[i] += Math.sin(time * 2 + i) * 0.03;
        }
        posAttr.needsUpdate = true;
        treeRef.current.rotation.y += gesture === 'PINCH' ? 0.005 : theme.speed;
      }

      if (bloomRef.current) {
        bloomRef.current.strength = theme.bloom + Math.sin(time * 2) * 0.3;
      }

      composer.render();
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Update particle targets based on theme
  useEffect(() => {
    const targets = new Float32Array(P_COUNT * 3);
    const h = 35;
    const themeIdx = THEME_TO_IDX[theme.name];

    for (let i = 0; i < P_COUNT; i++) {
      const i3 = i * 3;
      const y = (i / P_COUNT) * h - h / 2;
      const normY = (y + h / 2) / h;
      const maxR = (1 - normY) * 12;

      let angle, r;
      if (themeIdx === 0) { // Classic
        angle = y * 0.8 + i * 0.05;
        r = maxR * (0.8 + Math.random() * 0.2);
      } else if (themeIdx === 1) { // Snow
        angle = Math.random() * Math.PI * 2;
        r = maxR * Math.random();
      } else if (themeIdx === 2) { // Aurora
        angle = y * 0.4 + Math.sin(i * 0.01) * 2;
        r = maxR * (0.9 + Math.random() * 0.1);
      } else { // Ruby
        angle = (i * 0.1) + Math.cos(y * 0.5);
        r = maxR * 0.85;
      }

      targets[i3] = Math.cos(angle) * r;
      targets[i3 + 1] = y;
      targets[i3 + 2] = Math.sin(angle) * r;
    }
    posTargetsRef.current = targets;

    // Smooth color change
    if (treeRef.current) {
      const targetColor = new THREE.Color(theme.color);
      const colorAttr = treeRef.current.geometry.attributes.color;
      for (let i = 0; i < P_COUNT; i++) {
        // @ts-ignore
        gsap.to(colorAttr.array, {
          [i * 3]: targetColor.r,
          [i * 3 + 1]: targetColor.g,
          [i * 3 + 2]: targetColor.b,
          duration: 1.2,
          onUpdate: () => { colorAttr.needsUpdate = true; }
        });
      }
    }
  }, [theme]);

  const THEME_TO_IDX: Record<string, number> = {
    'Classic Gold': 0,
    'Crystal Snow': 1,
    'Midnight Aurora': 2,
    'Royal Ruby': 3
  };

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};

export default WinterScene;
