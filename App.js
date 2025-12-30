
import React, { useState, useEffect, useRef, useCallback } from 'react';
import htm from 'htm';
import { THEMES, STATIC_FORTUNES } from './constants.js';
import WinterScene from './components/WinterScene.js';
import UIOverlay from './components/UIOverlay.js';
import FortuneCard from './components/FortuneCard.js';
import { generateNewYearFortune } from './services/gemini.js';

const html = htm.bind(React.createElement);

// 选用加载速度极快且风格契合的 CDN 资源
const AUDIO_ASSETS = {
  // 坂本龙一风格钢琴曲 (Merry Christmas Mr. Lawrence Style)
  BGM: 'https://assets.mixkit.co/music/preview/mixkit-christmas-magic-piano-617.mp3',
  // 交互反馈音效
  DING: 'https://assets.mixkit.co/sfx/preview/mixkit-simple-notification-ding-1589.mp3',
  REVEAL: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-shimmer-600.mp3',
  DISMISS: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-technology-select-3124.mp3'
};

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gesture, setGesture] = useState('NONE');
  const [currentThemeIdx, setCurrentThemeIdx] = useState(0);
  const [fortune, setFortune] = useState('');
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('off');
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef(null);
  const handsRef = useRef(null);
  const lastThemeSwitchRef = useRef(0);
  const prevGestureRef = useRef('NONE');
  const audioRef = useRef(null);
  
  // 预加载音效池
  const sfxPool = useRef(null);

  useEffect(() => {
    // 初始化音效实例
    sfxPool.current = {
      ding: new Audio(AUDIO_ASSETS.DING),
      reveal: new Audio(AUDIO_ASSETS.REVEAL),
      dismiss: new Audio(AUDIO_ASSETS.DISMISS)
    };
    // 预设音量
    Object.values(sfxPool.current).forEach(audio => {
      audio.volume = 0.5;
    });
  }, []);

  const playSFX = useCallback((type) => {
    if (isMuted || !sfxPool.current) return;
    const sound = sfxPool.current[type];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.warn("SFX play failed:", e));
    }
  }, [isMuted]);

  const toggleMusic = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      if (nextMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const triggerFortune = useCallback(async () => {
    const randomIdx = Math.floor(Math.random() * STATIC_FORTUNES.length);
    setFortune(STATIC_FORTUNES[randomIdx]);
    setIsCardVisible(true);
    playSFX('reveal');
    
    const aiFortune = await generateNewYearFortune();
    if (aiFortune) setFortune(aiFortune);
  }, [playSFX]);

  const handleResults = useCallback((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setTrackingStatus('tracking');
      const landmarks = results.multiHandLandmarks[0];
      const isIndexUp = landmarks[8].y < landmarks[6].y;
      const isMiddleUp = landmarks[12].y < landmarks[10].y;
      const pinchDist = Math.sqrt(Math.pow(landmarks[4].x - landmarks[8].x, 2) + Math.pow(landmarks[4].y - landmarks[8].y, 2));

      // 手势 V：切换主题
      if (isIndexUp && isMiddleUp && landmarks[16].y > landmarks[14].y) {
        if (Date.now() - lastThemeSwitchRef.current > 1500) {
          setCurrentThemeIdx(prev => (prev + 1) % THEMES.length);
          lastThemeSwitchRef.current = Date.now();
          playSFX('ding'); // 核心反馈：切换主题时的“叮”声
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
  }, [playSFX]);

  useEffect(() => {
    if (gesture !== prevGestureRef.current) {
      if (gesture === 'PINCH' && !isCardVisible) {
        triggerFortune();
      } else if (gesture === 'OPEN' && isCardVisible) {
        setIsCardVisible(false);
        playSFX('dismiss');
      }
      prevGestureRef.current = gesture;
    }
  }, [gesture, isCardVisible, triggerFortune, playSFX]);

  const startApp = () => {
    setIsPlaying(true);
    setTrackingStatus('searching');
    
    // 关键修复：在用户点击按钮的第一时间触发音频播放
    if (audioRef.current) {
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(err => {
        console.error("Audio play failed on start:", err);
      });
    }

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
        isMuted=${isMuted}
        onToggleMusic=${toggleMusic}
        onStart=${startApp} 
      />
      <${FortuneCard} isVisible=${isCardVisible} text=${fortune} />
      <video ref=${videoRef} className="hidden" playsInline muted />
      <audio ref=${audioRef} loop preload="auto">
        <source src=${AUDIO_ASSETS.BGM} type="audio/mpeg" />
      </audio>
    </div>
  `;
};

export default App;
