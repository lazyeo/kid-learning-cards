import { clsx } from 'clsx';

interface ChineseGridProps {
  char?: string;
  pinyin?: string;
  showTracing?: boolean;
  className?: string;
}

export function ChineseGrid({ char, pinyin, showTracing = true, className }: ChineseGridProps) {
  return (
    <div className={clsx("flex flex-col items-center", className)}>
      {/* 拼音区域 */}
      <div className="h-8 w-full flex items-end justify-center mb-1">
        {pinyin && (
          <span className="text-sm font-sans text-gray-600 tracking-wide">
            {pinyin}
          </span>
        )}
      </div>

      {/* 田字格主体 */}
      <div className="relative w-16 h-16 border-2 border-red-500 bg-white print:border-red-600 box-border">
        {/* 内部虚线辅助线 */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="border-r border-b border-red-300 border-dashed print:border-red-400"></div>
          <div className="border-b border-red-300 border-dashed print:border-red-400"></div>
          <div className="border-r border-red-300 border-dashed print:border-red-400"></div>
          <div></div>
        </div>

        {/* 汉字显示 */}
        {char && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span
              className={clsx(
                "text-4xl font-kaiti leading-none transform -translate-y-0.5", // 楷体字体更好看，暂时用 font-serif 替代
                showTracing ? "text-gray-300 print:text-gray-200" : "text-black"
              )}
              style={{ fontFamily: '"KaiTi", "STKaiti", "SimKai", serif' }}
            >
              {char}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
