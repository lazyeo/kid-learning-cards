import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] font-[family-name:var(--font-comic)]">
      <Header />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in">
        {children || <Outlet />}
      </main>

      <Footer />

      <Toaster
        position="top-center"
        containerClassName="no-print"
        toastOptions={{
          className: 'rounded-xl shadow-lg',
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
        }}
      />
    </div>
  );
}
