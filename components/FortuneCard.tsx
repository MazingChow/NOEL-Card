
import React, { useEffect, useRef } from 'react';

declare const gsap: any;

interface FortuneCardProps {
  isVisible: boolean;
  text: string;
}

const FortuneCard: React.FC<FortuneCardProps> = ({ isVisible, text }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    
    if (isVisible) {
      gsap.to(cardRef.current, { 
        opacity: 1, 
        scale: 1, 
        y: "-50%", 
        duration: 1, 
        ease: "back.out(1.5)" 
      });
    } else {
      triggerDissolve();
      gsap.to(cardRef.current, { 
        opacity: 0, 
        scale: 1.1, 
        duration: 0.6, 
        ease: "power2.in" 
      });
    }
  }, [isVisible]);

  const triggerDissolve = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'absolute bg-[#d4af37] rounded-full pointer-events-none z-30';
      const s = Math.random() * 5 + 2;
      Object.assign(p.style, {
        width: s + 'px', 
        height: s + 'px',
        left: (rect.left + rect.width / 2) + 'px',
        top: (rect.top + rect.height / 2) + 'px',
        boxShadow: '0 0 15px #d4af37'
      });
      document.body.appendChild(p);

      gsap.to(p, {
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 500,
        opacity: 0,
        scale: 0,
        duration: 1.2,
        onComplete: () => p.remove()
      });
    }
  };

  return (
    <div 
      ref={cardRef} 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm glass-card p-10 text-center rounded-3xl z-20 opacity-0 scale-95 pointer-events-none shadow-[0_0_50px_rgba(212,175,55,0.1)]"
    >
      <div className="border border-[#d4af37]/20 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#d4af37]/40"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#d4af37]/40"></div>
        
        <h2 className="text-[10px] tracking-[0.5em] text-[#d4af37] mb-8 uppercase font-zh">2026 岁末启示</h2>
        <p className="text-lg text-white font-zh font-light leading-relaxed mb-10 px-2 min-h-[3rem]">
          {text || "..."}
        </p>
        <div className="w-6 h-[1px] bg-[#d4af37]/30 mb-6"></div>
        <p className="text-[8px] uppercase tracking-[0.3em] text-gray-500 font-zh italic">微光照亮前路</p>
      </div>
    </div>
  );
};

export default FortuneCard;
