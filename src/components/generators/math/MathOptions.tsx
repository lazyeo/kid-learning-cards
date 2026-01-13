import { type MathGeneratorOptions } from '../../../types/generator';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Settings, Plus, Minus, X, Divide, Shuffle } from 'lucide-react';

interface MathOptionsProps {
  options: MathGeneratorOptions;
  onChange: (options: MathGeneratorOptions) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function MathOptions({ options, onChange, onGenerate, isGenerating }: MathOptionsProps) {
  const handleChange = (key: keyof MathGeneratorOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const types = [
    { value: 'addition', label: '加法', icon: <Plus className="w-4 h-4" /> },
    { value: 'subtraction', label: '减法', icon: <Minus className="w-4 h-4" /> },
    { value: 'multiplication', label: '乘法', icon: <X className="w-4 h-4" /> },
    { value: 'division', label: '除法', icon: <Divide className="w-4 h-4" /> },
    { value: 'mixed', label: '混合', icon: <Shuffle className="w-4 h-4" /> },
  ];

  const difficulties = [
    { value: 'easy', label: '简单 (1-10)' },
    { value: 'medium', label: '中等 (1-20)' },
    { value: 'hard', label: '困难 (1-100)' },
  ];

  const counts = [10, 20, 30, 50];

  return (
    <Card title={<div className="flex items-center gap-2"><Settings className="w-5 h-5" /> 生成选项</div>}>
      <div className="space-y-6">
        {/* 题目类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">题目类型</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {types.map((type) => (
              <button
                key={type.value}
                onClick={() => handleChange('type', type.value)}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${options.type === type.value
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                  }
                `}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 难度选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">难度等级</label>
          <div className="flex gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => handleChange('difficulty', diff.value)}
                className={`
                  flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${options.difficulty === diff.value
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                  }
                `}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        {/* 题目格式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">排版格式</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleChange('format', 'horizontal')}
              className={`
                flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${options.format === 'horizontal'
                  ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                }
              `}
            >
              横式 (1 + 1 =)
            </button>
            <button
              onClick={() => handleChange('format', 'vertical')}
              className={`
                flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${options.format === 'vertical'
                  ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                }
              `}
            >
              竖式
            </button>
          </div>
        </div>

        {/* 题目数量 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">题目数量</label>
          <div className="flex gap-2">
            {counts.map((count) => (
              <button
                key={count}
                onClick={() => handleChange('count', count)}
                className={`
                  flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${options.count === count
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                  }
                `}
              >
                {count}题
              </button>
            ))}
          </div>
        </div>

        {/* 其他选项 */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeAnswers"
            checked={options.includeAnswers || false}
            onChange={(e) => handleChange('includeAnswers', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="includeAnswers" className="text-sm text-gray-700">包含答案页</label>
        </div>

        <Button
          fullWidth
          size="large"
          onClick={onGenerate}
          loading={isGenerating}
          className="mt-4"
        >
          开始生成
        </Button>
      </div>
    </Card>
  );
}
