import { useState } from 'react';
import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { EnglishOptions } from '../components/generators/english/EnglishOptions';
import { EnglishWorksheet } from '../components/generators/english/EnglishWorksheet';
import { Button } from '../components/common/Button';
import { type EnglishGeneratorOptions } from '../types/generator';
import { vocabularyDatabase, sentenceTemplates } from '../data/englishVocabulary';
import { downloadPDF } from '../utils/pdfGenerator';
import { routes } from '../config/routes';

export function EnglishPage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<string[]>([]);
  const [options, setOptions] = useState<EnglishGeneratorOptions>({
    type: 'words',
    category: 'animals',
    count: 5,
    showTracing: true,
    showLines: true
  });

  const getRandomItems = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      let newContent: string[] = [];

      if (options.type === 'words') {
        const category = vocabularyDatabase.find(c => c.id === options.category);
        if (category) {
          newContent = getRandomItems(category.words, options.count);
        }
      } else {
        // 生成句子：随机选择模板并填入随机单词
        const templates = getRandomItems(sentenceTemplates, options.count);

        // 过滤出适合填入句子的名词分类 (排除 sight words, 颜色, 数字等非名词或形容词)
        const nounCategories = ['animals', 'fruits', 'family', 'body'];
        const validWords = vocabularyDatabase
          .filter(c => nounCategories.includes(c.id))
          .flatMap(c => c.words);

        newContent = templates.map(template => {
          const randomWord = validWords[Math.floor(Math.random() * validWords.length)];

          // 简单的 a/an 处理
          let sentence = template.replace('[word]', randomWord);

          // 如果句子包含 " a [元音开头单词]"，替换为 " an [单词]"
          // 这里做一个简单的正则替换，处理生成后的结果
          const vowelRegex = /\b(a)\s+([aeiou])/i;
          if (vowelRegex.test(sentence)) {
             sentence = sentence.replace(/\ba\s+([aeiou])/i, 'an $1');
          }

          return sentence;
        });
      }

      setContent(newContent);
      toast.success('Generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (content.length === 0) {
      toast.error('Please generate content first');
      return;
    }
    window.print();
  };

  const handleDownload = () => {
    if (content.length === 0) {
      toast.error('Please generate content first');
      return;
    }
    downloadPDF({
      filename: 'english-worksheet',
      elementId: 'english-worksheet-preview'
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
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">English Practice Generator</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
            disabled={content.length === 0}
          >
            Print
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={content.length === 0}
          >
            Download
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 左侧选项面板 */}
        <div className="lg:col-span-4 no-print space-y-6">
          <EnglishOptions
            options={options}
            onChange={setOptions}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          <div className="bg-purple-50 p-4 rounded-2xl text-sm text-purple-700">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              💡 Tips
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>Choose "Words" for vocabulary tracing practice.</li>
              <li>"Sentences" helps with reading and writing flow.</li>
              <li>Tracing lines help kids learn letter proportions.</li>
              <li>Print landscape for longer sentences.</li>
            </ul>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="lg:col-span-8">
          <div className="print:w-full" id="english-worksheet-preview">
            <EnglishWorksheet options={options} content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}
