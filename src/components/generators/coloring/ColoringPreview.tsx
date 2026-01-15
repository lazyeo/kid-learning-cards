import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../../common/LoadingSpinner';

interface ColoringPreviewProps {
  imageUrl: string | null;
  isLoading: boolean;
  error: Error | null;
}

export function ColoringPreview({ imageUrl, isLoading, error }: ColoringPreviewProps) {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="bg-red-50 p-8 rounded-3xl border-2 border-red-100 flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{t('worksheet.error.title')}</h3>
        <p className="text-gray-600 max-w-md">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 flex flex-col items-center justify-center min-h-[600px]">
        <LoadingSpinner size="large" text={t('worksheet.loading.text')} />
        <p className="text-gray-400 text-sm mt-4 animate-pulse">
          {t('worksheet.loading.hint')}
        </p>
        <div className="w-64 h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-[var(--color-primary)] animate-progress origin-left"></div>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[600px] text-gray-400">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🎨</span>
        </div>
        <h3 className="text-xl font-bold text-gray-500 mb-2">{t('worksheet.emptyColoring.title')}</h3>
        <p className="max-w-xs text-center">
          {t('worksheet.emptyColoring.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 shadow-sm border border-gray-200 min-h-0 relative print:shadow-none print:border-none print:p-0 print:min-h-0 print:h-auto print:w-full flex flex-col">
      {/* Header for Print */}
      <div className="mb-8 border-b-2 border-gray-800 pb-4 print:mb-4">
        <h1 className="text-3xl font-bold text-center mb-6 font-comic text-gray-800">{t('worksheet.coloringTime')}</h1>
        <div className="flex justify-between text-lg">
          <div className="flex gap-2 items-center">
            <span className="font-bold whitespace-nowrap">{t('worksheet.name')}:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
          <div className="flex gap-2 items-center">
            <span className="font-bold whitespace-nowrap">{t('worksheet.date')}:</span>
            <div className="w-40 border-b-2 border-gray-400"></div>
          </div>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-4 border-4 border-gray-800 rounded-xl">
        <img
          src={imageUrl}
          alt="Generated coloring page"
          className="max-w-full max-h-[22cm] object-contain filter contrast-125 grayscale"
          crossOrigin="anonymous"
        />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-400 print:absolute print:bottom-4 print:left-0 print:w-full">
        {t('worksheet.tagline')}
      </div>
    </div>
  );
}
