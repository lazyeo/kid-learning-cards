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
    <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[29.7cm] relative print:shadow-none print:border-none print:p-0 print:min-h-0 print:h-auto print:w-full">
      {/* 练习纸头部 */}
      <div className="mb-8 border-b-2 border-gray-800 pb-4 print:mb-4">
        <h1 className="text-3xl font-bold text-center mb-6 font-comic text-gray-800">{t('worksheet.mathPractice')}</h1>
        <div className="flex justify-between text-lg">
          <div className="flex gap-2">
            <span className="font-bold">{t('worksheet.name')}:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">{t('worksheet.date')}:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">{t('worksheet.score')}:</span>
            <div className="w-20 border-b-2 border-gray-400"></div>
          </div>
        </div>
      </div>

      {/* 题目网格 */}
      <div className={`grid gap-x-6 gap-y-10 ${
        format === 'vertical'
          ? 'grid-cols-4 md:grid-cols-5 print:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-3 print:grid-cols-3'
      }`}>
        {problems.map((problem, index) => (
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
              </div>
            ) : (
              <div className="flex-1 font-mono text-xl">
                <div className="inline-block">
                  <div className="h-4 text-xs text-gray-300 text-right pr-1"></div>
                  <div className="text-right tabular-nums tracking-wider pr-1">
                    {String(problem.operand1).split('').map((digit, i) => (
                      <span key={i} className="inline-block w-5 text-center">{digit}</span>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <span className="w-5 text-center text-gray-700">{problem.operator}</span>
                    <span className="tabular-nums tracking-wider">
                      {String(problem.operand2).split('').map((digit, i) => (
                        <span key={i} className="inline-block w-5 text-center">{digit}</span>
                      ))}
                    </span>
                  </div>
                  <div className="border-b-2 border-black my-1" style={{
                    width: `${Math.max(String(problem.operand1).length, String(problem.operand2).length + 1) * 1.25 + 0.5}rem`
                  }}></div>
                  <div className="h-7"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-400 print:absolute print:bottom-4 print:left-0 print:w-full">
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
                <span className="text-blue-600 font-medium">{problem.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
