import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Images, TrendingUp, Clock, ChevronDown, Wand2 } from 'lucide-react';
import { fetchGalleryImages, type GalleryImage } from '../../../services/api/client';

const PAGE_SIZE = 12;

interface ColoringGalleryProps {
  onSelectImage: (imageUrl: string, imageId: string) => void;
  onGenerateNew: () => void;
  isGenerating: boolean;
}

export function ColoringGallery({ onSelectImage, onGenerateNew, isGenerating }: ColoringGalleryProps) {
  const { t } = useTranslation();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [orderBy, setOrderBy] = useState<'popular' | 'recent'>('recent');

  const themes = [
    { value: 'all', labelKey: 'coloring.gallery.allThemes' },
    { value: 'animals', labelKey: 'coloring.options.themes.animals' },
    { value: 'vehicles', labelKey: 'coloring.options.themes.vehicles' },
    { value: 'plants', labelKey: 'coloring.options.themes.plants' },
    { value: 'fantasy', labelKey: 'coloring.options.themes.fantasy' },
    { value: 'food', labelKey: 'coloring.options.themes.food' },
  ];

  useEffect(() => {
    loadGallery(true);
  }, [selectedTheme, orderBy]);

  const loadGallery = async (reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
      setImages([]);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const currentCount = reset ? 0 : images.length;
      const data = await fetchGalleryImages({
        theme: selectedTheme === 'all' ? undefined : selectedTheme,
        limit: PAGE_SIZE,
        offset: currentCount,
        orderBy
      });

      if (reset) {
        setImages(data);
      } else {
        setImages(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadGallery(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Images className="w-5 h-5 text-amber-500" />
          {t('coloring.gallery.title')}
        </h3>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* 主题筛选 */}
        <div className="flex flex-wrap gap-1">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => setSelectedTheme(theme.value)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedTheme === theme.value
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t(theme.labelKey)}
            </button>
          ))}
        </div>

        {/* 排序 */}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setOrderBy('popular')}
            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
              orderBy === 'popular'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {t('coloring.gallery.popular')}
          </button>
          <button
            onClick={() => setOrderBy('recent')}
            className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
              orderBy === 'recent'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-3 h-3" />
            {t('coloring.gallery.recent')}
          </button>
        </div>
      </div>

      {/* 图片网格 */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {/* 生成新图卡片 - 骨架 */}
          <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          {Array(7).fill(null).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* 生成新图入口卡片 - 始终显示在第一个 */}
            <button
              onClick={onGenerateNew}
              disabled={isGenerating}
              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-amber-300 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-amber-700 text-center px-2">
                {t('coloring.gallery.generateNew')}
              </span>
            </button>

            {images.length === 0 ? (
              <div className="col-span-2 sm:col-span-3 flex items-center justify-center text-gray-400">
                <p className="text-sm">{t('coloring.gallery.empty')}</p>
              </div>
            ) : (
              images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelectImage(image.imageUrl, image.id)}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-amber-400 transition-all"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.subject}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{image.subject}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* 加载更多按钮 */}
          {hasMore && images.length > 0 && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              {isLoadingMore ? (
                <span className="animate-pulse">{t('common.loading')}</span>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  {t('coloring.gallery.loadMore')}
                </>
              )}
            </button>
          )}
        </>
      )}

      {/* 提示 */}
      <p className="text-xs text-gray-400 text-center mt-3">
        {t('coloring.gallery.hint')}
      </p>
    </div>
  );
}
