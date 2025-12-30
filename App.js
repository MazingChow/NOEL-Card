
import React, { useState, useEffect, useRef, useCallback } from 'react';
import htm from 'htm';
import { THEMES, STATIC_FORTUNES } from './constants.js';
import WinterScene from './components/WinterScene.js';
import UIOverlay from './components/UIOverlay.js';
import FortuneCard from './components/FortuneCard.js';
import { generateNewYearFortune } from './services/gemini.js';

const html = htm.bind(React.createElement);

// 选用在中国区域加载更稳定的音频资源（Pixabay 加速节点）
const AUDIO_ASSETS = {
  // 钢琴曲：风格接近《Merry Christmas Mr. Lawrence》
  BGM: 'https://cdn.pixabay.com/audio/2022/11/22/audio_feb376e3d2.mp3',
  // 交互音效：清脆的“叮”
  DING: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c976d8b63e.mp3',
  // 展开音效：轻柔魔法声
  REVEAL: 'https://cdn.pixabay.com/audio/2022/10/30/audio_145b597148.mp3',
  // 关闭音效
  DISMISS: 'https://cdn.pixabay.com/audio/2022/03/15/audio_730248405a.mp3'
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
  const sfxPool = useRef({});

  // 初始化音效（但不播放）
  useEffect(() => {
    sfxPool.current = {
      ding: new Audio(AUDIO_ASSETS.DING),
      reveal: new Audio(AUDIO_ASSETS.REVEAL),
      dismiss: new Audio(AUDIO_ASSETS.DISMISS)
    };
    Object.values(sfxPool.current).forEach(audio => {
      audio.preload = 'auto';
      audio.volume = 0.5;
    });
  }, []);

  const playSFX = useCallback((type) => {
    if (isMuted || !sfxPool.current[type]) return;
    const sound = sfxPool.current[type];
    sound.currentTime = 0;
    sound.play().catch(e => console.log("SFX Blocked:", e));
  }, [isMuted]);

  const toggleMusic = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      if (nextMuted) audioRef.current.pause();
      else audioRef.current.play().catch(() => {});
    }
  };

  const startApp = async () => {
    setIsPlaying(true);
    setTrackingStatus('searching');
    
    // 关键步骤：在用户点击按钮时“解锁”所有音频
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      try {
        await audioRef.current.play();
      } catch (err) {
        console.error("BGM Start Failed:", err);
      }
    }
    
    // 同时解锁 SFX 对象池
    Object.values(sfxPool.current).forEach(s => {
      s.play().then(() => {
        s.pause();
        s.currentTime = 0;
      }).catch(() => {});
    });

    // 初始化 MediaPipe
    if (window.Hands) {
      const hands = new window.Hands({ 
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` 
      });
      hands.setOptions({ 
        maxNumHands: 1, 
        modelComplexity: 0, 
        minDetectionConfidence: 0.5, 
        minTrackingConfidence: 0.5 
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

  const handleResults = useCallback((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setTrackingStatus('tracking');
      const landmarks = results.multiHandLandmarks[0];
      const isIndexUp = landmarks[8].y < landmarks[6].y;
      const isMiddleUp = landmarks[12].y < landmarks[10].y;
      const pinchDist = Math.sqrt(Math.pow(landmarks[4].x - landmarks[8].x, 2) + Math.pow(landmarks[4].y - landmarks[8].y, 2));

      if (isIndexUp && isMiddleUp && landmarks[16].y > landmarks[14].y) {
        if (Date.now() - lastThemeSwitchRef.current > 1800) {
          setCurrentThemeIdx(prev => (prev + 1) % THEMES.length);
          lastThemeSwitchRef.current = Date.now();
          playSFX('ding'); // 交互反馈：叮！
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
        setIsCardVisible(true);
        const randomIdx = Math.floor(Math.random() * STATIC_FORTUNES.length);
        setFortune(STATIC_FORTUNES[randomIdx]);
        playSFX('reveal');
        generateNewYearFortune().then(f => f && setFortune(f));
      } else if (gesture === 'OPEN' && isCardVisible) {
        setIsCardVisible(false);
        playSFX('dismiss');
      }
      prevGestureRef.current = gesture;
    }
  }, [gesture, isCardVisible, playSFX]);

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
      <audio ref=${audioRef} loop crossOrigin="anonymous">
        <source src=${AUDIO_ASSETS.BGM} type="audio/mpeg" />
      </audio>
    </div>
  `;
};

export default App;
