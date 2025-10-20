// 设置菜单组件
import React, { useState } from 'react';
import { useGameStore } from '@store/gameStore';

interface SettingsMenuProps {
  onClose: () => void;
}

type Resolution = '1280x720' | '1600x900' | '1920x1080';
type MiniMapSize = 'small' | 'medium' | 'large';

const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: '1280x720', label: '1280 × 720 (低)' },
  { value: '1600x900', label: '1600 × 900 (中)' },
  { value: '1920x1080', label: '1920 × 1080 (高)' },
];

const MINIMAP_SIZES: { value: MiniMapSize; label: string; size: number }[] = [
  { value: 'small', label: '小 (100px)', size: 100 },
  { value: 'medium', label: '中 (150px)', size: 150 },
  { value: 'large', label: '大 (200px)', size: 200 },
];

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const [resolution, setResolution] = useState<Resolution>(
    settings.resolution || '1600x900'
  );
  const [miniMapSize, setMiniMapSize] = useState<MiniMapSize>(
    settings.miniMapSize || 'medium'
  );
  const [showFPS, setShowFPS] = useState(settings.showFPS || false);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled !== false);

  const handleSave = () => {
    // 保存设置
    updateSettings({
      resolution,
      miniMapSize,
      showFPS,
      soundEnabled,
    });

    // 应用分辨率（需要重新加载游戏）
    if (resolution !== settings.resolution) {
      alert('分辨率更改需要刷新页面才能生效。点击确定后页面将自动刷新。');
      localStorage.setItem('game-resolution', resolution);
      window.location.reload();
    }

    onClose();
  };

  const handleReset = () => {
    if (confirm('确定要重置所有设置吗？')) {
      setResolution('1600x900');
      setMiniMapSize('medium');
      setShowFPS(false);
      setSoundEnabled(true);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-8 w-[600px] max-h-[80vh] overflow-y-auto">
        {/* 标题 */}
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          ⚙️ 游戏设置
        </h2>

        {/* 设置项 */}
        <div className="space-y-6">
          {/* 分辨率设置 */}
          <div>
            <label className="block text-white text-lg font-semibold mb-2">
              🖥️ 游戏分辨率
            </label>
            <p className="text-gray-400 text-sm mb-3">
              更改分辨率需要刷新页面
            </p>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as Resolution)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 
                         rounded focus:outline-none focus:border-blue-500"
            >
              {RESOLUTIONS.map((res) => (
                <option key={res.value} value={res.value}>
                  {res.label}
                </option>
              ))}
            </select>
          </div>

          {/* 小地图大小 */}
          <div>
            <label className="block text-white text-lg font-semibold mb-2">
              🗺️ 小地图大小
            </label>
            <p className="text-gray-400 text-sm mb-3">
              调整右上角小地图的显示大小
            </p>
            <div className="grid grid-cols-3 gap-3">
              {MINIMAP_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setMiniMapSize(size.value)}
                  className={`px-4 py-2 rounded border-2 transition-all ${
                    miniMapSize === size.value
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* FPS显示 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white text-lg font-semibold">
                📊 显示FPS
              </label>
              <p className="text-gray-400 text-sm">
                在屏幕左上角显示帧率
              </p>
            </div>
            <button
              onClick={() => setShowFPS(!showFPS)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                showFPS ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  showFPS ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 音效开关 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white text-lg font-semibold">
                🔊 音效
              </label>
              <p className="text-gray-400 text-sm">
                启用/禁用游戏音效
              </p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                soundEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded
                     hover:bg-blue-700 transition-colors"
          >
            ✅ 保存设置
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-700 text-white font-semibold rounded
                     hover:bg-gray-600 transition-colors"
          >
            🔄 重置
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 text-white font-semibold rounded
                     hover:bg-gray-700 transition-colors border border-gray-600"
          >
            ❌ 取消
          </button>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-700">
          <p className="text-gray-400 text-sm">
            💡 <strong>提示：</strong>
            <br />
            • 分辨率更改会立即刷新页面
            <br />
            • 小地图大小会立即生效
            <br />
            • 所有设置都会自动保存
          </p>
        </div>
      </div>
    </div>
  );
};
