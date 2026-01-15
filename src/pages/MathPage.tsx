import { useState } from 'react';
import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { MathOptions } from '../components/generators/math/MathOptions';
import { MathWorksheet } from '../components/generators/math/MathWorksheet';
import { Button } from '../components/common/Button';
import { ScaledPreview } from '../components/common/ScaledPreview';
import { generateMathProblems } from '../utils/mathGenerator';
import { type MathGeneratorOptions, type MathProblem } from '../types/generator';
import { downloadPDF, printPDF } from '../utils/pdfGenerator';
import { routes } from '../config/routes';

export function MathPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [options, setOptions] = useState<MathGeneratorOptions>({
    type: 'addition',
    difficulty: 'easy',
    count: 20,
    format: 'horizontal',
    includeAnswers: true
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newProblems = generateMathProblems(options);
      setProblems(newProblems);
      toast.success(t('math.generateSuccess'));
      // 生成完成后滚动到预览
      setTimeout(scrollToPreview, 50);
    } catch (error) {
      console.error(error);
      toast.error(t('math.generateFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (problems.length === 0) {
      toast.error(t('math.generateFirst'));
      return;
    }
    printPDF({
      elementId: 'math-worksheet-preview'
    });
  };

  const handleDownload = () => {
    if (problems.length === 0) {
      toast.error(t('math.generateFirst'));
      return;
    }
    downloadPDF({
      filename: 'math-worksheet',
      elementId: 'math-worksheet-preview'
    });
  };

  const scrollToPreview = () => {
    const el = document.getElementById('math-worksheet-preview');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
    <div className="animate-fade-in max-w-full overflow-x-hidden pb-16 md:pb-0">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-4 no-print">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate(routes.home)}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 truncate">{t('math.title')}</h1>
        </div>

        {/* 桌面端显示的按钮 */}
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            disabled={problems.length === 0}
          >
            {t('common.print')}
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={problems.length === 0}
          >
            {t('common.download')}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
        {/* 左侧选项面板 - 打印时隐藏 */}
        <div className="lg:col-span-4 no-print space-y-4 md:space-y-6">
          <MathOptions
            options={options}
            onChange={setOptions}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          <div className="bg-blue-50 p-4 rounded-2xl text-sm text-blue-700">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              💡 {t('common.tips')}
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              {(t('math.tips', { returnObjects: true }) as string[]).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 右侧预览区域 - 占据更多空间 */}
        <div className="lg:col-span-8">
          <ScaledPreview id="math-worksheet-preview" contentWidth={800} fit="width">
            <MathWorksheet problems={problems} format={options.format} includeAnswers={options.includeAnswers} />
          </ScaledPreview>
        </div>
      </div>
    </div>

      {/* 移动端固定底部操作栏 - 在 tab 上方，必须在动画容器外 */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2 z-40 md:hidden no-print shadow-lg">
        <Button
          variant="outline"
          icon={<Printer className="w-4 h-4" />}
          onClick={handlePrint}
          disabled={problems.length === 0}
          className="flex-1"
        >
          {t('common.print')}
        </Button>
        <Button
          variant="primary"
          icon={<Download className="w-4 h-4" />}
          onClick={handleDownload}
          disabled={problems.length === 0}
          className="flex-1"
        >
          {t('common.download')}
        </Button>
      </div>
    </>
  );
}
