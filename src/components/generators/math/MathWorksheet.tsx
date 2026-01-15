import { type MathProblem } from '../../../types/generator';
import { useTranslation } from 'react-i18next';

interface MathWorksheetProps {
  problems: MathProblem[];
  format?: 'horizontal' | 'vertical';
  includeAnswers?: boolean;
}

// A4 页面布局常量
// 基于 A4 尺寸 210×297mm，考虑打印边距后的可用区域
const A4_CONFIG = {
  // 每页可容纳的行数（第一页有头部，空间较少）
  horizontal: {
    firstPageRows: 10,  // 第一页：3列 × 10行 = 30题
    otherPageRows: 13,  // 后续页：3列 × 13行 = 39题
    cols: 3,
  },
  vertical: {
    firstPageRows: 7,   // 第一页：5列 × 7行 = 35题
    otherPageRows: 9,   // 后续页：5列 × 9行 = 45题
    cols: 5,
  },
};

// 单个题目组件
function ProblemItem({
  problem,
  index,
  format
}: {
  problem: MathProblem;
  index: number;
  format: 'horizontal' | 'vertical';
}) {
  if (format === 'horizontal') {
    return (
      <div className="problem-item flex items-center p-2 text-2xl font-medium">
        <span className="text-gray-400 text-lg shrink-0 mr-1">
          {index + 1}.
        </span>
        <div className="flex-1 flex items-center gap-1 whitespace-nowrap">
          <span>{problem.operand1}</span>
          <span>{problem.operator}</span>
          <span>{problem.operand2}</span>
          <span>=</span>
          <span className="flex-1 max-w-14 h-10 border-b-2 border-gray-300"></span>
          {problem.remainder !== undefined && (
            <>
              <span className="text-gray-500 text-lg">···</span>
              <span className="w-8 h-10 border-b-2 border-gray-300"></span>
            </>
          )}
        </div>
      </div>
    );
  }

  // 竖式格式
  if (problem.operator === '÷') {
    const dividendStr = String(problem.operand1);
    const divisorStr = String(problem.operand2);
    const contentWidth = dividendStr.length * 20 + 12;

    return (
      <div className="problem-item flex items-center p-2 text-2xl font-medium">
        <span className="text-gray-400 text-lg shrink-0 mr-1 self-start mt-2">
          {index + 1}.
        </span>
        <div className="flex-1 font-mono text-xl">
          <div className="inline-flex items-end">
            <div className="flex items-center h-8 tracking-tight">
              {divisorStr.split('').map((digit, i) => (
                <span key={i} className="inline-block w-3.5 text-center">{digit}</span>
              ))}
            </div>
            <div className="relative">
              <svg
                className="absolute top-0 left-0 pointer-events-none"
                width={contentWidth + 6}
                height="38"
                style={{ transform: 'translate(-4px, -2px)' }}
              >
                <path
                  d={`M ${contentWidth + 4} 2 L 14 2 Q 6 2 6 10 L 6 30 Q 6 36 0 36`}
                  stroke="black"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex pl-3 h-8 items-center" style={{ minWidth: `${contentWidth}px` }}>
                {dividendStr.split('').map((digit, i) => (
                  <span key={i} className="inline-block w-5 text-center">{digit}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="h-4"></div>
        </div>
      </div>
    );
  }

  // 加减乘竖式
  const maxDigits = Math.max(
    String(problem.operand1).length,
    String(problem.operand2).length
  );
  const totalWidth = maxDigits + 1;

  const padDigits = (num: number) => {
    const str = String(num);
    const padding = maxDigits - str.length;
    return { digits: str.split(''), padding };
  };

  const op1 = padDigits(problem.operand1);
  const op2 = padDigits(problem.operand2);

  return (
    <div className="problem-item flex items-center p-2 text-2xl font-medium">
      <span className="text-gray-400 text-lg shrink-0 mr-1 self-start mt-2">
        {index + 1}.
      </span>
      <div className="flex-1 font-mono text-xl">
        <div className="inline-block">
          <div className="flex justify-end">
            <span className="w-5"></span>
            {Array(op1.padding).fill(null).map((_, i) => (
              <span key={`pad1-${i}`} className="inline-block w-5"></span>
            ))}
            {op1.digits.map((digit, i) => (
              <span key={i} className="inline-block w-5 text-center">{digit}</span>
            ))}
          </div>
          <div className="flex justify-end">
            <span className="w-5 text-center text-gray-700">{problem.operator}</span>
            {Array(op2.padding).fill(null).map((_, i) => (
              <span key={`pad2-${i}`} className="inline-block w-5"></span>
            ))}
            {op2.digits.map((digit, i) => (
              <span key={i} className="inline-block w-5 text-center">{digit}</span>
            ))}
          </div>
          <div
            className="border-b-2 border-black my-1"
            style={{ width: `${totalWidth * 1.25}rem` }}
          ></div>
          <div className="h-7"></div>
        </div>
      </div>
    </div>
  );
}

// 页面头部组件
function PageHeader({ t, showHeader }: { t: (key: string) => string; showHeader: boolean }) {
  if (!showHeader) return null;

  return (
    <div className="mb-6 border-b-2 border-gray-800 pb-4">
      <h1 className="text-3xl font-bold text-center mb-6 font-comic text-gray-800">
        {t('worksheet.mathPractice')}
      </h1>
      <div className="flex justify-between text-lg">
        <div className="flex gap-2 items-end">
          <span className="font-bold whitespace-nowrap leading-none">{t('worksheet.name')}:</span>
          <div className="w-40 border-b-2 border-gray-400"></div>
        </div>
        <div className="flex gap-2 items-end">
          <span className="font-bold whitespace-nowrap leading-none">{t('worksheet.date')}:</span>
          <div className="w-40 border-b-2 border-gray-400"></div>
        </div>
        <div className="flex gap-2 items-end">
          <span className="font-bold whitespace-nowrap leading-none">{t('worksheet.score')}:</span>
          <div className="w-20 border-b-2 border-gray-400"></div>
        </div>
      </div>
    </div>
  );
}

// 页面页脚组件
function PageFooter({ t, pageNum, totalPages }: { t: (key: string) => string; pageNum: number; totalPages: number }) {
  return (
    <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-400">
      {t('worksheet.taglineShort')} - {pageNum}/{totalPages}
    </div>
  );
}

// 单个 A4 页面组件
function A4Page({
  children,
  pageNum,
  totalPages,
  t,
  isLast
}: {
  children: React.ReactNode;
  pageNum: number;
  totalPages: number;
  t: (key: string) => string;
  isLast: boolean;
}) {
  return (
    <div
      className={`a4-page bg-white relative ${!isLast ? 'mb-4 print:mb-0' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '10mm 10mm 20mm 10mm',
        boxSizing: 'border-box',
        pageBreakAfter: isLast ? 'auto' : 'always',
        breakAfter: isLast ? 'auto' : 'page',
      }}
    >
      {children}
      <PageFooter t={t} pageNum={pageNum} totalPages={totalPages} />
    </div>
  );
}

export function MathWorksheet({ problems, format = 'horizontal', includeAnswers }: MathWorksheetProps) {
  const { t } = useTranslation();

  if (problems.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-lg">{t('worksheet.emptyMath')}</p>
      </div>
    );
  }

  const config = A4_CONFIG[format];
  const { cols, firstPageRows, otherPageRows } = config;

  // 将题目按行分组
  const allRows: MathProblem[][] = [];
  for (let i = 0; i < problems.length; i += cols) {
    allRows.push(problems.slice(i, i + cols));
  }

  // 将行分配到各个页面
  const pages: { rows: MathProblem[][]; startIndex: number; isFirst: boolean }[] = [];
  let currentRowIndex = 0;

  // 第一页
  const firstPageRowCount = Math.min(firstPageRows, allRows.length);
  pages.push({
    rows: allRows.slice(0, firstPageRowCount),
    startIndex: 0,
    isFirst: true,
  });
  currentRowIndex = firstPageRowCount;

  // 后续页面
  while (currentRowIndex < allRows.length) {
    const rowCount = Math.min(otherPageRows, allRows.length - currentRowIndex);
    pages.push({
      rows: allRows.slice(currentRowIndex, currentRowIndex + rowCount),
      startIndex: currentRowIndex * cols,
      isFirst: false,
    });
    currentRowIndex += rowCount;
  }

  // 计算答案页数量（每页约40个答案）
  const answersPerPage = 50;
  const answerPages = includeAnswers ? Math.ceil(problems.length / answersPerPage) : 0;
  const totalPages = pages.length + answerPages;

  return (
    <div className="worksheet-container">
      {/* 题目页面 */}
      {pages.map((page, pageIndex) => (
        <A4Page
          key={pageIndex}
          pageNum={pageIndex + 1}
          totalPages={totalPages}
          t={t}
          isLast={pageIndex === pages.length - 1 && !includeAnswers}
        >
          <PageHeader t={t} showHeader={page.isFirst} />

          <div className="space-y-4">
            {page.rows.map((rowProblems, rowIndex) => {
              const globalRowIndex = page.isFirst
                ? rowIndex
                : (page.isFirst ? 0 : firstPageRows) + (pageIndex - 1) * otherPageRows + rowIndex;

              return (
                <div
                  key={rowIndex}
                  className={`grid gap-x-4 gap-y-2 ${
                    format === 'vertical' ? 'grid-cols-5' : 'grid-cols-3'
                  }`}
                >
                  {rowProblems.map((problem, colIndex) => {
                    // 计算全局题目索引
                    let globalIndex: number;
                    if (pageIndex === 0) {
                      globalIndex = rowIndex * cols + colIndex;
                    } else {
                      const firstPageProblems = firstPageRows * cols;
                      const previousPagesProblems = (pageIndex - 1) * otherPageRows * cols;
                      globalIndex = firstPageProblems + previousPagesProblems + rowIndex * cols + colIndex;
                    }

                    return (
                      <ProblemItem
                        key={problem.id}
                        problem={problem}
                        index={globalIndex}
                        format={format}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </A4Page>
      ))}

      {/* 答案页 */}
      {includeAnswers && (
        <A4Page
          pageNum={pages.length + 1}
          totalPages={totalPages}
          t={t}
          isLast={true}
        >
          <h2 className="text-2xl font-bold text-center mb-8 border-b-2 border-gray-800 pb-4">
            {t('worksheet.answerKey')}
          </h2>
          <div className="grid grid-cols-5 gap-x-4 gap-y-2 text-lg">
            {problems.map((problem, index) => (
              <div key={problem.id} className="flex gap-2">
                <span className="font-bold text-gray-500">{index + 1}.</span>
                <span className="text-blue-600 font-medium">
                  {problem.answer}
                  {problem.remainder !== undefined && (
                    <span className="text-orange-500">···{problem.remainder}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </A4Page>
      )}
    </div>
  );
}
