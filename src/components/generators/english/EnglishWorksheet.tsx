import { type EnglishGeneratorOptions } from '../../../types/generator';

interface EnglishWorksheetProps {
  options: EnglishGeneratorOptions;
  content: string[];
}

export function EnglishWorksheet({ options, content }: EnglishWorksheetProps) {
  if (content.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-lg">点击左侧"生成练习纸"按钮开始</p>
      </div>
    );
  }

  // 四线三格行组件
  const WritingLine = ({ text, repeat = 1 }: { text: string; repeat?: number }) => {
    return (
      <div className="relative h-24 w-full mb-6 overflow-hidden print:mb-4">
        {/* 四线三格背景 */}
        {options.showLines && (
          <div className="absolute inset-0 flex flex-col w-full h-full pointer-events-none">
            {/* 上留白 12px (0.75rem) */}
            <div className="h-3"></div>
            {/* Ascender Space 24px */}
            <div className="h-6 w-full border-b border-red-500 print:border-red-600 opacity-60 box-border"></div>
            {/* Mid Space 24px */}
            <div className="h-6 w-full border-b border-red-400 border-dashed print:border-red-500 opacity-60 box-border"></div>
            {/* Base Space 24px (Baseline at bottom) */}
            <div className="h-6 w-full border-b border-red-500 print:border-red-600 opacity-80 box-border"></div>
            {/* Descender Space 24px */}
            <div className="h-6 w-full border-b border-red-300 print:border-red-300 opacity-40 box-border"></div>
            {/* 下留白 - 剩余空间 */}
          </div>
        )}

        {/* 文本内容 - 绝对定位以匹配基线
            Grid:
            Top Spacer: 12px
            Row 1 (Ascender): 24px. Bottom border at 12+24=36px (Top Line)
            Row 2 (Mid): 24px. Bottom border at 36+24=60px (Mid Line)
            Row 3 (Base): 24px. Bottom border at 60+24=84px (Base Line)
            Row 4 (Descender): 24px. Bottom border at 84+24=108px (Descender Line)

            Writing area (Top Line to Base Line) is 84 - 36 = 48px.
            We use text-5xl (48px) with leading-none (line-height: 1).
            Positioning top at 36px (top-9) should align the em-box exactly between Top and Base lines.
        */}
        <div className="absolute left-0 right-0 top-9 px-4 z-10 flex">
          <div className="flex gap-4 w-full font-sans text-5xl leading-none tracking-normal"
               style={{ fontFamily: '"Comic Sans MS", "Arial Rounded MT Bold", sans-serif' }}>
            {/* 示范文字 (实心) */}
            <span className="text-black transform -translate-y-1">{text}</span>

            {/* 描红文字 (虚线/灰色) */}
            {options.showTracing && Array.from({ length: repeat }).map((_, i) => (
              <span key={i} className="text-gray-300 print:text-gray-200 transform -translate-y-1">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[29.7cm] relative print:shadow-none print:border-none print:p-0 print:min-h-0 print:h-auto print:w-full">
      {/* 头部 */}
      <div className="mb-8 border-b-2 border-gray-800 pb-4 print:mb-4">
        <h1 className="text-3xl font-bold text-center mb-6 font-comic text-gray-800">
          English Writing Practice
        </h1>
        <div className="flex justify-between text-lg">
          <div className="flex gap-2">
            <span className="font-bold">Name:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Date:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">Score:</span>
            <div className="w-20 border-b-2 border-gray-400"></div>
          </div>
        </div>
      </div>

      {/* 练习内容 */}
      <div className="flex flex-col gap-2">
        {content.map((item, index) => (
          <WritingLine
            key={`${item}-${index}`}
            text={item}
            repeat={options.type === 'words' ? 3 : 0} // 单词模式下重复描红，句子模式不重复
          />
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-400 print:absolute print:bottom-4 print:left-0 print:w-full">
        Kids Learning Cards - AI Powered Educational Resources
      </div>
    </div>
  );
}
