import { type MathProblem } from '../../../types/generator';
import { useTranslation } from 'react-i18next';

interface MathWorksheetProps {
  problems: MathProblem[];
  format?: 'horizontal' | 'vertical';
  includeAnswers?: boolean;
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

  return (
    <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-0 relative print:shadow-none print:border-none print:p-0 print:min-h-0 print:h-auto print:w-full">
      {/* 练习纸头部 */}
      <div className="mb-8 border-b-2 border-gray-800 pb-4 print:mb-4">
        <h1 className="text-3xl font-bold text-center mb-6 font-comic text-gray-800">{t('worksheet.mathPractice')}</h1>
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

      {/* 题目网格 - 按行分组以避免分页截断 */}
      {(() => {
        const cols = format === 'vertical' ? 5 : 3;
        const rows: MathProblem[][] = [];
        for (let i = 0; i < problems.length; i += cols) {
          rows.push(problems.slice(i, i + cols));
        }

        return (
          <div className="space-y-6">
            {rows.map((rowProblems, rowIndex) => (
              <div
                key={rowIndex}
                className={`problem-row grid gap-x-6 gap-y-4 ${
                  format === 'vertical' ? 'grid-cols-5' : 'grid-cols-3'
                }`}
              >
                {rowProblems.map((problem, colIndex) => {
                  const index = rowIndex * cols + colIndex;
                  return (
                    <div key={problem.id} className="problem-item flex items-center p-2 text-2xl font-medium">
                      <span className={`text-gray-400 text-lg shrink-0 mr-1 ${format === 'vertical' ? 'self-start mt-2' : ''}`}>
                        {index + 1}.
                      </span>

                      {format === 'horizontal' ? (
                        <div className="flex-1 flex items-center gap-1 whitespace-nowrap">
                          <span>{problem.operand1}</span>
                          <span>{problem.operator}</span>
                          <span>{problem.operand2}</span>
                          <span>=</span>
                          <span className="flex-1 max-w-14 h-10 border-b-2 border-gray-300"></span>
                          {/* 带余数的除法显示余数填写位置 */}
                          {problem.remainder !== undefined && (
                            <>
                              <span className="text-gray-500 text-lg">···</span>
                              <span className="w-8 h-10 border-b-2 border-gray-300"></span>
                            </>
                          )}
                        </div>
                      ) : (() => {
                        // 除法使用特殊的长除式格式
                        if (problem.operator === '÷') {
                          const dividendStr = String(problem.operand1);
                          const divisorStr = String(problem.operand2);
                          const contentWidth = dividendStr.length * 20 + 12;

                          return (
                            <div className="flex-1 font-mono text-xl">
                              <div className="inline-flex items-end">
                                {/* 除数 */}
                                <div className="flex items-center h-8">
                                  {divisorStr.split('').map((digit, i) => (
                                    <span key={i} className="inline-block w-5 text-center">{digit}</span>
                                  ))}
                                </div>
                                {/* 长除式符号：SVG 一体化绘制 */}
                                <div className="relative">
                                  <svg
                                    className="absolute top-0 left-0 pointer-events-none"
                                    width={contentWidth + 6}
                                    height="38"
                                    style={{ transform: 'translate(-4px, -2px)' }}
                                  >
                                    <path
                                      d={`M ${contentWidth + 4} 2
                                          L 14 2
                                          Q 6 2 6 10
                                          L 6 30
                                          Q 6 36 0 36`}
                                      stroke="black"
                                      strokeWidth="2"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {/* 被除数区域 */}
                                  <div className="flex pl-3 h-8 items-center" style={{ minWidth: `${contentWidth}px` }}>
                                    {dividendStr.split('').map((digit, i) => (
                                      <span key={i} className="inline-block w-5 text-center">{digit}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {/* 答案空白区域 */}
                              <div className="h-4"></div>
                            </div>
                          );
                        }

                        // 加减乘使用标准竖式格式
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
                          <div className="flex-1 font-mono text-xl">
                            <div className="inline-block">
                              {/* 第一行：operand1，右对齐 */}
                              <div className="flex justify-end">
                                <span className="w-5"></span>
                                {Array(op1.padding).fill(null).map((_, i) => (
                                  <span key={`pad1-${i}`} className="inline-block w-5"></span>
                                ))}
                                {op1.digits.map((digit, i) => (
                                  <span key={i} className="inline-block w-5 text-center">{digit}</span>
                                ))}
                              </div>
                              {/* 第二行：运算符 + operand2，右对齐 */}
                              <div className="flex justify-end">
                                <span className="w-5 text-center text-gray-700">{problem.operator}</span>
                                {Array(op2.padding).fill(null).map((_, i) => (
                                  <span key={`pad2-${i}`} className="inline-block w-5"></span>
                                ))}
                                {op2.digits.map((digit, i) => (
                                  <span key={i} className="inline-block w-5 text-center">{digit}</span>
                                ))}
                              </div>
                              {/* 横线 */}
                              <div
                                className="border-b-2 border-black my-1"
                                style={{ width: `${totalWidth * 1.25}rem` }}
                              ></div>
                              {/* 答案空白区域 */}
                              <div className="h-7"></div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}

      {/* 页脚：屏幕显示时正常位置，打印时固定在页面底部 */}
      <div className="mt-12 text-center text-sm text-gray-400 hidden print:block print-footer">
        {t('worksheet.tagline')}
      </div>
      <div className="mt-12 text-center text-sm text-gray-400 print:hidden">
        {t('worksheet.tagline')}
      </div>

      {/* 答案页 */}
      {includeAnswers && (
        <div className="break-before-page pt-8">
          <h2 className="text-2xl font-bold text-center mb-8 border-b-2 border-gray-800 pb-4">{t('worksheet.answerKey')}</h2>
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
        </div>
      )}
    </div>
  );
}
