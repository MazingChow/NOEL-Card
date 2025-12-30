
import React, { useEffect, useRef } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const FortuneCard = ({ isVisible, text }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current || typeof window.gsap === 'undefined') return;
    const gsap = window.gsap;
    if (isVisible) {
      gsap.to(cardRef.current, { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power3.out" 
      });
    } else {
      gsap.to(cardRef.current, { 
        opacity: 0, 
        scale: 0.9, 
        y: 30,
        duration: 0.5, 
        ease: "power2.in" 
      });
    }
  }, [isVisible]);

  return html`
    <div 
      ref=${cardRef} 
      className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none opacity-0 scale-90 translate-y-10"
    >
      <div className="w-[90%] max-w-[340px] glass-card p-[2px] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-[#d4af37]/20 m-1 p-10 flex flex-col items-center justify-center rounded-[1.8rem]">
          <h2 className="text-[10px] tracking-[0.6em] text-[#d4af37] mb-10 uppercase font-zh font-bold">2026 岁末启示</h2>
          
          <div className="min-h-[120px] flex items-center justify-center w-full px-4">
            <p className="text-xl text-white font-zh font-light leading-relaxed text-center animate-in fade-in duration-700">
              ${text || "读取天机中..."}
            </p>
          </div>
          
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent my-10"></div>
          
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-zh italic opacity-70">
            冬日已尽，繁花可期
          </p>
        </div>
      </div>
    </div>
  `;
};

export default FortuneCard;
