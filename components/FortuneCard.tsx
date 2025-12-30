
import React, { useEffect, useRef } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);
declare const gsap: any;

const FortuneCard: React.FC<{ isVisible: boolean; text: string; }> = ({ isVisible, text }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || typeof gsap === 'undefined') return;
    if (isVisible) {
      gsap.to(cardRef.current, { opacity: 1, scale: 1, y: "-50%", duration: 1, ease: "back.out(1.5)" });
    } else {
      gsap.to(cardRef.current, { opacity: 0, scale: 1.1, duration: 0.6, ease: "power2.in" });
    }
  }, [isVisible]);

  return html`
    <div ref=${cardRef} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm glass-card p-10 text-center rounded-3xl z-20 opacity-0 scale-95 pointer-events-none">
      <div className="border border-[#d4af37]/20 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <h2 className="text-[10px] tracking-[0.5em] text-[#d4af37] mb-8 uppercase font-zh">2026 岁末启示</h2>
        <p className="text-lg text-white font-zh font-light leading-relaxed mb-10 px-2 min-h-[3rem]">${text || "..."}</p>
        <div className="w-6 h-[1px] bg-[#d4af37]/30 mb-6"></div>
        <p className="text-[8px] uppercase tracking-[0.3em] text-gray-500 font-zh italic">微光照亮前路</p>
      </div>
    </div>
  `;
};

export default FortuneCard;
