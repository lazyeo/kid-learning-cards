export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white py-8 px-4 mt-auto border-t border-gray-100 mb-16 md:mb-0">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-gray-400 text-sm">
          © {year} Kids Learning Cards. 为孩子们用 ❤️ 制作
        </p>
        <p className="text-gray-300 text-xs mt-2">
          AI 驱动的教育资源生成器
        </p>
      </div>
    </footer>
  );
}
