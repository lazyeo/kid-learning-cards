import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  text = '加载中...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <Loader2 className={`animate-spin text-[var(--color-primary)] ${sizes[size]}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
      {text && (
        <p className="mt-4 text-gray-500 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
