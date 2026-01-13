import { type WritingGeneratorOptions } from '../../../types/generator';
import { GridGenerator } from './GridGenerator';
import { clsx } from 'clsx';

interface WritingWorksheetProps {
  options: WritingGeneratorOptions;
  content: string; // 当前要显示的内容
}

export function WritingWorksheet({ options, content }: WritingWorksheetProps) {
  // 简单的拼音映射（模拟数据，实际项目可能需要 pinyin 库）
  // 这里只为了演示 UI 布局
  const getPinyin = (_char: string) => {
    // 实际项目中应引入 pinyin 库
    return options.showPinyin ? 'hao' : undefined;
  };

  const renderContent = () => {
    const chars = content.split('');
    const gridCount = 80; // 每页大致的格子数，根据布局调整
    const items = [];

    // 如果没有内容，显示空行供练习
    if (chars.length === 0) {
      for (let i = 0; i < gridCount; i++) {
        items.push(
          <GridGenerator
            key={`empty-${i}`}
            type={options.gridType}
            showTracing={false}
          />
        );
      }
      return items;
    }

    // 填充内容
    // 逻辑：每个字符显示一次带描红的，后面跟几个空的供练习
    // 或者简单地铺满
    // 这里采用简单模式：显示用户输入的内容，如果不够一行则重复，或者留空
    // 更好的模式可能是：每行显示一个示范字，然后一行都是这个字的描红或空格

    // MVP 简化逻辑：直接渲染输入的内容，每个字符渲染一个格子
    // 如果用户输入少，可以重复渲染填满页面

    const displayChars = [...chars];
    // 如果内容少，重复填充直到填满一定数量，或者留空
    // 这里我们简单地渲染输入的内容

    return displayChars.map((char, index) => (
      <GridGenerator
        key={`${char}-${index}`}
        type={options.gridType}
        char={char}
        pinyin={options.gridType === 'tian-zi-ge' ? getPinyin(char) : undefined}
        showTracing={options.showTracing}
      />
    ));
  };

  return (
    <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[29.7cm] relative print:shadow-none print:border-none print:p-0">
      {/* 头部 */}
      <div className="mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-center mb-6 font-comic text-gray-800">
          {options.gridType === 'tian-zi-ge' ? '汉字书写练习' : 'Writing Practice'}
        </h1>
        <div className="flex justify-between text-lg">
          <div className="flex gap-2">
            <span className="font-bold">姓名:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">日期:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
        </div>
      </div>

      {/* 格子网格 */}
      {/* 田字格布局：一行大概 8-10 个 */}
      {/* 四线三格布局：一行大概 8-10 个 */}
      <div className={clsx(
        "grid gap-4",
        options.gridType === 'tian-zi-ge'
          ? "grid-cols-8 md:grid-cols-9 print:grid-cols-9 gap-y-6"
          : "grid-cols-6 md:grid-cols-8 print:grid-cols-8 gap-y-8"
      )}>
        {renderContent()}
      </div>

      <div className="mt-12 text-center text-sm text-gray-400 print:absolute print:bottom-4 print:left-0 print:w-full">
        Kids Learning Cards - AI 驱动的儿童教育资源生成器
      </div>
    </div>
  );
}
