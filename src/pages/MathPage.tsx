import { useState } from 'react';
import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { MathOptions } from '../components/generators/math/MathOptions';
import { MathWorksheet } from '../components/generators/math/MathWorksheet';
import { Button } from '../components/common/Button';
import { generateMathProblems } from '../utils/mathGenerator';
import { type MathGeneratorOptions, type MathProblem } from '../types/generator';
import { routes } from '../config/routes';

export function MathPage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [options, setOptions] = useState<MathGeneratorOptions>({
    type: 'addition',
    difficulty: 'easy',
    count: 20,
    includeAnswers: true
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // 模拟一点延迟，让用户感知到生成过程
      await new Promise(resolve => setTimeout(resolve, 500));

      const newProblems = generateMathProblems(options);
      setProblems(newProblems);
      toast.success('练习题生成成功！');
    } catch (error) {
      console.error(error);
      toast.error('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (problems.length === 0) {
      toast.error('请先生成练习题');
      return;
    }
    window.print();
  };

  return (
    <div className="animate-fade-in">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate(routes.home)}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">数学练习生成器</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            disabled={problems.length === 0}
          >
            打印
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            disabled={true} // 暂时禁用，HTML转图片功能在后续阶段实现
            title="下载图片功能即将上线"
          >
            下载
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左侧选项面板 - 打印时隐藏 */}
        <div className="lg:col-span-4 no-print space-y-6">
          <MathOptions
            options={options}
            onChange={setOptions}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          <div className="bg-blue-50 p-4 rounded-2xl text-sm text-blue-700">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              💡 使用贴士
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>建议先从简单难度开始，建立孩子信心</li>
              <li>混合运算可以全面考察计算能力</li>
              <li>打印时会自动优化排版，节省墨水</li>
              <li>勾选"包含答案页"方便批改作业</li>
            </ul>
          </div>
        </div>

        {/* 右侧预览区域 - 占据更多空间 */}
        <div className="lg:col-span-8">
          <div className="print:w-full">
            <MathWorksheet problems={problems} includeAnswers={options.includeAnswers} />
          </div>
        </div>
      </div>
    </div>
  );
}
