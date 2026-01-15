import { type MathGeneratorOptions, type MathProblem, type MathOperator } from '../types/generator';

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 生成指定范围内的随机整数 [min, max]
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 针对不同运算类型和难度的专用范围配置
// 设计原则：
// 1. 中等/困难模式的乘除法不出现 1（没有练习价值）
// 2. 加减法可以出现小数字，但中等/困难模式应有更大的数字范围
// 3. 乘法限制在合理范围内，避免心算过难
// 4. 除法确保整除，且除数和商都有意义
const getOperationConfig = (
  type: 'addition' | 'subtraction' | 'multiplication' | 'division',
  difficulty: 'easy' | 'medium' | 'hard'
) => {
  const configs = {
    addition: {
      easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
      medium: { min1: 10, max1: 50, min2: 5, max2: 30 },
      hard: { min1: 20, max1: 100, min2: 10, max2: 80 }
    },
    subtraction: {
      easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
      medium: { min1: 20, max1: 60, min2: 5, max2: 30 },
      hard: { min1: 30, max1: 100, min2: 10, max2: 50 }
    },
    multiplication: {
      // 简单：入门级乘法，可包含 1
      easy: { min1: 1, max1: 5, min2: 1, max2: 5 },
      // 中等：标准九九乘法表，不包含 1
      medium: { min1: 2, max1: 9, min2: 2, max2: 9 },
      // 困难：扩展乘法表 2-12，不包含 1
      hard: { min1: 2, max1: 12, min2: 2, max2: 12 }
    },
    division: {
      // 简单：除数 2-5，商 1-5
      easy: { divisorMin: 2, divisorMax: 5, quotientMin: 1, quotientMax: 5 },
      // 中等：除数 2-9，商 2-9（都不包含 1）
      medium: { divisorMin: 2, divisorMax: 9, quotientMin: 2, quotientMax: 9 },
      // 困难：除数 2-12，商 2-12（都不包含 1）
      hard: { divisorMin: 2, divisorMax: 12, quotientMin: 2, quotientMax: 12 }
    }
  };

  return configs[type][difficulty];
};

// 生成单个数学题
const generateSingleProblem = (
  type: 'addition' | 'subtraction' | 'multiplication' | 'division',
  difficulty: 'easy' | 'medium' | 'hard'
): MathProblem => {
  let operand1: number;
  let operand2: number;
  let operator: MathOperator;
  let answer: number;

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
      // 确保整除：先生成商和除数，反推被除数
      const divisor = randomInt(cfg.divisorMin, cfg.divisorMax);
      const quotient = randomInt(cfg.quotientMin, cfg.quotientMax);
      operand1 = divisor * quotient;
      operand2 = divisor;
      answer = quotient;
      break;
    }

    default:
      // 默认加法
      operator = '+';
      operand1 = 1;
      operand2 = 1;
      answer = 2;
  }

  return {
    id: generateId(),
    operand1,
    operand2,
    operator,
    answer
  };
};

export function generateMathProblems(options: MathGeneratorOptions): MathProblem[] {
  const { type, difficulty, count } = options;
  const problems: MathProblem[] = [];

  for (let i = 0; i < count; i++) {
    let problemType: 'addition' | 'subtraction' | 'multiplication' | 'division' = type === 'mixed' ? 'addition' : type;

    // 混合模式随机选择类型
    if (type === 'mixed') {
      const types = ['addition', 'subtraction', 'multiplication', 'division'] as const;
      problemType = types[Math.floor(Math.random() * types.length)];
    }

    problems.push(generateSingleProblem(problemType, difficulty));
  }

  return problems;
}
