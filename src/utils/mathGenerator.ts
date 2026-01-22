import { type MathGeneratorOptions, type MathProblem, type MathOperator } from '../types/generator';

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 生成指定范围内的随机整数 [min, max]
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 针对不同运算类型和难度的专用范围配置
// 设计原则：
// 1. Easy: 整合了原 easy + medium，覆盖基础到中等难度
// 2. Medium: 原 hard 级别
// 3. Hard: 全新高难度，所有数字必须是两位数以上 (≥10)
// 4. 乘除法中等以上不出现 1（没有练习价值）
// 5. 除法确保整除，且除数和商都有意义
const getOperationConfig = (
  type: 'addition' | 'subtraction' | 'multiplication' | 'division',
  difficulty: 'easy' | 'medium' | 'hard'
) => {
  const configs = {
    addition: {
      // Easy: 整合原 easy(1-10) + medium(10-50)，扩大范围
      easy: { min1: 1, max1: 50, min2: 1, max2: 30 },
      // Medium: 原 hard 级别
      medium: { min1: 20, max1: 100, min2: 10, max2: 80 },
      // Hard: 全新高难度，所有数字 ≥ 10
      hard: { min1: 10, max1: 999, min2: 10, max2: 999 }
    },
    subtraction: {
      // Easy: 整合原 easy + medium
      easy: { min1: 1, max1: 60, min2: 1, max2: 30 },
      // Medium: 原 hard 级别
      medium: { min1: 30, max1: 100, min2: 10, max2: 50 },
      // Hard: 全新高难度，所有数字 ≥ 10
      hard: { min1: 100, max1: 999, min2: 10, max2: 500 }
    },
    multiplication: {
      // Easy: 整合原 easy(1-5) + medium(2-12)，适合入门到熟练
      easy: { min1: 1, max1: 12, min2: 1, max2: 12 },
      // Medium: 原 hard 级别 (2-20 × 2-12)
      medium: { min1: 2, max1: 20, min2: 2, max2: 12 },
      // Hard: 全新高难度，两位数乘法 (10-99 × 10-50)
      hard: { min1: 10, max1: 99, min2: 10, max2: 50 }
    },
    division: {
      // Easy: 整合原 easy + medium，除数 2-9，商 1-9
      easy: { divisorMin: 2, divisorMax: 9, quotientMin: 1, quotientMax: 9 },
      // Medium: 原 hard 级别，除数 2-12，商 2-12
      medium: { divisorMin: 2, divisorMax: 12, quotientMin: 2, quotientMax: 12 },
      // Hard: 全新高难度，除数和商都是两位数 (10-50)
      hard: { divisorMin: 10, divisorMax: 50, quotientMin: 10, quotientMax: 50 }
    }
  };

  return configs[type][difficulty];
};

// 生成单个数学题
const generateSingleProblem = (
  type: 'addition' | 'subtraction' | 'multiplication' | 'division',
  difficulty: 'easy' | 'medium' | 'hard',
  allowRemainder: boolean = false
): MathProblem => {
  let operand1: number;
  let operand2: number;
  let operator: MathOperator;
  let answer: number;
  let remainder: number | undefined;

  const config = getOperationConfig(type, difficulty);

  switch (type) {
    case 'addition': {
      operator = '+';
      const cfg = config as { min1: number; max1: number; min2: number; max2: number };
      operand1 = randomInt(cfg.min1, cfg.max1);
      operand2 = randomInt(cfg.min2, cfg.max2);
      answer = operand1 + operand2;
      break;
    }

    case 'subtraction': {
      operator = '-';
      const cfg = config as { min1: number; max1: number; min2: number; max2: number };
      // 先生成两个数，确保结果非负且有意义
      const n1 = randomInt(cfg.min1, cfg.max1);
      const n2 = randomInt(cfg.min2, Math.min(cfg.max2, n1)); // 确保减数不大于被减数
      operand1 = n1;
      operand2 = n2;
      answer = operand1 - operand2;
      break;
    }

    case 'multiplication': {
      operator = '×';
      const cfg = config as { min1: number; max1: number; min2: number; max2: number };
      operand1 = randomInt(cfg.min1, cfg.max1);
      operand2 = randomInt(cfg.min2, cfg.max2);
      answer = operand1 * operand2;
      break;
    }

    case 'division': {
      operator = '÷';
      const cfg = config as { divisorMin: number; divisorMax: number; quotientMin: number; quotientMax: number };

      if (allowRemainder) {
        // 带余数除法：直接生成被除数和除数，计算商和余数
        const divisor = randomInt(cfg.divisorMin, cfg.divisorMax);
        // 被除数范围：确保商在合理范围内，同时有余数
        const minDividend = divisor * cfg.quotientMin + 1; // +1 确保有余数
        const maxDividend = divisor * (cfg.quotientMax + 1) - 1; // 最大不超过下一个整除点
        operand1 = randomInt(minDividend, maxDividend);
        operand2 = divisor;
        answer = Math.floor(operand1 / operand2);
        remainder = operand1 % operand2;
        // 如果碰巧整除，重新调整被除数使其有余数
        if (remainder === 0) {
          operand1 += randomInt(1, operand2 - 1);
          answer = Math.floor(operand1 / operand2);
          remainder = operand1 % operand2;
        }
      } else {
        // 整除模式：先生成商和除数，反推被除数
        const divisor = randomInt(cfg.divisorMin, cfg.divisorMax);
        const quotient = randomInt(cfg.quotientMin, cfg.quotientMax);
        operand1 = divisor * quotient;
        operand2 = divisor;
        answer = quotient;
      }
      break;
    }

    default:
      // 默认加法
      operator = '+';
      operand1 = 1;
      operand2 = 1;
      answer = 2;
  }

  const problem: MathProblem = {
    id: generateId(),
    operand1,
    operand2,
    operator,
    answer
  };

  if (remainder !== undefined) {
    problem.remainder = remainder;
  }

  return problem;
};

// 生成问题的唯一键，用于去重
const getProblemKey = (problem: MathProblem): string => {
  const base = `${problem.operand1}${problem.operator}${problem.operand2}`;
  return problem.remainder !== undefined ? `${base}r${problem.remainder}` : base;
};

export function generateMathProblems(options: MathGeneratorOptions): MathProblem[] {
  const { type, difficulty, count, allowRemainder = false } = options;
  const problems: MathProblem[] = [];
  const usedKeys = new Set<string>();

  // 防止无限循环的最大尝试次数
  const maxAttempts = count * 10;
  let attempts = 0;

  while (problems.length < count && attempts < maxAttempts) {
    attempts++;

    let problemType: 'addition' | 'subtraction' | 'multiplication' | 'division' = type === 'mixed' ? 'addition' : type;

    // 混合模式随机选择类型
    if (type === 'mixed') {
      const types = ['addition', 'subtraction', 'multiplication', 'division'] as const;
      problemType = types[Math.floor(Math.random() * types.length)];
    }

    // 余数选项仅对除法生效
    const useRemainder = allowRemainder && problemType === 'division';
    const problem = generateSingleProblem(problemType, difficulty, useRemainder);

    // 去重检查
    const key = getProblemKey(problem);
    if (!usedKeys.has(key)) {
      usedKeys.add(key);
      problems.push(problem);
    }
  }

  return problems;
}
