// 游戏UI总容器
import React, { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { HUD } from './HUD';
import { Inventory } from './Inventory';
import { Map } from './Map';
import { ClassSelectionPanel } from './ClassSelectionPanel';
import { SkillTreePanel } from './SkillTreePanel';
import { SkillBar } from './SkillBar';
import { BuffBar } from './BuffBar';
import { DEFAULT_KEYBINDINGS } from '@constants/keybindings';
import { SkillManager } from '@/game/skills/SkillManager';
import { CooldownManager } from '@/game/skills/CooldownManager';
import { ElementalEffects } from '@/game/effects/ElementalEffects';

export const GameUI: React.FC = () => {
  const toggleUI = useGameStore((state) => state.toggleUI);
  const ui = useGameStore((state) => state.ui);
  const player = useGameStore((state) => state.player);
  const skillTree = useGameStore((state) => state.skillTree);

  useEffect(() => {
    // 监听键盘事件
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      if (key === DEFAULT_KEYBINDINGS.INVENTORY) {
        toggleUI('showInventory');
      } else if (key === DEFAULT_KEYBINDINGS.SKILL_TREE) {
        // 如果玩家等级>=5且未选择职业，显示职业选择界面
        if (player.level >= 5 && !skillTree) {
          toggleUI('showSkillTree');
        } else if (skillTree) {
          toggleUI('showSkillTree');
        }
      } else if (key === DEFAULT_KEYBINDINGS.QUEST_LOG) {
        toggleUI('showQuestLog');
      } else if (key === DEFAULT_KEYBINDINGS.MAP) {
        toggleUI('showMap');
      } else if (['1', '2', '3', '4'].includes(key)) {
        // 技能快捷键
        const slot = parseInt(key) - 1;
        if (skillTree) {
          SkillManager.castSkillBySlot(slot as 0 | 1 | 2 | 3);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleUI, player.level, skillTree]);

  useEffect(() => {
    // 更新冷却和效果系统
    const updateLoop = () => {
      CooldownManager.update();
      ElementalEffects.update(1/60); // 假设60fps
    };

    const interval = setInterval(updateLoop, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <HUD />
      <Inventory />
      <Map />
      
      {/* 技能系统UI */}
      {skillTree && <SkillBar />}
      {skillTree && <BuffBar />}
      
      {/* 职业选择界面 */}
      {ui.showSkillTree && !skillTree && player.level >= 5 && (
        <ClassSelectionPanel />
      )}
      
      {/* 技能树界面 */}
      {ui.showSkillTree && skillTree && (
        <SkillTreePanel />
      )}
    </>
  );
};
