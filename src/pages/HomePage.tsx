import { useNavigate } from 'react-router-dom';
import { Palette, Calculator, PenTool, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { routes } from '../config/routes';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  isNew?: boolean;
}

function FeatureCard({ title, description, icon, color, path, isNew }: FeatureCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      className="h-full flex flex-col relative group overflow-visible"
      onClick={() => navigate(path)}
    >
      {isNew && (
        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce z-10">
          NEW!
        </div>
      )}

      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg
        transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300
      `} style={{ backgroundColor: color }}>
        {icon}
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
        {title}
      </h3>

      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
        {description}
      </p>

      <div className="flex items-center text-[var(--color-primary)] font-bold text-sm group-hover:translate-x-2 transition-transform">
        开始生成 <ArrowRight className="ml-2 w-4 h-4" />
      </div>
    </Card>
  );
}

export function HomePage() {
  const features = [
    {
      title: '数学练习',
      description: '生成加减乘除练习题，支持多种难度，帮助孩子提升计算能力。',
      icon: <Calculator size={32} />,
      color: '#4ECDC4', // Secondary
      path: routes.math,
    },
    {
      title: '书写练习',
      description: '支持汉字田字格和英文四线格，内置难度分级和丰富词库，满足中英文书写练习需求。',
      icon: <PenTool size={32} />,
      color: '#FF6B6B', // Primary
      path: routes.writing,
      isNew: true,
    },
    {
      title: '涂色卡片',
      description: 'AI 生成各种主题的涂色线稿，激发孩子的想象力和艺术创造力。',
      icon: <Palette size={32} />,
      color: '#95E1D3', // Success
      path: routes.coloring,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-gradient-to-b from-orange-50 to-transparent -z-10 rounded-full blur-3xl opacity-60"></div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 leading-tight">
          让学习变得 <span className="text-[var(--color-primary)] relative inline-block">
            更有趣
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-[var(--color-accent)] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Kids Learning Cards 是一个 AI 驱动的教育资源生成器。
          只需几秒钟，就能为您的孩子创建个性化的练习纸和涂色卡片。
        </p>

        <div className="flex justify-center gap-4">
          <Button size="large" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            开始探索
          </Button>
          <Button variant="outline" size="large" icon={<Sparkles className="w-5 h-5" />}>
            了解更多
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-8">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-bold text-gray-800">选择一个生成器</h2>
          <span className="text-sm text-gray-500">更多功能开发中...</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.path} {...feature} />
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🚀</div>
            <h3 className="font-bold text-lg mb-2">快速生成</h3>
            <p className="text-gray-500 text-sm">无需等待，即时生成高质量的练习材料，随时可以打印。</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🎨</div>
            <h3 className="font-bold text-lg mb-2">个性化定制</h3>
            <p className="text-gray-500 text-sm">根据孩子的年龄和兴趣，调整难度和内容。</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🖨️</div>
            <h3 className="font-bold text-lg mb-2">打印友好</h3>
            <p className="text-gray-500 text-sm">所有内容专为 A4 纸张优化，黑白打印也清晰美观。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
