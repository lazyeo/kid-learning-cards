import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Palette, Calculator, PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { routes } from '../../config/routes';

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`
        flex flex-col items-center justify-center p-2 rounded-xl transition-all
        ${isActive
          ? 'text-primary bg-orange-50 font-bold scale-105'
          : 'text-gray-500 hover:text-primary hover:bg-gray-50'
        }
      `}
    >
      <div className={`p-2 rounded-full ${isActive ? 'bg-orange-100' : ''}`}>
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

export function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation();

  const navItems = [
    { path: routes.home, icon: <Home size={24} />, labelKey: 'nav.home' },
    { path: routes.math, icon: <Calculator size={24} />, labelKey: 'nav.math' },
    { path: routes.writing, icon: <PenTool size={24} />, labelKey: 'nav.writing' },
    { path: routes.coloring, icon: <Palette size={24} />, labelKey: 'nav.coloring' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg pb-safe z-50 md:sticky md:top-0 md:border-b md:border-t-0 md:pb-0">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around items-center h-16 md:h-20">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={t(item.labelKey)}
              isActive={currentPath === item.path}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
