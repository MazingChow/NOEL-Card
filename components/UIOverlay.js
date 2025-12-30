
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const UIOverlay = ({ isPlaying, trackingStatus, gesture, themeName, onStart }) => {
  return html`
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8">
      <div className="flex justify-between items-start">
        <div className="opacity-80">
          <h1 className="text-2xl tracking-[0.3em] text-[#d4af37]">NOËL</h1>
          <p className="text-[9px] text-gray-400 mt-1 tracking-[0.2em] uppercase font-zh">交互式冬日启示录</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <div className=${`w-1.5 h-1.5 rounded-full ${trackingStatus === 'tracking' ? 'bg-green-500 animate-pulse' : trackingStatus === 'searching' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[9px] tracking-widest uppercase text-gray-500">${trackingStatus.toUpperCase()}</span>
          </div>
        </div>
      </div>

      ${!isPlaying && html`
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 pointer-events-auto">
          <div className="loader ease-linear rounded-full border-2 border-t-2 border-[#d4af37] h-10 w-10 mb-6 animate-spin"></div>
          <h2 className="text-[#d4af37] tracking-[0.5em] mb-4 font-zh">沉浸式圣诞夜</h2>
          <button onClick=${onStart} className="mt-4 px-10 py-3 border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all tracking-widest uppercase text-[10px]">开启交互</button>
        </div>
      `}

      <div className="text-center opacity-40 pb-4">
        <p className="text-[9px] tracking-[0.4em] uppercase text-gray-400 font-zh">
          ${gesture === 'NONE' ? '等待手势指令...' : gesture === 'V' ? `切换至主题: ${themeName}` : gesture === 'PINCH' ? '唤起岁末之灵...' : '感应中...'}
        </p>
      </div>
    </div>
  `;
};

export default UIOverlay;
