import { useState } from 'react';
import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { WritingOptions } from '../components/generators/writing/WritingOptions';
import { WritingWorksheet } from '../components/generators/writing/WritingWorksheet';
import { Button } from '../components/common/Button';
import { type WritingGeneratorOptions } from '../types/generator';
import { downloadPDF, printPDF } from '../utils/pdfGenerator';
import { routes } from '../config/routes';

export function WritingPage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<string>('天地玄黄');
  const [options, setOptions] = useState<WritingGeneratorOptions>({
    gridType: 'tian-zi-ge',
    content: '天地玄黄',
    showTracing: true,
    showPinyin: true
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    // 如果没有输入内容，给出提示
    if (!options.content.trim()) {
      toast.error('请输入练习内容');
      setIsGenerating(false);
      return;
    }

    try {
      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 更新显示的练习内容
      setContent(options.content);
      toast.success('练习纸已更新！');
    } catch (error) {
      console.error(error);
      toast.error('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!content) {
      toast.error('请先生成练习内容');
      return;
    }
    printPDF({
      elementId: 'writing-worksheet-preview'
    });
  };

  const handleDownload = () => {
    if (!content) {
      toast.error('请先生成练习内容');
      return;
    }
    downloadPDF({
      filename: 'writing-worksheet',
      elementId: 'writing-worksheet-preview'
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
          <h1 className="text-2xl font-bold text-gray-800">书写练习生成器</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            打印
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={!content}
          >
            下载
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左侧选项面板 - 打印时隐藏 */}
        <div className="lg:col-span-4 no-print space-y-6">
          <WritingOptions
            options={options}
            onChange={setOptions}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          <div className="bg-orange-50 p-4 rounded-2xl text-sm text-orange-700">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              💡 使用贴士
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>田字格适合汉字书写练习</li>
              <li>四线格适合英文字母书写</li>
              <li>勾选"显示描红"可以生成临摹字帖</li>
              <li>输入的内容会自动填充到格子中</li>
            </ul>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="lg:col-span-8">
          <div className="print:w-full" id="writing-worksheet-preview">
            <WritingWorksheet options={options} content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
