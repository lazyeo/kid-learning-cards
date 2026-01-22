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

  it('should respect difficulty ranges for addition', () => {
    // Easy (整合原 easy+medium): operand1 1-50, operand2 1-30
    const easyProblems = generateMathProblems({
      type: 'addition',
      difficulty: 'easy',
      count: 20
    });
    easyProblems.forEach(p => {
      expect(p.operand1).toBeGreaterThanOrEqual(1);
      expect(p.operand1).toBeLessThanOrEqual(50);
      expect(p.operand2).toBeGreaterThanOrEqual(1);
      expect(p.operand2).toBeLessThanOrEqual(30);
    });

    // Medium (原 hard): operand1 20-100, operand2 10-80
    const mediumProblems = generateMathProblems({
      type: 'addition',
      difficulty: 'medium',
      count: 20
    });
    mediumProblems.forEach(p => {
      expect(p.operand1).toBeGreaterThanOrEqual(20);
      expect(p.operand1).toBeLessThanOrEqual(100);
      expect(p.operand2).toBeGreaterThanOrEqual(10);
      expect(p.operand2).toBeLessThanOrEqual(80);
    });

    // Hard (新高难度): 所有数字 >= 10
    const hardProblems = generateMathProblems({
      type: 'addition',
      difficulty: 'hard',
      count: 20
    });
    hardProblems.forEach(p => {
      expect(p.operand1).toBeGreaterThanOrEqual(10);
      expect(p.operand1).toBeLessThanOrEqual(999);
      expect(p.operand2).toBeGreaterThanOrEqual(10);
      expect(p.operand2).toBeLessThanOrEqual(999);
    });
  });

  it('should NOT include 1 in medium/hard multiplication problems', () => {
    // Medium multiplication (原 hard): 2-20 × 2-12
    const mediumProblems = generateMathProblems({
      type: 'multiplication',
      difficulty: 'medium',
      count: 50,
      format: 'horizontal'
    });
    mediumProblems.forEach(p => {
      expect(p.operand1).toBeGreaterThanOrEqual(2);
      expect(p.operand2).toBeGreaterThanOrEqual(2);
      expect(p.operand1).toBeLessThanOrEqual(20);
      expect(p.operand2).toBeLessThanOrEqual(12);
    });

    // Hard multiplication (新高难度): 10-99 × 10-50，所有数字 >= 10
    const hardProblems = generateMathProblems({
      type: 'multiplication',
      difficulty: 'hard',
      count: 50,
      format: 'horizontal'
    });
    hardProblems.forEach(p => {
      expect(p.operand1).toBeGreaterThanOrEqual(10);
      expect(p.operand2).toBeGreaterThanOrEqual(10);
      expect(p.operand1).toBeLessThanOrEqual(99);
      expect(p.operand2).toBeLessThanOrEqual(50);
    });
  });

  it('should NOT include 1 as divisor or quotient in medium/hard division problems', () => {
    // Medium division (原 hard): divisor 2-12, quotient 2-12
    const mediumProblems = generateMathProblems({
      type: 'division',
      difficulty: 'medium',
      count: 50
    });
    mediumProblems.forEach(p => {
      expect(p.operand2).toBeGreaterThanOrEqual(2); // divisor >= 2
      expect(p.operand2).toBeLessThanOrEqual(12);
      expect(p.answer).toBeGreaterThanOrEqual(2); // quotient >= 2
      expect(p.answer).toBeLessThanOrEqual(12);
    });

    // Hard division (新高难度): divisor 10-50, quotient 10-50，所有数字 >= 10
    const hardProblems = generateMathProblems({
      type: 'division',
      difficulty: 'hard',
      count: 50
    });
    hardProblems.forEach(p => {
      expect(p.operand2).toBeGreaterThanOrEqual(10); // divisor >= 10
      expect(p.operand2).toBeLessThanOrEqual(50);
      expect(p.answer).toBeGreaterThanOrEqual(10); // quotient >= 10
      expect(p.answer).toBeLessThanOrEqual(50);
    });
  });

  it('should allow 1 in easy multiplication (beginner level)', () => {
    // Easy multiplication (整合原 easy+medium): 1-12 × 1-12
    const easyProblems = generateMathProblems({
      type: 'multiplication',
      difficulty: 'easy',
      count: 100,
      format: 'horizontal'
    });
    easyProblems.forEach(p => {
      expect(p.operand1).toBeGreaterThanOrEqual(1);
      expect(p.operand1).toBeLessThanOrEqual(12);
      expect(p.operand2).toBeGreaterThanOrEqual(1);
      expect(p.operand2).toBeLessThanOrEqual(12);
    });
  });

  it('should generate division problems with remainder when allowRemainder is true', () => {
    const problems = generateMathProblems({
      type: 'division',
      difficulty: 'medium',
      count: 50,
      format: 'horizontal',
      allowRemainder: true
    });

    problems.forEach(p => {
      expect(p.operator).toBe('÷');
      expect(p.remainder).toBeDefined();
      expect(p.remainder).toBeGreaterThan(0); // 余数应大于 0
      expect(p.remainder).toBeLessThan(p.operand2); // 余数应小于除数
      // 验证计算正确：被除数 = 商 × 除数 + 余数
      expect(p.operand1).toBe(p.answer * p.operand2 + p.remainder!);
    });
  });

  it('should NOT have remainder when allowRemainder is false', () => {
    const problems = generateMathProblems({
      type: 'division',
      difficulty: 'medium',
      count: 50,
      format: 'horizontal',
      allowRemainder: false
    });

    problems.forEach(p => {
      expect(p.operator).toBe('÷');
      expect(p.remainder).toBeUndefined();
      // 验证整除
      expect(p.operand1 % p.operand2).toBe(0);
    });
  });

  it('should only apply remainder to division in mixed mode', () => {
    const problems = generateMathProblems({
      type: 'mixed',
      difficulty: 'medium',
      count: 100,
      format: 'horizontal',
      allowRemainder: true
    });

    problems.forEach(p => {
      if (p.operator === '÷') {
        // 除法题应该有余数
        expect(p.remainder).toBeDefined();
        expect(p.remainder).toBeGreaterThan(0);
      } else {
        // 非除法题不应有余数
        expect(p.remainder).toBeUndefined();
      }
    });
  });
});
