// 游戏UI总容器
import React, { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { HUD } from './HUD';
import { Inventory } from './Inventory';
import { DEFAULT_KEYBINDINGS } from '@constants/keybindings';

export const GameUI: React.FC = () => {
  const toggleUI = useGameStore((state) => state.toggleUI);

  useEffect(() => {
    // 监听键盘事件
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      if (key === DEFAULT_KEYBINDINGS.INVENTORY) {
        toggleUI('showInventory');
      } else if (key === DEFAULT_KEYBINDINGS.SKILL_TREE) {
        toggleUI('showSkillTree');
      } else if (key === DEFAULT_KEYBINDINGS.QUEST_LOG) {
        toggleUI('showQuestLog');
      } else if (key === DEFAULT_KEYBINDINGS.MAP) {
        toggleUI('showMap');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleUI]);

  return (
    <>
      <HUD />
      <Inventory />
      {/* TODO: 添加其他UI组件 */}
    </>
  );
};
