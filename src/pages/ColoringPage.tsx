import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { ColoringOptions } from '../components/generators/coloring/ColoringOptions';
import { ColoringPreview } from '../components/generators/coloring/ColoringPreview';
import { Button } from '../components/common/Button';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { downloadPDF } from '../utils/pdfGenerator';
import { routes } from '../config/routes';

export function ColoringPage() {
  const navigate = useNavigate();
  const { isLoading, imageUrl, error, generate } = useImageGeneration();

  const handlePrint = () => {
    if (!imageUrl) {
      toast.error('请先生成涂色卡片');
      return;
    }
    window.print();
  };

  const handleDownload = async () => {
    if (!imageUrl) return;

    // 使用 PDF 下载工具，将整个练习纸（包含抬头）保存为 PDF
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
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">涂色卡片生成器</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            disabled={!imageUrl}
          >
            打印
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={!imageUrl}
          >
            下载 PDF
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
              💡 使用贴士
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>尝试组合不同的主题和对象</li>
              <li>"简单"难度适合幼儿，线条更粗更少</li>
              <li>如果您有 API Key，请在部署后配置环境变量</li>
              <li>打印时建议使用 A4 纸张</li>
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
