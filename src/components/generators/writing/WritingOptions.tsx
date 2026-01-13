import { type WritingGeneratorOptions } from '../../../types/generator';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import { Settings, Grid, AlignLeft, Type } from 'lucide-react';

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

  const gridTypes = [
    { value: 'tian-zi-ge', label: '田字格 (汉字)', icon: <Grid className="w-4 h-4" /> },
    { value: 'si-xian-san-ge', label: '四线格 (英文)', icon: <AlignLeft className="w-4 h-4" /> },
  ];

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

        {/* 内容输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">练习内容</label>
          <div className="relative">
            <textarea
              value={options.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder={options.gridType === 'tian-zi-ge' ? "输入汉字，例如：天地玄黄" : "Input English text here..."}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-0 transition-colors min-h-[120px]"
            />
            <div className="absolute top-3 right-3 text-gray-400">
              <Type className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {options.gridType === 'tian-zi-ge'
              ? '支持汉字自动注音。'
              : '请输入英文字母或单词。'}
          </p>
        </div>

        {/* 辅助选项 */}
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
              disabled={options.gridType !== 'tian-zi-ge'}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
            />
            <label htmlFor="showPinyin" className={`text-sm ${options.gridType !== 'tian-zi-ge' ? 'text-gray-400' : 'text-gray-700'}`}>
              显示拼音
            </label>
          </div>
        </div>

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
