
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const UIOverlay = ({ isPlaying, trackingStatus, gesture, themeName, isMuted, onToggleMusic, onStart }) => {
  return html`
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
      <div className="flex justify-between items-start w-full">
        <div className="opacity-80">
          <h1 className="text-2xl tracking-[0.3em] text-[#d4af37]">NOËL</h1>
          <p className="text-[9px] text-gray-400 mt-1 tracking-[0.2em] uppercase font-zh">交互式冬日启示录</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick=${onToggleMusic} 
              className="group relative flex items-center justify-center w-8 h-8 rounded-full border border-[#d4af37]/30 bg-black/20 backdrop-blur-md transition-all active:scale-90 hover:border-[#d4af37]/60"
              title=${isMuted ? "播放音乐" : "静音"}
            >
              ${isMuted ? html`
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ` : html`
                <div className="relative flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-[#d4af37]">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <span className="absolute inset-0 rounded-full border border-[#d4af37] animate-ping opacity-20"></span>
                </div>
              `}
            </button>

            <div className="flex items-center gap-2">
              <div className=${`w-1.5 h-1.5 rounded-full ${trackingStatus === 'tracking' ? 'bg-green-500 animate-pulse' : trackingStatus === 'searching' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[9px] tracking-widest uppercase text-gray-500">${trackingStatus.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      ${!isPlaying && html`
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 pointer-events-auto">
          <div className="text-center">
            <div className="loader ease-linear rounded-full border-2 border-t-2 border-[#d4af37] h-10 w-10 mb-6 animate-spin mx-auto"></div>
            <h2 className="text-[#d4af37] tracking-[0.5em] mb-4 font-zh text-lg">圣诞夜启示录</h2>
            <p className="text-gray-500 text-[10px] tracking-widest mb-8 uppercase px-4">建议佩戴耳机，点击开启声色体验</p>
            <button onClick=${onStart} className="px-10 py-3 border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all tracking-widest uppercase text-[10px] active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)]">开启交互</button>
          </div>
        </div>
      `}

      <div className="w-full text-center opacity-40 pb-4">
        <p className="text-[9px] tracking-[0.4em] uppercase text-gray-400 font-zh">
          ${gesture === 'NONE' ? '等待手势指令...' : gesture === 'V' ? `切换主题 / 主题: ${themeName}` : gesture === 'PINCH' ? '唤起岁末之灵...' : '感应中...'}
        </p>
      </div>
    </div>
  `;
};

export default UIOverlay;
