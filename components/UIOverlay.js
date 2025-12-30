
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const UIOverlay = ({ isPlaying, trackingStatus, gesture, themeName, isMuted, onToggleMusic, onStart }) => {
  return html`
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 sm:p-10">
      <div className="flex justify-between items-start w-full">
        <div className="opacity-90">
          <h1 className="text-2xl sm:text-3xl tracking-[0.4em] text-[#d4af37] drop-shadow-lg">NOËL</h1>
          <p className="text-[10px] text-gray-400 mt-2 tracking-[0.25em] uppercase font-zh">交互式冬日启示录</p>
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick=${onToggleMusic} 
            className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-[#d4af37]/40 bg-black/40 backdrop-blur-xl transition-all active:scale-90 hover:border-[#d4af37]/80"
          >
            ${isMuted ? html`
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ` : html`
              <div className="flex items-center justify-center gap-[2px]">
                <div className="w-1 h-3 bg-[#d4af37] animate-[bounce_1s_infinite_0.1s]"></div>
                <div className="w-1 h-4 bg-[#d4af37] animate-[bounce_1s_infinite_0.3s]"></div>
                <div className="w-1 h-2 bg-[#d4af37] animate-[bounce_1s_infinite_0.5s]"></div>
              </div>
            `}
          </button>

          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
            <div className=${`w-2 h-2 rounded-full ${trackingStatus === 'tracking' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : trackingStatus === 'searching' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] tracking-widest uppercase text-gray-300 font-medium">${trackingStatus}</span>
          </div>
        </div>
      </div>

      ${!isPlaying && html`
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/98 z-50 pointer-events-auto">
          <div className="relative text-center px-6">
            <div className="mb-8 relative">
               <div className="absolute inset-0 blur-3xl bg-[#d4af37]/20 rounded-full animate-pulse"></div>
               <div className="loader ease-linear rounded-full border-b-2 border-[#d4af37] h-12 w-12 animate-spin mx-auto relative z-10"></div>
            </div>
            <h2 className="text-[#d4af37] tracking-[0.6em] mb-4 font-zh text-xl font-light">圣诞夜启示录</h2>
            <p className="text-gray-400 text-[11px] tracking-widest mb-10 uppercase leading-relaxed">
              沉浸式声色体验<br/>请开启相机并确保音量适中
            </p>
            <button 
              onClick=${onStart} 
              className="group relative px-12 py-4 overflow-hidden border border-[#d4af37]/50 text-[#d4af37] transition-all hover:text-black tracking-[0.3em] uppercase text-xs active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
            >
              <span className="relative z-10 font-bold">开启交互</span>
              <div className="absolute inset-0 bg-[#d4af37] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      `}

      <div className="w-full text-center pb-6">
        <div className="inline-block px-6 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gray-300 font-zh">
            ${gesture === 'NONE' ? '等待手势指令...' : gesture === 'V' ? `切换主题 / ${themeName}` : gesture === 'PINCH' ? '读取启示中...' : '准备就绪'}
          </p>
        </div>
      </div>
    </div>
  `;
};

export default UIOverlay;
