import { useState, useEffect } from 'react';
import { Printer, Download, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { WritingOptions } from '../components/generators/writing/WritingOptions';
import { WritingWorksheet } from '../components/generators/writing/WritingWorksheet';
import { Button } from '../components/common/Button';
import { ScaledPreview } from '../components/common/ScaledPreview';
import { type WritingGeneratorOptions } from '../types/generator';
import { downloadPDF, printPDF } from '../utils/pdfGenerator';
import { routes } from '../config/routes';
import { getDefaultChineseContent, chineseDatabase } from '../data/chineseVocabulary';
import { vocabularyDatabase, sentenceTemplates } from '../data/englishVocabulary';

// 默认内容
const DEFAULT_ENGLISH_ALPHABET = 'Aa Bb Cc Dd Ee Ff\nGg Hh Ii Jj Kk Ll\nMm Nn Oo Pp Qq Rr\nSs Tt Uu Vv Ww Xx\nYy Zz';

// 随机选择数组元素
function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function WritingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<string>('');
  const [options, setOptions] = useState<WritingGeneratorOptions>({
    gridType: 'tian-zi-ge',
    content: '',
    showTracing: true,
    showPinyin: true,
    chineseDifficulty: 'beginner',
    chineseCategory: 'nature',
    englishType: 'alphabet',
    englishCategory: 'animals',
    englishCount: 8
  });

  // 根据选项生成内容
  const generateContent = (opts: WritingGeneratorOptions): string => {
    const isTianZiGe = opts.gridType === 'tian-zi-ge';

    if (isTianZiGe) {
      // 田字格：根据难度和分类生成汉字内容
      if (opts.chineseDifficulty === 'custom') {
        return opts.content || '';
      }

      if (opts.chineseCategory) {
        const category = chineseDatabase.find(c => c.id === opts.chineseCategory);
        if (category) return category.chars;
      }

      return getDefaultChineseContent(opts.chineseDifficulty || 'beginner');
    } else {
      // 四线格：根据英文练习类型生成内容
      switch (opts.englishType) {
        case 'alphabet':
          return DEFAULT_ENGLISH_ALPHABET;

        case 'words': {
          const category = vocabularyDatabase.find(c => c.id === opts.englishCategory);
          if (category) {
            const words = getRandomItems(category.words, opts.englishCount || 8);
            return words.join('\n');
          }
          return '';
        }

        case 'sentences': {
          const templates = getRandomItems(sentenceTemplates, opts.englishCount || 5);
          const nounCategories = ['animals', 'fruits', 'family', 'body'];
          const validWords = vocabularyDatabase
            .filter(c => nounCategories.includes(c.id))
            .flatMap(c => c.words);

          const sentences = templates.map(template => {
            const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
            let sentence = template.replace('[word]', randomWord);
            // 处理 a/an
            const vowelRegex = /\b(a)\s+([aeiou])/i;
            if (vowelRegex.test(sentence)) {
              sentence = sentence.replace(/\ba\s+([aeiou])/i, 'an $1');
            }
            return sentence;
          });
          return sentences.join('\n');
        }

        case 'custom':
          return opts.content || '';

        default:
          return DEFAULT_ENGLISH_ALPHABET;
      }
    }
  };

  // 初始化时生成默认内容
  useEffect(() => {
    const initialContent = generateContent(options);
    setContent(initialContent);
  }, []);

  // 处理选项变化
  const handleOptionsChange = (newOptions: WritingGeneratorOptions) => {
    const gridTypeChanged = newOptions.gridType !== options.gridType;
    const difficultyChanged = newOptions.chineseDifficulty !== options.chineseDifficulty;
    const categoryChanged = newOptions.chineseCategory !== options.chineseCategory;
    const englishTypeChanged = newOptions.englishType !== options.englishType;
    const englishCategoryChanged = newOptions.englishCategory !== options.englishCategory;

    // 格子类型切换时，重置为对应的默认设置
    if (gridTypeChanged) {
      if (newOptions.gridType === 'tian-zi-ge') {
        newOptions.chineseDifficulty = newOptions.chineseDifficulty || 'beginner';
        newOptions.chineseCategory = newOptions.chineseCategory || 'nature';
      } else {
        newOptions.englishType = newOptions.englishType || 'alphabet';
        newOptions.englishCategory = newOptions.englishCategory || 'animals';
      }
    }

    // 难度切换时，重置分类为该难度下的第一个分类
    if (difficultyChanged && newOptions.chineseDifficulty !== 'custom') {
      const categories = chineseDatabase.filter(c => c.difficulty === newOptions.chineseDifficulty);
      if (categories.length > 0) {
        newOptions.chineseCategory = categories[0].id;
      }
    }

    setOptions(newOptions);

    // 自动更新预览内容（仅当选项变化时）
    if (gridTypeChanged || difficultyChanged || categoryChanged || englishTypeChanged || englishCategoryChanged) {
      const newContent = generateContent(newOptions);
      setContent(newContent);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const newContent = generateContent(options);
      if (!newContent.trim()) {
        toast.error(t('writing.inputContent'));
        setIsGenerating(false);
        return;
      }

      setContent(newContent);
      toast.success(t('writing.updateSuccess'));
      setTimeout(scrollToPreview, 50);
    } catch (error) {
      console.error(error);
      toast.error(t('writing.generateFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!content) {
      toast.error(t('writing.generateFirst'));
      return;
    }
    printPDF({
      elementId: 'writing-worksheet-preview'
    });
  };

  const handleDownload = () => {
    if (!content) {
      toast.error(t('writing.generateFirst'));
      return;
    }
    downloadPDF({
      filename: 'writing-worksheet',
      elementId: 'writing-worksheet-preview'
    });
  };

  const isTianZiGe = options.gridType === 'tian-zi-ge';

  const scrollToPreview = () => {
    const el = document.getElementById('writing-worksheet-preview');
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
          <h1 className="text-2xl font-bold text-gray-800 truncate">{t('writing.title')}</h1>
        </div>

        {/* 桌面端显示的按钮 */}
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            {t('common.print')}
          </Button>
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={!content}
          >
            {t('common.download')}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 md:gap-8">
        {/* 左侧选项面板 - 打印时隐藏 */}
        <div className="lg:col-span-4 no-print space-y-4 md:space-y-6">
          <WritingOptions
            options={options}
            onChange={handleOptionsChange}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          <div className={`${isTianZiGe ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'} p-4 rounded-2xl text-sm`}>
            <h3 className="font-bold mb-2 flex items-center gap-2">
              💡 {t('common.tips')}
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              {isTianZiGe ? (
                (t('writing.tips.chinese', { returnObjects: true }) as string[]).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))
              ) : (
                (t('writing.tips.english', { returnObjects: true }) as string[]).map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="lg:col-span-8">
          <ScaledPreview id="writing-worksheet-preview" contentWidth={800} fit="width">
            <WritingWorksheet options={options} content={content} />
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
          className="flex-1"
        >
          {t('common.print')}
        </Button>
        <Button
          variant="primary"
          icon={<Download className="w-4 h-4" />}
          onClick={handleDownload}
          disabled={!content}
          className="flex-1"
        >
          {t('common.download')}
        </Button>
      </div>
    </>
  );
}
