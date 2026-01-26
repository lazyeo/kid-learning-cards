import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { ColoringOptions } from '../components/generators/coloring/ColoringOptions';
import { ColoringPreview } from '../components/generators/coloring/ColoringPreview';
import { ColoringGallery } from '../components/generators/coloring/ColoringGallery';
import { Button } from '../components/common/Button';
import { ScaledPreview } from '../components/common/ScaledPreview';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { downloadPDF, printPDF } from '../utils/pdfGenerator';
import { incrementImageAccessCount } from '../services/api/client';
import { routes } from '../config/routes';

export function ColoringPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading, imageUrl, error, generate, setImageUrl, galleryImageId } = useImageGeneration();
  const [showOptions, setShowOptions] = useState(false);

  const handlePrint = async () => {
    if (!imageUrl) {
      toast.error(t('coloring.generateFirst'));
      return;
    }
    // 如果是图库图片，增加访问计数
    if (galleryImageId) {
      incrementImageAccessCount(galleryImageId);
    }
    printPDF({ elementId: 'coloring-worksheet-preview' });
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    // 如果是图库图片，增加访问计数
    if (galleryImageId) {
      incrementImageAccessCount(galleryImageId);
    }
    downloadPDF({
      filename: 'coloring-page',
      elementId: 'coloring-worksheet-preview'
    });
  };

  // 生成图片后自动滚动到预览
  useEffect(() => {
    if (imageUrl && !isLoading) {
      const el = document.getElementById('coloring-worksheet-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [imageUrl, isLoading]);

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
          <h1 className="text-2xl font-bold text-gray-800 truncate">{t('coloring.title')}</h1>
        </div>

        {/* 桌面端显示的按钮 */}
        <div className="hidden md:flex gap-2">
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

      <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
        {/* 左侧选项面板 - 打印时隐藏 */}
        <div className="lg:col-span-4 no-print space-y-4 md:space-y-6">
          {/* 图库 - 默认显示 */}
          {!showOptions && (
            <ColoringGallery
              onSelectImage={(url, imageId) => {
                setImageUrl(url, imageId);
                toast.success(t('coloring.gallery.selected'));
              }}
              onGenerateNew={() => setShowOptions(true)}
              isGenerating={isLoading}
            />
          )}

          {/* 生成选项 - 点击"生成新图"后显示 */}
          {showOptions && (
            <>
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('coloring.gallery.backToGallery')}
                </button>
              </div>
              <ColoringOptions
                onGenerate={(params) => {
                  generate(params);
                }}
                isGenerating={isLoading}
              />
            </>
          )}

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
          <ScaledPreview id="coloring-worksheet-preview" contentWidth={800} fit="width">
            <ColoringPreview
              imageUrl={imageUrl}
              isLoading={isLoading}
              error={error}
            />
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
          disabled={!imageUrl}
          className="flex-1"
        >
          {t('common.print')}
        </Button>
        <Button
          variant="primary"
          icon={<Download className="w-4 h-4" />}
          onClick={handleDownload}
          disabled={!imageUrl}
          className="flex-1"
        >
          {t('common.downloadPdf')}
        </Button>
      </div>
    </>
  );
}
