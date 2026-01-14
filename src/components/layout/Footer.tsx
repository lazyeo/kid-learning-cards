import { useTranslation } from 'react-i18next';

export function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-white py-8 px-4 mt-auto border-t border-gray-100 mb-16 md:mb-0">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-gray-400 text-sm">
          © {year} {t('footer.copyright')}
        </p>
        <p className="text-gray-300 text-xs mt-2">
          {t('footer.tagline')}
        </p>
      </div>
    </footer>
  );
}
