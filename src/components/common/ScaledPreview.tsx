import { useRef, useEffect, useState, type ReactNode } from 'react';

interface ScaledPreviewProps {
  children: ReactNode;
  /** 预览内容的固定宽度（桌面端/打印宽度），默认 800px */
  contentWidth?: number;
  /** 预览区域的 ID，用于打印和下载 */
  id?: string;
  /** 额外的 className */
  className?: string;
  /**
   * 缩放适配模式：
   * - 'width': 仅基于容器宽度缩放
   * - 'contain': 同时考虑容器宽度与可视高度，保证完整可见
   */
  fit?: 'width' | 'contain';
  /** 计算可视高度时预留的顶部间距（像素） */
  viewportTopPadding?: number;
  /** 计算可视高度时预留的底部间距（像素） */
  viewportBottomPadding?: number;
}

/**
 * 可缩放预览容器
 *
 * 内容始终以固定宽度（800px）渲染，用于打印/PDF。
 * 通过 transform: scale() 缩放显示，适配容器宽度。
 * 使用绝对定位避免内容撑大容器。
 */
export function ScaledPreview({
  children,
  contentWidth = 800,
  id,
  className = '',
  fit = 'width',
  viewportTopPadding = 0,
  viewportBottomPadding = 16,
}: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5); // 初始缩放设为 0.5，避免初始溢出
  const [contentHeight, setContentHeight] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !contentRef.current) return;

      // 获取容器可用宽度
      const containerWidth = containerRef.current.offsetWidth;

      // 如果容器宽度为 0，等待下一帧
      if (containerWidth === 0) {
        requestAnimationFrame(updateScale);
        return;
      }

      // 基于宽度计算缩放比例
      const widthScale = containerWidth / contentWidth;

      // 获取内容的实际高度（未缩放时的高度）
      const rawContentHeight = contentRef.current.scrollHeight;

      // 计算基于可视高度的缩放（仅在 contain 模式下启用）
      let heightScale = Number.POSITIVE_INFINITY;
      if (fit === 'contain' && typeof window !== 'undefined') {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const availableHeight = Math.max(0, viewportHeight - viewportTopPadding - viewportBottomPadding);
        heightScale = availableHeight > 0 && rawContentHeight > 0
          ? availableHeight / rawContentHeight
          : Number.POSITIVE_INFINITY;
      }

      // 计算缩放比例，最大为 1（不放大）
      const newScale = Math.min(1, widthScale, heightScale);
      setScale(newScale);
      setContentHeight(rawContentHeight);
      setIsReady(true);
    };

    // 初始化时延迟一帧以确保DOM已渲染
    requestAnimationFrame(updateScale);

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateScale);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 监听窗口尺寸变化
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [contentWidth, children, fit, viewportTopPadding, viewportBottomPadding]);

  // 计算缩放后的容器尺寸
  const scaledHeight = contentHeight * scale;

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-full ${className}`}
      style={{
        // 容器高度设置为缩放后的高度，使用 position relative 包含绝对定位的内容
        height: scaledHeight > 0 ? `${scaledHeight}px` : 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 内容容器：固定宽度，通过 transform 缩放，使用绝对定位避免撑大容器 */}
      <div
        ref={contentRef}
        id={id}
        className="print:!transform-none print:!w-[800px] print:!static"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${contentWidth}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          opacity: isReady ? 1 : 0, // 初始隐藏，避免闪烁
          transition: 'opacity 0.1s',
        }}
      >
        {children}
      </div>
    </div>
  );
}
