import { type ColoringCardParams } from '../types';

/**
 * 主题相关的场景和装饰元素
 * 用于丰富画面内容，避免单调
 */
const THEME_ENHANCEMENTS: Record<string, {
  scenes: string[];
  decorations: string[];
  actions: string[];
}> = {
  animals: {
    scenes: ['in a magical forest', 'in a sunny meadow', 'in a cozy garden', 'under a rainbow'],
    decorations: ['flowers', 'butterflies', 'clouds', 'stars', 'hearts', 'leaves'],
    actions: ['playing happily', 'smiling', 'waving', 'jumping with joy']
  },
  vehicles: {
    scenes: ['on a winding road', 'in a busy city', 'on a sunny day', 'with mountains in background'],
    decorations: ['clouds', 'sun', 'trees', 'road signs', 'traffic lights'],
    actions: ['driving fast', 'honking horn', 'racing']
  },
  nature: {
    scenes: ['in a beautiful garden', 'by a sparkling river', 'in a peaceful forest', 'on a sunny hill'],
    decorations: ['butterflies', 'birds', 'clouds', 'sun rays', 'dewdrops'],
    actions: ['blooming', 'swaying in the breeze', 'growing tall']
  },
  fantasy: {
    scenes: ['in a magical kingdom', 'on a fluffy cloud', 'in an enchanted forest', 'in a fairy tale castle'],
    decorations: ['stars', 'moons', 'sparkles', 'magic wands', 'crowns', 'rainbows'],
    actions: ['casting magic spells', 'flying', 'dancing']
  },
  food: {
    scenes: ['on a decorated plate', 'at a birthday party', 'in a cozy kitchen', 'on a picnic blanket'],
    decorations: ['hearts', 'stars', 'confetti', 'ribbons', 'sprinkles'],
    actions: ['looking delicious', 'freshly made']
  },
  sports: {
    scenes: ['on a playground', 'at a stadium', 'in a park', 'on a sunny field'],
    decorations: ['trophies', 'medals', 'stars', 'confetti', 'banners'],
    actions: ['winning', 'celebrating', 'playing']
  },
  seasons: {
    scenes: ['in a winter wonderland', 'on a spring day', 'during summer vacation', 'in autumn leaves'],
    decorations: ['snowflakes', 'flowers', 'sun', 'falling leaves', 'clouds'],
    actions: ['enjoying the weather', 'playing outside']
  }
};

/**
 * 获取随机元素
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 构建用于生成涂色卡片的 Prompt
 * 针对 ModelScope 等模型优化，添加更丰富的场景和细节描述
 */
export function buildColoringPrompt(params: ColoringCardParams): string {
  const { theme, subject, difficulty, customPrompt } = params;

  // 获取主题增强元素
  const themeKey = theme?.toLowerCase() || 'animals';
  const enhancements = THEME_ENHANCEMENTS[themeKey] || THEME_ENHANCEMENTS.animals;

  // 随机选择场景、装饰和动作
  const scene = getRandomElement(enhancements.scenes);
  const decoration1 = getRandomElement(enhancements.decorations);
  const decoration2 = getRandomElement(enhancements.decorations.filter(d => d !== decoration1));
  const action = getRandomElement(enhancements.actions);

  // 艺术风格：强调儿童友好的卡通风格
  const artStyle = "cute cartoon style, kawaii, children's book illustration, adorable character design";

  // 技术风格：黑白线稿要求
  const technicalStyle = "black and white coloring page, thick bold outlines, clean lines, pure white background, high contrast, vector line art, no shading, no greyscale, no gradients, no fill colors";

  // 构图指导
  const composition = "centered composition, full body visible, well-framed, professional coloring book quality";

  // 难度控制 - 增加更具体的描述
  let complexityDesc = "";
  let decorationCount = "";
  switch (difficulty) {
    case 'easy':
      complexityDesc = "very simple shapes, minimal details, extra thick outlines, large empty areas to color, rounded corners, no small parts";
      decorationCount = `with a few simple ${decoration1}`;
      break;
    case 'medium':
      complexityDesc = "moderate details, balanced composition, medium-sized areas to color, some decorative elements";
      decorationCount = `surrounded by ${decoration1} and ${decoration2}`;
      break;
    case 'hard':
      complexityDesc = "intricate details, complex patterns, fine lines, many small areas to color, elaborate decorations";
      decorationCount = `richly decorated with ${decoration1}, ${decoration2} and ornate patterns`;
      break;
  }

  // 主体描述 - 更加生动
  const subjectDesc = `an adorable cute ${subject} ${action} ${scene}`;

  // 组合最终 Prompt
  // 结构：[主体+场景+动作] + [装饰] + [艺术风格] + [技术风格] + [构图] + [难度]
  let finalPrompt = `${subjectDesc}, ${decorationCount}, ${artStyle}, ${technicalStyle}, ${composition}, ${complexityDesc}`;

  // 添加自定义提示词
  if (customPrompt && customPrompt.trim()) {
    finalPrompt += `, ${customPrompt.trim()}`;
  }

  return finalPrompt;
}
