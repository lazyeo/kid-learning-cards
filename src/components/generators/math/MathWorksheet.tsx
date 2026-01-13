import { type MathProblem } from '../../../types/generator';

interface MathWorksheetProps {
  problems: MathProblem[];
  includeAnswers?: boolean;
}

export function MathWorksheet({ problems, includeAnswers }: MathWorksheetProps) {
  if (problems.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-lg">点击左侧"开始生成"按钮创建练习题</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-[29.7cm] relative print:shadow-none print:border-none print:p-0 print:min-h-0 print:h-auto print:w-full">
      {/* 练习纸头部 */}
      <div className="mb-8 border-b-2 border-gray-800 pb-4 print:mb-4">
        <h1 className="text-3xl font-bold text-center mb-6 font-comic text-gray-800">数学练习</h1>
        <div className="flex justify-between text-lg">
          <div className="flex gap-2">
            <span className="font-bold">姓名:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">日期:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">得分:</span>
            <div className="w-20 border-b-2 border-gray-400"></div>
          </div>
        </div>
      </div>

      {/* 题目网格 */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-10 md:grid-cols-3 print:grid-cols-3">
        {problems.map((problem, index) => (
          <div key={problem.id} className="problem-item flex items-center text-2xl font-medium p-2">
            <span className="text-gray-400 mr-4 text-lg w-8">{index + 1}.</span>
            <div className="flex-1 flex justify-between items-center whitespace-nowrap">
              <span className="w-12 text-right">{problem.operand1}</span>
              <span className="mx-2">{problem.operator}</span>
              <span className="w-12 text-left">{problem.operand2}</span>
              <span className="mx-2">=</span>
              <span className="w-20 h-10 border-b-2 border-gray-300"></span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-400 print:absolute print:bottom-4 print:left-0 print:w-full">
        Kids Learning Cards - AI 驱动的儿童教育资源生成器
      </div>

      {/* 答案页 (打印时在新的一页) */}
      {includeAnswers && (
        <div className="hidden print:block page-break">
          <div className="pt-8">
            <h2 className="text-2xl font-bold text-center mb-8 border-b-2 border-gray-800 pb-4">参考答案</h2>
            <div className="grid grid-cols-4 gap-4 text-lg">
              {problems.map((problem, index) => (
                <div key={problem.id} className="flex gap-2">
                  <span className="font-bold text-gray-500">{index + 1}.</span>
                  <span>{problem.answer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
