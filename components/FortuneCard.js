
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
        duration: 1, 
        ease: "back.out(1.5)" 
      });
    } else {
      gsap.to(cardRef.current, { 
        opacity: 0, 
        scale: 0.9, 
        y: 20,
        duration: 0.6, 
        ease: "power2.in" 
      });
    }
  }, [isVisible]);

  return html`
    <div 
      ref=${cardRef} 
      className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none opacity-0 scale-95 translate-y-5"
    >
      <div className="w-[85%] max-w-sm glass-card p-1 text-center rounded-3xl overflow-hidden shadow-2xl">
        <div className="border border-[#d4af37]/20 m-2 p-10 flex flex-col items-center justify-center relative bg-black/40 rounded-2xl">
          <h2 className="text-[10px] tracking-[0.5em] text-[#d4af37] mb-8 uppercase font-zh">2026 岁末启示</h2>
          
          <div className="min-h-[4rem] flex items-center justify-center">
            <p className="text-xl text-white font-zh font-light leading-relaxed">
              ${text || "读取中..."}
            </p>
          </div>
          
          <div className="w-6 h-[1px] bg-[#d4af37]/30 my-8"></div>
          <p className="text-[8px] uppercase tracking-[0.3em] text-gray-500 font-zh italic">微光照亮前路</p>
        </div>
      </div>
    </div>
  `;
};

export default FortuneCard;
