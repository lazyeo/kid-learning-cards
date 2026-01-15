import { type WritingGeneratorOptions } from '../../../types/generator';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { pinyin } from 'pinyin-pro';

interface WritingWorksheetProps {
  options: WritingGeneratorOptions;
  content: string;
}

// 田字格行组件 - 固定尺寸，适合打印
function TianZiGeRow({
  chars,
  showPinyin,
  showTracing,
  gridCount,
}: {
  chars?: string[];
  showPinyin?: boolean;
  showTracing?: boolean;
  gridCount: number;
}) {
  const grids = [];

  for (let i = 0; i < gridCount; i++) {
    const char = chars?.[i];
    const py = char && showPinyin && /[\u4e00-\u9fa5]/.test(char) ? pinyin(char) : undefined;

    grids.push(
      <div key={i} className="flex flex-col items-center" style={{ width: `${100 / gridCount}%` }}>
        {/* 拼音区域 - 固定高度 */}
        <div className="h-5 w-full flex items-end justify-center">
          {py && (
            <span className="text-xs font-sans text-gray-500 tracking-wide leading-none">
              {py}
            </span>
          )}
        </div>

        {/* 田字格 - 使用固定宽高比 */}
        <div className="relative w-full aspect-square border border-red-400 bg-white print:border-red-500 box-border">
          {/* 内部虚线辅助线 */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="border-r border-b border-red-200 border-dashed print:border-red-300"></div>
            <div className="border-b border-red-200 border-dashed print:border-red-300"></div>
            <div className="border-r border-red-200 border-dashed print:border-red-300"></div>
            <div></div>
          </div>

          {/* 汉字显示 - 使用相对于格子的百分比大小 */}
          {char && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span
                className={clsx(
                  "leading-none text-[1.6rem]",
                  showTracing ? "text-gray-300 print:text-gray-200" : "text-black"
                )}
                style={{
                  fontFamily: '"KaiTi", "STKaiti", "SimKai", serif',
                }}
              >
                {char}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full">
      {grids}
    </div>
  );
}

// 四线三格行组件 - 固定高度，适合打印
// 四线三格：4条横线分隔出3个区域
// Line 1 (top): 顶线 - ascender line
// Line 2: 中线 (虚线) - x-height line
// Line 3: 基线 - baseline
// Line 4 (bottom): 底线 - descender line
function SiXianSanGeRow({
  text,
  showTracing
}: {
  text?: string;
  showTracing?: boolean;
}) {
  // 三格高度配置：ascender(16) + x-height(16) + descender(16) = 48px
  const xHeightPos = 16;      // 中线位置（虚线）
  const baselinePos = 32;     // 基线位置
  const totalHeight = 48;     // 总高度

  return (
    <div className="relative w-full" style={{ height: `${totalHeight}px` }}>
      {/* 四条横线 */}
      {/* Line 1: 顶线 */}
      <div className="absolute left-0 right-0 top-0 border-t border-red-400 print:border-red-500" />
      {/* Line 2: 中线(虚线) */}
      <div className="absolute left-0 right-0 border-t border-red-300 border-dashed print:border-red-400" style={{ top: `${xHeightPos}px` }} />
      {/* Line 3: 基线 */}
      <div className="absolute left-0 right-0 border-t border-red-400 print:border-red-500" style={{ top: `${baselinePos}px` }} />
      {/* Line 4: 底线 */}
      <div className="absolute left-0 right-0 border-t border-red-300 print:border-red-400" style={{ top: `${totalHeight}px` }} />

      {/* 文本内容 */}
      {text && (
        <div className="absolute left-0 right-0 px-2" style={{ top: '1px' }}>
          <div
            className={clsx(
              "tracking-wide whitespace-nowrap",
              showTracing ? "text-gray-300 print:text-gray-200" : "text-black"
            )}
            style={{
              fontFamily: '"Comic Sans MS", "Arial Rounded MT Bold", cursive',
              // 字体大小：让大写字母填满 ascender + x-height 区域 (48px)
              // 考虑到字体的 line-height，使用约 42px
              fontSize: '36px',
              lineHeight: 1,
            }}
          >
            {text}
          </div>
        </div>
      )}
    </div>
  );
}

export function WritingWorksheet({ options, content }: WritingWorksheetProps) {
  const { t } = useTranslation();
  const isTianZiGe = options.gridType === 'tian-zi-ge';

  // 固定使用桌面端/打印的布局参数
  const gridPerRow = 14;
  const rowCount = 10;

  // 将内容分成行
  const getContentRows = () => {
    if (!content || content.trim() === '') {
      return Array(rowCount).fill(null);
    }

    const rows: (string[] | null)[] = [];

    if (isTianZiGe) {
      const chars = content.replace(/\s+/g, '').split('');
      for (let i = 0; i < chars.length; i += gridPerRow) {
        rows.push(chars.slice(i, i + gridPerRow));
      }
    } else {
      const lines = content.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        rows.push([line.trim()]);
      });
    }

    while (rows.length < rowCount) {
      rows.push(null);
    }

    return rows;
  };

  const contentRows = getContentRows();

  return (
    <div className="bg-white p-6 shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-4">
      {/* 头部 */}
      <div className="mb-4 border-b-2 border-gray-800 pb-3 print:mb-3">
        <h1 className="text-2xl font-bold text-center mb-4 font-comic text-gray-800">
          {isTianZiGe ? t('worksheet.chinesePractice') : t('worksheet.englishPractice')}
        </h1>
        <div className="flex justify-between text-base">
          <div className="flex gap-2 items-center">
            <span className="font-bold whitespace-nowrap">{t('worksheet.name')}:</span>
            <div className="w-32 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-bold whitespace-nowrap">{t('worksheet.date')}:</span>
            <div className="w-32 border-b-2 border-gray-400"></div>
          </div>
        </div>
      </div>

      {/* 练习区域 */}
      <div className={clsx(
        "flex flex-col w-full",
        isTianZiGe ? "gap-1" : "gap-4"  // 四线格增加行间距
      )}>
        {contentRows.map((row, index) => (
          isTianZiGe ? (
            <TianZiGeRow
              key={index}
              chars={row as string[] | undefined}
              showPinyin={options.showPinyin}
              showTracing={options.showTracing}
              gridCount={gridPerRow}
            />
          ) : (
            <SiXianSanGeRow
              key={index}
              text={row ? (row as string[])[0] : undefined}
              showTracing={options.showTracing}
            />
          )
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-gray-400 print:absolute print:bottom-4 print:left-0 print:w-full">
        {t('worksheet.tagline')}
      </div>
    </div>
  );
}
