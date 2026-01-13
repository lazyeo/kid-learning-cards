import { clsx } from 'clsx';

interface EnglishGridProps {
  char?: string;
  showTracing?: boolean;
  className?: string;
}

export function EnglishGrid({ char, showTracing = true, className }: EnglishGridProps) {
  return (
    <div className={clsx("relative w-16 h-16 flex flex-col justify-center", className)}>
      {/* 四线三格背景 */}
      <div className="absolute inset-0 flex flex-col w-full h-full">
        {/* 上留白 */}
        <div className="flex-1"></div>

        {/* 上线 (Ascender line) */}
        <div className="border-b border-red-500 print:border-red-600 w-full"></div>

        {/* 中格 */}
        <div className="h-4 w-full border-b border-red-300 border-dashed print:border-red-400"></div>

        {/* 基线 (Baseline) */}
        <div className="h-4 w-full border-b border-red-500 print:border-red-600"></div>

        {/* 下线 (Descender line) */}
        <div className="h-4 w-full border-b border-red-300 print:border-red-300"></div>

        {/* 下留白 */}
        <div className="flex-1"></div>
      </div>

      {/* 字母显示 */}
      {char && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span
            className={clsx(
              "text-5xl font-sans leading-none pb-2", // 调整基线对齐
              showTracing ? "text-gray-300 print:text-gray-200" : "text-black"
            )}
            style={{ fontFamily: '"Comic Sans MS", "Arial Rounded MT Bold", sans-serif' }}
          >
            {char}
          </span>
        </div>
      )}
    </div>
  );
}
