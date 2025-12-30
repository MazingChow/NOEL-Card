
import React, { useState, useEffect, useRef, useCallback } from 'react';
import htm from 'htm';
import { THEMES, STATIC_FORTUNES } from './constants.js';
import WinterScene from './components/WinterScene.js';
import UIOverlay from './components/UIOverlay.js';
import FortuneCard from './components/FortuneCard.js';
import { generateNewYearFortune } from './services/gemini.js';

const html = htm.bind(React.createElement);

// 音效素材配置（采用极速加载的 CDN）
const SFX = {
  THEME_SWITCH: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-shimmer-600.mp3',
  REVEAL: 'https://assets.mixkit.co/sfx/preview/mixkit-spell-cast-shimmer-3108.mp3',
  DISMISS: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3'
};

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gesture, setGesture] = useState('NONE');
  const [currentThemeIdx, setCurrentThemeIdx] = useState(0);
  const [fortune, setFortune] = useState('');
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('off');

  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const lastThemeSwitchRef = useRef(0);
  const prevGestureRef = useRef('NONE');
  const audioRef = useRef(null);
  const sfxRef = useRef({
    theme: new Audio(SFX.THEME_SWITCH),
    reveal: new Audio(SFX.REVEAL),
    dismiss: new Audio(SFX.DISMISS)
  });

  // 播放交互音效的辅助函数
  const playSFX = (type) => {
    const sound = sfxRef.current[type];
    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.4;
      sound.play().catch(() => {});
    }
  };

  const triggerFortune = useCallback(async () => {
    const randomIdx = Math.floor(Math.random() * STATIC_FORTUNES.length);
    setFortune(STATIC_FORTUNES[randomIdx]);
    setIsCardVisible(true);
    playSFX('reveal'); // 播放开启音效
    
    const aiFortune = await generateNewYearFortune();
    if (aiFortune) setFortune(aiFortune);
  }, []);

  const handleResults = useCallback((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setTrackingStatus('tracking');
      const landmarks = results.multiHandLandmarks[0];
      const isIndexUp = landmarks[8].y < landmarks[6].y;
      const isMiddleUp = landmarks[12].y < landmarks[10].y;
      const pinchDist = Math.sqrt(Math.pow(landmarks[4].x - landmarks[8].x, 2) + Math.pow(landmarks[4].y - landmarks[8].y, 2));

      if (isIndexUp && isMiddleUp && landmarks[16].y > landmarks[14].y) {
        if (Date.now() - lastThemeSwitchRef.current > 1500) {
          setCurrentThemeIdx(prev => (prev + 1) % THEMES.length);
          lastThemeSwitchRef.current = Date.now();
          playSFX('theme'); // 播放切换主题音效
        }
        setGesture('V');
      } else if (pinchDist < 0.1) {
        setGesture('PINCH');
      } else {
        setGesture('OPEN');
      }
    } else {
      setTrackingStatus('searching');
      setGesture('NONE');
    }
  }, []);

  useEffect(() => {
    // 仅在手势发生真正变化时处理状态
    if (gesture !== prevGestureRef.current) {
      if (gesture === 'PINCH' && !isCardVisible) {
        triggerFortune();
      } else if (gesture === 'OPEN' && isCardVisible) {
        setIsCardVisible(false);
        playSFX('dismiss'); // 播放关闭音效
      }
      prevGestureRef.current = gesture;
    }

    if (gesture !== 'NONE' && audioRef.current?.paused) {
      audioRef.current.play().catch(() => {});
    }
  }, [gesture, isCardVisible, triggerFortune]);

  const startApp = () => {
    setIsPlaying(true);
    setTrackingStatus('searching');
    if (window.Hands) {
      const hands = new window.Hands({ 
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` 
      });
      hands.setOptions({ 
        maxNumHands: 1, 
        modelComplexity: 0, 
        minDetectionConfidence: 0.55, 
        minTrackingConfidence: 0.55 
      });
      hands.onResults(handleResults);
      handsRef.current = hands;
    }
    if (videoRef.current && window.Camera) {
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => { 
          if (handsRef.current) await handsRef.current.send({ image: videoRef.current }); 
        },
        width: 320, 
        height: 240
      });
      camera.start();
    }
  };

  return html`
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden flex items-center justify-center">
      <${WinterScene} theme=${THEMES[currentThemeIdx]} gesture=${gesture} />
      <${UIOverlay} 
        isPlaying=${isPlaying} 
        trackingStatus=${trackingStatus} 
        gesture=${gesture} 
        themeName=${THEMES[currentThemeIdx].name}
        onStart=${startApp} 
      />
      <${FortuneCard} isVisible=${isCardVisible} text=${fortune} />
      <video ref=${videoRef} className="hidden" playsInline muted />
      <audio ref=${audioRef} loop preload="auto">
        <source src="https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3" type="audio/mpeg" />
      </audio>
    </div>
  `;
};

export default App;
