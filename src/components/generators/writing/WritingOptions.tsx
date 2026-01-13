import { type WritingGeneratorOptions } from '../../../types/generator';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Settings, Grid, AlignLeft, Type, BookOpen, FileText } from 'lucide-react';
import { difficultyLevels, getCategoriesByDifficulty } from '../../../data/chineseVocabulary';
import { vocabularyDatabase } from '../../../data/englishVocabulary';

interface WritingOptionsProps {
  options: WritingGeneratorOptions;
  onChange: (options: WritingGeneratorOptions) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function WritingOptions({ options, onChange, onGenerate, isGenerating }: WritingOptionsProps) {
  const handleChange = (key: keyof WritingGeneratorOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const isTianZiGe = options.gridType === 'tian-zi-ge';

  const gridTypes = [
    { value: 'tian-zi-ge', label: '田字格 (汉字)', icon: <Grid className="w-4 h-4" /> },
    { value: 'si-xian-san-ge', label: '四线格 (英文)', icon: <AlignLeft className="w-4 h-4" /> },
  ];

  // 英文练习类型
  const englishTypes = [
    { value: 'alphabet', label: '字母表', icon: <Type className="w-4 h-4" /> },
    { value: 'words', label: '单词练习', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'sentences', label: '句子练习', icon: <FileText className="w-4 h-4" /> },
    { value: 'custom', label: '自定义', icon: <Type className="w-4 h-4" /> },
  ];

  // 获取当前难度下的汉字分类
  const chineseCategories = getCategoriesByDifficulty(options.chineseDifficulty || 'beginner');

  return (
    <Card title={<div className="flex items-center gap-2"><Settings className="w-5 h-5" /> 生成选项</div>}>
      <div className="space-y-6">
        {/* 格子类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">练习类型</label>
          <div className="grid grid-cols-1 gap-2">
            {gridTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleChange('gridType', type.value)}
                className={`
                  flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all
                  ${options.gridType === type.value
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

        {/* ===== 田字格子选项 ===== */}
        {isTianZiGe && (
          <>
            {/* 难度选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">难度级别</label>
              <div className="grid grid-cols-2 gap-2">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleChange('chineseDifficulty', level.id)}
                    className={`
                      px-2 py-2 rounded-xl text-xs font-medium transition-all border text-center
                      ${options.chineseDifficulty === level.id
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    title={level.description}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 汉字分类 (非自定义模式) */}
            {options.chineseDifficulty !== 'custom' && chineseCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容分类</label>
                <div className="grid grid-cols-2 gap-2">
                  {chineseCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleChange('chineseCategory', category.id)}
                      className={`
                        px-2 py-2 rounded-xl text-xs font-medium transition-all border text-center
                        ${options.chineseCategory === category.id
                          ? 'bg-orange-50 border-orange-400 text-orange-700'
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

            {/* 自定义内容输入 (仅自定义模式) */}
            {options.chineseDifficulty === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">练习内容</label>
                <div className="relative">
                  <textarea
                    value={options.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="输入汉字，例如：天地玄黄"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-0 transition-colors min-h-[100px]"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">支持汉字自动注音</p>
              </div>
            )}

            {/* 田字格辅助选项 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showTracing"
                  checked={options.showTracing !== false}
                  onChange={(e) => handleChange('showTracing', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="showTracing" className="text-sm text-gray-700">显示描红（虚线文字）</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPinyin"
                  checked={options.showPinyin || false}
                  onChange={(e) => handleChange('showPinyin', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="showPinyin" className="text-sm text-gray-700">显示拼音</label>
              </div>
            </div>
          </>
        )}

        {/* ===== 四线格子选项 (英文) ===== */}
        {!isTianZiGe && (
          <>
            {/* 英文练习类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">练习内容</label>
              <div className="grid grid-cols-2 gap-2">
                {englishTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleChange('englishType', type.value)}
                    className={`
                      flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-medium transition-all border
                      ${options.englishType === type.value
                        ? 'bg-purple-50 border-purple-400 text-purple-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 单词分类 (仅单词模式) */}
            {options.englishType === 'words' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">词汇分类</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {vocabularyDatabase.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleChange('englishCategory', category.id)}
                      className={`
                        px-2 py-2 rounded-xl text-xs font-medium transition-all border text-left truncate
                        ${options.englishCategory === category.id
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

            {/* 数量选择 (单词/句子模式) */}
            {(options.englishType === 'words' || options.englishType === 'sentences') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {options.englishType === 'words' ? '单词数量' : '句子数量'}
                </label>
                <div className="flex gap-2">
                  {[5, 8, 10, 12].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleChange('englishCount', count)}
                      className={`
                        flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all
                        ${options.englishCount === count
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
            )}

            {/* 自定义内容输入 (仅自定义模式) */}
            {options.englishType === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">练习内容</label>
                <div className="relative">
                  <textarea
                    value={options.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Input English text here...&#10;Each line will be displayed separately."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-0 transition-colors min-h-[100px]"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">每行文本会单独显示在一行四线格中</p>
              </div>
            )}

            {/* 四线格辅助选项 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showTracingEn"
                  checked={options.showTracing !== false}
                  onChange={(e) => handleChange('showTracing', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="showTracingEn" className="text-sm text-gray-700">显示描红文本</label>
              </div>
            </div>
          </>
        )}

        <Button
          fullWidth
          size="large"
          onClick={onGenerate}
          loading={isGenerating}
          className="mt-4"
        >
          更新预览
        </Button>
      </div>
    </Card>
  );
}
