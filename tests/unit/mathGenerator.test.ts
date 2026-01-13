import { describe, it, expect } from 'vitest';
import { generateMathProblems } from '../../src/utils/mathGenerator';
import { MathGeneratorOptions } from '../../src/types/generator';

describe('mathGenerator', () => {
  it('should generate correct number of problems', () => {
    const options: MathGeneratorOptions = {
      type: 'addition',
      difficulty: 'easy',
      count: 10
    };
    const problems = generateMathProblems(options);
    expect(problems.length).toBe(10);
  });

  it('should generate addition problems correctly', () => {
    const options: MathGeneratorOptions = {
      type: 'addition',
      difficulty: 'easy',
      count: 5
    };
    const problems = generateMathProblems(options);

    problems.forEach(problem => {
      expect(problem.operator).toBe('+');
      expect(problem.answer).toBe(problem.operand1 + problem.operand2);
    });
  });

  it('should generate subtraction problems correctly with non-negative answers', () => {
    const options: MathGeneratorOptions = {
      type: 'subtraction',
      difficulty: 'medium',
      count: 5
    };
    const problems = generateMathProblems(options);

    problems.forEach(problem => {
      expect(problem.operator).toBe('-');
      expect(problem.answer).toBe(problem.operand1 - problem.operand2);
      expect(problem.answer).toBeGreaterThanOrEqual(0);
    });
  });

  it('should generate multiplication problems correctly', () => {
    const options: MathGeneratorOptions = {
      type: 'multiplication',
      difficulty: 'medium',
      count: 5
    };
    const problems = generateMathProblems(options);

    problems.forEach(problem => {
      expect(problem.operator).toBe('×');
      expect(problem.answer).toBe(problem.operand1 * problem.operand2);
    });
  });

  it('should generate division problems correctly with integer answers', () => {
    const options: MathGeneratorOptions = {
      type: 'division',
      difficulty: 'medium',
      count: 5
    };
    const problems = generateMathProblems(options);

    problems.forEach(problem => {
      expect(problem.operator).toBe('÷');
      expect(problem.answer).toBe(problem.operand1 / problem.operand2);
      expect(Number.isInteger(problem.answer)).toBe(true);
      expect(problem.operand1 % problem.operand2).toBe(0);
    });
  });

  it('should respect difficulty ranges', () => {
    // Easy: 1-10
    const easyProblems = generateMathProblems({
      type: 'addition',
      difficulty: 'easy',
      count: 20
    });
    easyProblems.forEach(p => {
      expect(p.operand1).toBeGreaterThanOrEqual(1);
      expect(p.operand1).toBeLessThanOrEqual(10);
      expect(p.operand2).toBeGreaterThanOrEqual(1);
      expect(p.operand2).toBeLessThanOrEqual(10);
    });

    // Medium: 1-20
    const mediumProblems = generateMathProblems({
      type: 'addition',
      difficulty: 'medium',
      count: 20
    });
    // Check if at least one number is > 10 to ensure range is used (statistically likely)
    const hasMediumNumbers = mediumProblems.some(p => p.operand1 > 10 || p.operand2 > 10);
    expect(hasMediumNumbers).toBe(true);
  });
});
