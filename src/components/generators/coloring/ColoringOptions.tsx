import { useState } from 'react';
import { Settings, Sparkles, Palette } from 'lucide-react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { type ColoringCardParams } from '../../../services/ai/types';

interface ColoringOptionsProps {
  onGenerate: (params: ColoringCardParams) => void;
  isGenerating: boolean;
}

export function ColoringOptions({ onGenerate, isGenerating }: ColoringOptionsProps) {
  const [theme, setTheme] = useState<string>('animals');
  const [subject, setSubject] = useState<string>('cat');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const themes = [
    { value: 'animals', label: '动物' },
    { value: 'vehicles', label: '交通工具' },
    { value: 'plants', label: '植物' },
    { value: 'fantasy', label: '奇幻' },
    { value: 'food', label: '食物' },
  ];

  const subjectsByTheme: Record<string, string[]> = {
    animals: ['cat', 'dog', 'dinosaur', 'lion', 'elephant', 'butterfly'],
    vehicles: ['car', 'train', 'airplane', 'boat', 'rocket', 'bus'],
    plants: ['flower', 'tree', 'mushroom', 'cactus', 'garden'],
    fantasy: ['dragon', 'unicorn', 'fairy', 'robot', 'monster'],
    food: ['cake', 'ice cream', 'fruit', 'pizza', 'burger'],
  };

  const handleGenerateClick = () => {
    onGenerate({
      theme,
      subject,
      difficulty,
      customPrompt
    });
  };

  return (
    <Card title={<div className="flex items-center gap-2"><Settings className="w-5 h-5" /> 生成选项</div>}>
      <div className="space-y-6">
        {/* 主题选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--color-primary)]" />
            主题
          </label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value);
                  setSubject(subjectsByTheme[t.value][0]); // 重置 subject
                }}
                className={`
                  px-2 py-2 rounded-xl text-xs font-medium transition-all border
                  ${theme === t.value
                    ? 'bg-orange-50 border-orange-400 text-orange-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 具体对象 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">具体内容</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {subjectsByTheme[theme]?.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all border
                  ${subject === s
                    ? 'bg-purple-50 border-purple-400 text-purple-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-purple-50'
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="或者输入自定义内容..."
            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
          />
        </div>

        {/* 难度 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">复杂度</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`
                  flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all border
                  ${difficulty === d
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-yellow-50'
                  }
                `}
              >
                {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '复杂'}
              </button>
            ))}
          </div>
        </div>

        {/* 额外描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">额外描述 (可选)</label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="例如：wearing a hat, playing soccer..."
            className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm min-h-[60px]"
          />
        </div>

        <Button
          fullWidth
          size="large"
          onClick={handleGenerateClick}
          loading={isGenerating}
          icon={<Sparkles className="w-5 h-5" />}
          className="mt-4"
        >
          {isGenerating ? 'AI 正在绘画中...' : '生成涂色卡片'}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          注意：生成过程可能需要 15-30 秒
        </p>
      </div>
    </Card>
  );
}
