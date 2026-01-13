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
      <div className="relative h-24 w-full mb-8">
        {/* 四线三格背景 */}
        {options.showLines && (
          <div className="absolute inset-0 flex flex-col w-full h-full pointer-events-none">
            <div className="flex-1"></div>
            {/* Ascender Line (Top) */}
            <div className="border-b border-red-500 print:border-red-600 w-full opacity-60"></div>
            {/* Mid Line (Dashed) */}
            <div className="h-6 w-full border-b border-red-400 border-dashed print:border-red-500 opacity-60"></div>
            {/* Base Line (Bottom Red) */}
            <div className="h-6 w-full border-b border-red-500 print:border-red-600 opacity-80"></div>
            {/* Descender Line (Bottom Grey/Pink) */}
            <div className="h-6 w-full border-b border-red-300 print:border-red-300 opacity-40"></div>
            <div className="flex-1"></div>
          </div>
        )}

        {/* 文本内容 */}
        <div className="absolute inset-0 flex items-center px-4 z-10">
          <div className="flex gap-8 w-full font-sans text-6xl leading-none pt-2"
               style={{ fontFamily: '"Comic Sans MS", "Arial Rounded MT Bold", sans-serif' }}>
            {/* 示范文字 (实心) */}
            <span className="text-black">{text}</span>

            {/* 描红文字 (虚线/灰色) */}
            {options.showTracing && Array.from({ length: repeat }).map((_, i) => (
              <span key={i} className="text-gray-300 print:text-gray-200">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[29.7cm] relative print:shadow-none print:border-none print:p-0">
      {/* 头部 */}
      <div className="mb-8 border-b-2 border-gray-800 pb-4">
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
