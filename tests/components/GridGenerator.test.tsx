import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GridGenerator } from '../../src/components/generators/writing/GridGenerator';

describe('GridGenerator', () => {
  it('should render Chinese grid (tian-zi-ge) by default', () => {
    render(<GridGenerator type="tian-zi-ge" />);
    // 田字格有两个主要的虚线分割线（十字）
    // 通过 class 检查有点脆弱，我们检查是否渲染了容器
    // 根据 ChineseGrid.tsx 的实现，它包含一个 border-2 border-red-500 的 div
    const grid = document.querySelector('.border-red-500');
    expect(grid).toBeInTheDocument();
  });

  it('should render character in Chinese grid', () => {
    render(<GridGenerator type="tian-zi-ge" char="好" />);
    expect(screen.getByText('好')).toBeInTheDocument();
  });

  it('should render pinyin when provided for Chinese grid', () => {
    render(<GridGenerator type="tian-zi-ge" char="好" pinyin="hao" />);
    expect(screen.getByText('hao')).toBeInTheDocument();
  });

  it('should render English grid (si-xian-san-ge)', () => {
    render(<GridGenerator type="si-xian-san-ge" char="A" />);
    // 检查是否有字母
    expect(screen.getByText('A')).toBeInTheDocument();
    // 检查是否有四线格特有的样式，比如基线
    const grids = document.querySelectorAll('.border-red-500');
    // EnglishGrid 应该有上下两条红实线（border-b）
    expect(grids.length).toBeGreaterThan(0);
  });

  it('should handle missing tracing option correctly', () => {
    render(<GridGenerator type="tian-zi-ge" char="好" showTracing={false} />);
    const charElement = screen.getByText('好');
    // 不显示描红时，应该是黑色的 (text-black)
    expect(charElement).toHaveClass('text-black');
  });

  it('should handle tracing option correctly', () => {
    render(<GridGenerator type="tian-zi-ge" char="好" showTracing={true} />);
    const charElement = screen.getByText('好');
    // 显示描红时，应该是灰色的
    expect(charElement).toHaveClass('text-gray-300');
  });
});
