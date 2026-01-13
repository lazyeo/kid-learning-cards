import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MathWorksheet } from '../../src/components/generators/math/MathWorksheet';
import { MathProblem } from '../../src/types/generator';

const mockProblems: MathProblem[] = [
  { id: '1', operand1: 5, operand2: 3, operator: '+', answer: 8 },
  { id: '2', operand1: 10, operand2: 4, operator: '-', answer: 6 },
];

describe('MathWorksheet', () => {
  it('should render problems correctly', () => {
    render(<MathWorksheet problems={mockProblems} />);

    expect(screen.getByText('数学练习')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getAllByText('=')).toHaveLength(mockProblems.length);
  });

  it('should render answers when includeAnswers is true', () => {
    render(<MathWorksheet problems={mockProblems} includeAnswers={true} />);

    expect(screen.getByText('参考答案')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument(); // 第一题答案
    expect(screen.getByText('6')).toBeInTheDocument(); // 第二题答案
  });

  it('should not render answers when includeAnswers is false', () => {
    render(<MathWorksheet problems={mockProblems} includeAnswers={false} />);

    expect(screen.queryByText('参考答案')).not.toBeInTheDocument();
  });

  it('should show empty state message when no problems provided', () => {
    render(<MathWorksheet problems={[]} />);

    expect(screen.getByText(/点击左侧"开始生成"按钮/i)).toBeInTheDocument();
  });
});
