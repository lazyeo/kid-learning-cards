import { type MathGeneratorOptions } from '../../../types/generator';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const handleChange = (key: keyof MathGeneratorOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const types = [
    { value: 'addition', labelKey: 'math.options.addition', icon: <Plus className="w-4 h-4" /> },
    { value: 'subtraction', labelKey: 'math.options.subtraction', icon: <Minus className="w-4 h-4" /> },
    { value: 'multiplication', labelKey: 'math.options.multiplication', icon: <X className="w-4 h-4" /> },
    { value: 'division', labelKey: 'math.options.division', icon: <Divide className="w-4 h-4" /> },
    { value: 'mixed', labelKey: 'math.options.mixed', icon: <Shuffle className="w-4 h-4" /> },
  ];

  const difficulties = [
    { value: 'easy', labelKey: 'math.options.easy' },
    { value: 'medium', labelKey: 'math.options.medium' },
    { value: 'hard', labelKey: 'math.options.hard' },
  ];

  const counts = [10, 20, 30, 50];

  return (
    <Card title={<div className="flex items-center gap-2"><Settings className="w-5 h-5" /> {t('common.options')}</div>}>
      <div className="space-y-6">
        {/* 题目类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('math.options.type')}</label>
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
                {t(type.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* 难度选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('math.options.difficulty')}</label>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => handleChange('difficulty', diff.value)}
                className={`
                  px-2 py-2 rounded-xl text-sm font-medium transition-all text-center
                  ${options.difficulty === diff.value
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                  }
                `}
              >
                {t(diff.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* 题目格式 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('math.options.format')}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleChange('format', 'horizontal')}
              className={`
                px-2 py-2 rounded-xl text-sm font-medium transition-all text-center
                ${options.format === 'horizontal'
                  ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                }
              `}
            >
              {t('math.options.horizontal')}
            </button>
            <button
              onClick={() => handleChange('format', 'vertical')}
              className={`
                px-2 py-2 rounded-xl text-sm font-medium transition-all text-center
                ${options.format === 'vertical'
                  ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                }
              `}
            >
              {t('math.options.vertical')}
            </button>
          </div>
        </div>

        {/* 题目数量 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('math.options.count')}</label>
          <div className="grid grid-cols-4 gap-2">
            {counts.map((count) => (
              <button
                key={count}
                onClick={() => handleChange('count', count)}
                className={`
                  px-2 py-2 rounded-xl text-sm font-medium transition-all text-center
                  ${options.count === count
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                  }
                `}
              >
                {count}{t('math.options.countSuffix')}
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
          <label htmlFor="includeAnswers" className="text-sm text-gray-700">{t('math.options.includeAnswers')}</label>
        </div>

        <Button
          fullWidth
          size="large"
          onClick={onGenerate}
          loading={isGenerating}
          className="mt-4"
        >
          {t('math.options.generate')}
        </Button>
      </div>
    </Card>
  );
}
