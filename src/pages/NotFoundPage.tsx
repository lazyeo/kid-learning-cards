import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';
import { routes } from '../config/routes';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('notFound.title')}</h2>
        <p className="text-gray-500 mb-8">{t('notFound.description')}</p>
        <Button
          onClick={() => navigate(routes.home)}
          icon={<Home className="w-4 h-4" />}
        >
          {t('notFound.backHome')}
        </Button>
      </div>
    </div>
  );
}

