import { type MathGeneratorOptions, type MathProblem, type MathOperator } from '../types/generator';

// 生成唯一 ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 生成指定范围内的随机整数 [min, max]
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 获取难度对应的数字范围
const getRangeForDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): { min: number; max: number } => {
  switch (difficulty) {
    case 'easy': // 1-10
      return { min: 1, max: 10 };
    case 'medium': // 1-20
      return { min: 1, max: 20 };
    case 'hard': // 1-100
      return { min: 1, max: 100 };
  }
};

// 生成单个数学题
const generateSingleProblem = (
  type: 'addition' | 'subtraction' | 'multiplication' | 'division',
  range: { min: number; max: number }
): MathProblem => {
  let operand1: number;
  let operand2: number;
  let operator: MathOperator;
  let answer: number;

  switch (type) {
    case 'addition':
      operator = '+';
      operand1 = randomInt(range.min, range.max);
      operand2 = randomInt(range.min, range.max);
      answer = operand1 + operand2;
      break;

    case 'subtraction':
      operator = '-';
      // 确保结果非负
      const n1 = randomInt(range.min, range.max);
      const n2 = randomInt(range.min, range.max);
      operand1 = Math.max(n1, n2);
      operand2 = Math.min(n1, n2);
      answer = operand1 - operand2;
      break;

    case 'multiplication':
      operator = '×';
      // 乘法通常范围可以小一点，避免数字太大
      // 但这里先按统一范围处理，medium/hard 可能会很大，实际教学中可能需要调整
      // 为了更实用，hard 模式乘法限制在 1-12 乘法表可能更好？
      // 暂时按范围逻辑，用户可以通过 range 调整
      if (range.max > 20) {
        // 如果范围很大，乘数限制一下，避免出现 87 x 96 这种对儿童太难的题
        // 这里做一个简单的调整：如果是 hard (max 100)，乘数限制在 1-20
        const factorRange = { min: 2, max: 20 };
        operand1 = randomInt(factorRange.min, factorRange.max);
        operand2 = randomInt(factorRange.min, factorRange.max);
      } else {
        operand1 = randomInt(range.min, range.max);
        operand2 = randomInt(range.min, range.max);
      }
      answer = operand1 * operand2;
      break;

    case 'division':
      operator = '÷';
      // 确保整除：先生成商和除数，反推被除数
      const divisor = randomInt(Math.max(2, range.min), Math.min(12, range.max)); // 除数不宜过大
      const quotient = randomInt(range.min, range.max);
      operand1 = divisor * quotient;
      operand2 = divisor;
      answer = quotient;
      break;

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
  const range = getRangeForDifficulty(difficulty);

  for (let i = 0; i < count; i++) {
    let problemType = type;

    // 混合模式随机选择类型
    if (type === 'mixed') {
      const types = ['addition', 'subtraction', 'multiplication', 'division'] as const;
      // 简单难度可能不包含乘除？暂定包含
      problemType = types[Math.floor(Math.random() * types.length)];
    }

    // @ts-ignore - problemType 确定是具体的类型
    problems.push(generateSingleProblem(problemType, range));
  }

  return problems;
}
