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
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center">
        {/* 游戏标题 */}
        <h1 className="text-6xl font-bold text-white mb-4 tracking-wider">
          遗忘的像素魔法大陆
        </h1>
        <p className="text-xl text-gray-400 mb-12">Forgotten Pixel Realm</p>

        {/* 菜单按钮 */}
        <div className="space-y-4">
          <MenuButton onClick={onStartGame}>开始游戏</MenuButton>
          
          {hasSaveData && (
            <MenuButton onClick={onContinueGame}>继续游戏</MenuButton>
          )}
          
          <MenuButton onClick={onSettings}>设置</MenuButton>
          
          <MenuButton onClick={onExit}>退出游戏</MenuButton>
        </div>

        {/* 版本信息 */}
        <p className="text-gray-600 text-sm mt-12">v0.5.4</p>
      </div>
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
      className="w-64 px-6 py-3 bg-gray-800 text-white border-2 border-gray-600 
                 hover:bg-gray-700 hover:border-white transition-all duration-200
                 text-lg font-semibold"
    >
      {children}
    </button>
  );
};
