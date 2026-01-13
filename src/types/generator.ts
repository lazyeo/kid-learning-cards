// 生成器相关类型定义

// 通用生成器状态
export interface GeneratorState<T> {
  isLoading: boolean;
  result: T | null;
  error: Error | null;
}

// 数学题类型
export type MathOperator = '+' | '-' | '×' | '÷';

export interface MathProblem {
  id: string;
  operand1: number;
  operand2: number;
  operator: MathOperator;
  answer: number;
}

export interface MathGeneratorOptions {
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  format: 'horizontal' | 'vertical'; // 新增：题目格式
  includeAnswers?: boolean;
}

// 书写练习类型
export type GridType = 'tian-zi-ge' | 'si-xian-san-ge' | 'mi-zi-ge' | 'blank';

export interface WritingContent {
  id: string;
  text: string;
  pinyin?: string;
  translation?: string;
}

export interface WritingGeneratorOptions {
  gridType: GridType;
  content: string;
  showPinyin?: boolean;
  showTracing?: boolean;
  repeatCount?: number;
}

// 涂色卡片类型 (预留)
export interface ColoringCard {
  id: string;
  imageUrl: string;
  theme: string;
  createdAt: Date;
}

export interface ColoringGeneratorOptions {
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
  customPrompt?: string;
}

// 英文练习类型
export interface EnglishGeneratorOptions {
  type: 'words' | 'sentences';
  category: string; // 词库分类ID
  count: number;
  showTracing: boolean;
  showLines: boolean; // 是否显示四线三格
}
