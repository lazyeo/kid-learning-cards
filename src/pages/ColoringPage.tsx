import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { ColoringOptions } from '../components/generators/coloring/ColoringOptions';
import { ColoringPreview } from '../components/generators/coloring/ColoringPreview';
import { Button } from '../components/common/Button';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { downloadPDF, printPDF } from '../utils/pdfGenerator';
import { routes } from '../config/routes';

export function ColoringPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading, imageUrl, error, generate } = useImageGeneration();

  const handlePrint = async () => {
    if (!imageUrl) {
      toast.error(t('coloring.generateFirst'));
      return;
    }
    printPDF({ elementId: 'coloring-worksheet-preview' });
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    downloadPDF({
      filename: 'coloring-page',
      elementId: 'coloring-worksheet-preview'
    });
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
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">{t('coloring.title')}</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            disabled={!imageUrl}
          >
            {t('common.print')}
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={!imageUrl}
          >
            {t('common.downloadPdf')}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左侧选项面板 - 打印时隐藏 */}
        <div className="lg:col-span-4 no-print space-y-6">
          <ColoringOptions
            onGenerate={generate}
            isGenerating={isLoading}
          />

          <div className="bg-green-50 p-4 rounded-2xl text-sm text-green-700">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              💡 {t('common.tips')}
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              {(t('coloring.tips', { returnObjects: true }) as string[]).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="lg:col-span-8">
          <div className="print:w-full" id="coloring-worksheet-preview">
            <ColoringPreview
              imageUrl={imageUrl}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
