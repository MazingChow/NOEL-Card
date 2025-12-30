
import React, { useState, useEffect, useRef, useCallback } from 'react';
import htm from 'htm';
import { THEMES, STATIC_FORTUNES } from './constants';
import { GestureType } from './types';
import WinterScene from './components/WinterScene';
import UIOverlay from './components/UIOverlay';
import FortuneCard from './components/FortuneCard';
import { generateNewYearFortune } from './services/gemini';

const html = htm.bind(React.createElement);
declare const Hands: any;
declare const Camera: any;

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gesture, setGesture] = useState<GestureType>('NONE');
  const [currentThemeIdx, setCurrentThemeIdx] = useState(0);
  const [fortune, setFortune] = useState<string>('');
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<'searching' | 'tracking' | 'off'>('off');

  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<any>(null);
  const lastThemeSwitchRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchFortune = useCallback(async () => {
    const aiFortune = await generateNewYearFortune();
    setFortune(aiFortune || STATIC_FORTUNES[Math.floor(Math.random() * STATIC_FORTUNES.length)]);
  }, []);

  const handleResults = useCallback((results: any) => {
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
        }
        setGesture('V');
      } else if (pinchDist < 0.08) {
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
    if (gesture === 'PINCH' && !isCardVisible) {
      fetchFortune();
      setIsCardVisible(true);
    } else if (gesture === 'OPEN' && isCardVisible) {
      setIsCardVisible(false);
    }
    if (gesture !== 'NONE' && audioRef.current?.paused) audioRef.current.play().catch(() => {});
  }, [gesture, isCardVisible, fetchFortune]);

  const startApp = () => {
    setIsPlaying(true);
    setTrackingStatus('searching');
    const hands = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
    hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
    hands.onResults(handleResults);
    handsRef.current = hands;
    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => { if (handsRef.current) await handsRef.current.send({ image: videoRef.current }); },
        width: 640, height: 480
      });
      camera.start();
    }
  };

  return html`
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden">
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
      <audio ref=${audioRef} loop>
        <source src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Erik_Satie_-_Gymnopedie_No_1.ogg" type="audio/ogg" />
      </audio>
    </div>
  `;
};

export default App;
