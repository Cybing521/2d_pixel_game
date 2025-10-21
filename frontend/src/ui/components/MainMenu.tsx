// 主菜单组件
import React from 'react';

interface MainMenuProps {
  onStartGame: () => void;
  onContinueGame: () => void;
  onSettings: () => void;
  onExit: () => void;
  hasSaveData: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onContinueGame,
  onSettings,
  onExit,
  hasSaveData,
}) => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #4a1a4a 0%, #7a3a7a 25%, #d4729b 50%, #ffb5d5 75%, #ffd4a3 100%)',
        imageRendering: 'pixelated'
      }}
    >
      {/* 装饰性像素云朵 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-16 opacity-30"
            style={{
              background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
              left: `${(i * 15) % 100}%`,
              top: `${10 + (i * 12) % 60}%`,
              animation: `float ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* 主内容容器 - 像素风格 */}
      <div 
        className="relative text-center bg-black/40 backdrop-blur-sm border-8 border-yellow-400 p-12"
        style={{
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), inset 0 0 32px rgba(255, 215, 0, 0.1)'
        }}
      >
        {/* 标题装饰框 */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 border-4 border-black px-8 py-2">
          <div className="text-black font-black text-sm" style={{ fontFamily: 'monospace' }}>
            ★ PIXEL ADVENTURE ★
          </div>
        </div>

        {/* 游戏标题 - 像素风格 */}
        <h1 
          className="text-6xl font-black text-yellow-400 mb-2 tracking-wider"
          style={{
            fontFamily: 'monospace',
            textShadow: '4px 4px 0 #000, 6px 6px 0 rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.1em'
          }}
        >
          遗忘的像素大陆
        </h1>
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-4"></div>
        <p 
          className="text-2xl text-pink-300 mb-12 font-bold"
          style={{
            fontFamily: 'monospace',
            textShadow: '2px 2px 0 #000'
          }}
        >
          ► FORGOTTEN PIXEL REALM ◄
        </p>

        {/* 菜单按钮 - 像素风格 */}
        <div className="space-y-4 relative z-10">
          <MenuButton onClick={onStartGame}>开始游戏</MenuButton>
          
          {hasSaveData && (
            <MenuButton onClick={onContinueGame}>继续游戏</MenuButton>
          )}
          
          <MenuButton onClick={onSettings}>设置</MenuButton>
          
          <MenuButton onClick={onExit}>退出游戏</MenuButton>
        </div>

        {/* 版本信息 - 像素风格 */}
        <div className="mt-12 pt-8 border-t-4 border-yellow-400/30">
          <p 
            className="text-yellow-300 text-sm font-bold"
            style={{ fontFamily: 'monospace' }}
          >
            VERSION 0.7.0 BETA
          </p>
          <p 
            className="text-pink-300 text-xs mt-2"
            style={{ fontFamily: 'monospace' }}
          >
            PIXEL ART EDITION
          </p>
        </div>
      </div>

      {/* CSS动画 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
      `}</style>
    </div>
  );
};

const MenuButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className="w-80 px-8 py-4 bg-gradient-to-b from-purple-700 to-purple-900 
                 text-white border-4 border-pink-400
                 hover:from-purple-600 hover:to-purple-800 hover:border-yellow-400 
                 active:translate-y-1
                 transition-all duration-150
                 text-xl font-black relative group"
      style={{
        fontFamily: 'monospace',
        textShadow: '2px 2px 0 #000',
        boxShadow: '0 6px 0 #1a0a2a, 0 8px 16px rgba(0, 0, 0, 0.5)',
        imageRendering: 'pixelated'
      }}
    >
      {/* 按钮光晕效果 */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                       opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></span>
      
      {/* 按钮文本 */}
      <span className="relative z-10">► {children} ◄</span>
      
      {/* 像素装饰 */}
      <span className="absolute top-1 right-2 w-2 h-2 bg-yellow-400 opacity-50"></span>
      <span className="absolute bottom-1 left-2 w-2 h-2 bg-pink-400 opacity-50"></span>
    </button>
  );
};
