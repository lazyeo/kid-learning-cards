import { Link } from 'react-router-dom';
import { routes } from '../../config/routes';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';

export function Header() {
  return (
    <header className="bg-white py-4 px-6 md:py-6 shadow-sm hidden md:block">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to={routes.home} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md rotate-3">
            K
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Kids Learning Cards
          </h1>
        </Link>

        <div className="flex gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
