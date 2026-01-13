import { type EnglishGeneratorOptions } from '../../../types/generator';
import { vocabularyDatabase } from '../../../data/englishVocabulary';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Settings, Type, AlignLeft, BookOpen } from 'lucide-react';

interface EnglishOptionsProps {
  options: EnglishGeneratorOptions;
  onChange: (options: EnglishGeneratorOptions) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function EnglishOptions({ options, onChange, onGenerate, isGenerating }: EnglishOptionsProps) {
  const handleChange = (key: keyof EnglishGeneratorOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <Card title={<div className="flex items-center gap-2"><Settings className="w-5 h-5" /> 生成选项</div>}>
      <div className="space-y-6">
        {/* 练习类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">练习类型</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleChange('type', 'words')}
              className={`
                flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${options.type === 'words'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                }
              `}
            >
              <BookOpen className="w-4 h-4" />
              单词练习
            </button>
            <button
              onClick={() => handleChange('type', 'sentences')}
              className={`
                flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${options.type === 'sentences'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                }
              `}
            >
              <AlignLeft className="w-4 h-4" />
              句子练习
            </button>
          </div>
        </div>

        {/* 词库分类 (仅单词模式) */}
        {options.type === 'words' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">词汇分类</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {vocabularyDatabase.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleChange('category', category.id)}
                  className={`
                    px-2 py-2 rounded-xl text-xs font-medium transition-all border text-left truncate
                    ${options.category === category.id
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 数量选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {options.type === 'words' ? '单词数量' : '句子数量'}
          </label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((count) => (
              <button
                key={count}
                onClick={() => handleChange('count', count)}
                className={`
                  flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${options.count === count
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                  }
                `}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* 辅助选项 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showLines"
              checked={options.showLines}
              onChange={(e) => handleChange('showLines', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showLines" className="text-sm text-gray-700">显示四线三格</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showTracing"
              checked={options.showTracing}
              onChange={(e) => handleChange('showTracing', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showTracing" className="text-sm text-gray-700">显示描红文本</label>
          </div>
        </div>

        <Button
          fullWidth
          size="large"
          onClick={onGenerate}
          loading={isGenerating}
          icon={<Type className="w-5 h-5" />}
          className="mt-4"
        >
          生成练习纸
        </Button>
      </div>
    </Card>
  );
}
