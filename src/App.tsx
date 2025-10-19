// React应用根组件
import React, { useEffect, useRef, useState } from 'react';
import { Game } from './game';
import { GameUI } from './ui/components/GameUI';
import { MainMenu } from './ui/components/MainMenu';
import { SaveSystem } from './game/systems/SaveSystem';
import './index.css';

function App() {
  const gameRef = useRef<Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [hasSaveData, setHasSaveData] = useState(false);

  useEffect(() => {
    // 检查是否有存档
    setHasSaveData(SaveSystem.exists());

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
    setGameStarted(true);
    // TODO: 通知Phaser开始游戏
  };

  const handleContinueGame = () => {
    const saveData = SaveSystem.load();
    if (saveData) {
      setGameStarted(true);
      // TODO: 加载存档数据到游戏
    }
  };

  const handleSettings = () => {
    // TODO: 打开设置界面
    console.log('设置');
  };

  const handleExit = () => {
    // 在浏览器环境中，通常不能直接关闭窗口
    if (window.confirm('确定要退出游戏吗？')) {
      window.close();
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      {/* Phaser游戏容器 */}
      <div id="game-container" className="w-full h-full" />

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
    </div>
  );
}

export default App;
