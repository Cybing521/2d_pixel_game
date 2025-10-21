// React应用根组件
import { useEffect, useRef, useState } from 'react';
import { Game } from './game';
import { GameUI } from './ui/components/GameUI';
import { MainMenu } from './ui/components/MainMenu';
import { SettingsMenu } from './ui/components/SettingsMenu';
import { useGameStore } from './store/gameStore';
import './index.css';

function App() {
  const gameRef = useRef<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // 检查是否有存档（使用 Zustand persist 的存储）
    const savedData = localStorage.getItem('forgotten-realm-storage');
    setHasSaveData(savedData !== null);

    // 初始化游戏
    if (!gameRef.current) {
      gameRef.current = new Game('game-container');
    }

    return () => {
      // 清理游戏实例
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, []);

  const handleStartGame = () => {
    // 开始新游戏：重置所有数据
    const resetGame = useGameStore.getState().resetGame;
    resetGame();
    
    // 清空 LocalStorage 中的存档
    localStorage.removeItem('forgotten-realm-storage');
    
    // 启动游戏
    setGameStarted(true);
    setHasSaveData(false);
    
    // 通知 Phaser 启动游戏场景
    if (gameRef.current) {
      gameRef.current.startGameScene();
    }
    
    console.log('开始新游戏');
  };

  const handleContinueGame = () => {
    // 继续游戏：使用持久化的数据
    // Zustand persist 会自动加载数据，无需手动操作
    
    setGameStarted(true);
    
    // 通知 Phaser 启动游戏场景
    if (gameRef.current) {
      gameRef.current.startGameScene();
    }
    
    console.log('继续游戏，加载已保存的进度');
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleExit = () => {
    // 在浏览器环境中，通常不能直接关闭窗口
    if (window.confirm('确定要退出游戏吗？')) {
      window.close();
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden" style={{ background: '#4a1a4a' }}>
      {/* Phaser游戏容器 */}
      <div id="game-container" className="w-full h-full" style={{ imageRendering: 'pixelated' }} />

      {/* React UI覆盖层 */}
      {gameStarted ? (
        <GameUI />
      ) : (
        <MainMenu
          onStartGame={handleStartGame}
          onContinueGame={handleContinueGame}
          onSettings={handleSettings}
          onExit={handleExit}
          hasSaveData={hasSaveData}
        />
      )}
      
      {/* 设置菜单 */}
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
