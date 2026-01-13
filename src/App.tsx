import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { routes } from './config/routes';
import { HomePage } from './pages/HomePage';
import { ColoringPage } from './pages/ColoringPage';
import { MathPage } from './pages/MathPage';
import { EnglishPage } from './pages/EnglishPage';
import { WritingPage } from './pages/WritingPage';
import { NotFoundPage } from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} /> {/* Changed to HomePage */}
          <Route path={routes.coloring} element={<ColoringPage />} />
          <Route path={routes.math} element={<MathPage />} />
          <Route path={routes.english} element={<EnglishPage />} />
          <Route path={routes.writing} element={<WritingPage />} />
        </Route>
        <Route path={routes.notFound} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
