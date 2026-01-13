export interface ChineseCategory {
  id: string;
  name: string;
  difficulty: 'alphabet' | 'beginner' | 'elementary' | 'intermediate';
  chars: string;
}

export const chineseDatabase: ChineseCategory[] = [
  // 笔画入门 - 基础笔画和最简单的汉字
  {
    id: 'strokes',
    name: '基础笔画',
    difficulty: 'alphabet',
    chars: '一二三十人大小上下口'
  },
  {
    id: 'numbers',
    name: '数字汉字',
    difficulty: 'alphabet',
    chars: '一二三四五六七八九十百千万'
  },

  // 启蒙级 - 幼儿园/学前班常用字
  {
    id: 'nature',
    name: '自然万物',
    difficulty: 'beginner',
    chars: '日月水火山石田土风云雨雪天地'
  },
  {
    id: 'family',
    name: '家庭称呼',
    difficulty: 'beginner',
    chars: '爸妈爷奶哥姐弟妹我你他她'
  },
  {
    id: 'body',
    name: '身体部位',
    difficulty: 'beginner',
    chars: '头手足耳目口鼻心身牙发'
  },
  {
    id: 'animals_basic',
    name: '常见动物',
    difficulty: 'beginner',
    chars: '牛羊马猪狗猫鸡鸭鱼鸟虫'
  },

  // 小学低年级
  {
    id: 'colors',
    name: '颜色词汇',
    difficulty: 'elementary',
    chars: '红黄蓝绿白黑紫橙青灰粉金银'
  },
  {
    id: 'actions',
    name: '动作词汇',
    difficulty: 'elementary',
    chars: '走跑跳飞吃喝看听说写读玩'
  },
  {
    id: 'school',
    name: '学校相关',
    difficulty: 'elementary',
    chars: '学校书本笔字纸班老师生课'
  },
  {
    id: 'time',
    name: '时间词汇',
    difficulty: 'elementary',
    chars: '年月日时分秒早午晚今明昨春夏秋冬'
  },

  // 小学中高年级
  {
    id: 'emotions',
    name: '情感词汇',
    difficulty: 'intermediate',
    chars: '喜怒哀乐爱恨忧愁惊恐悲欢离合'
  },
  {
    id: 'poetry',
    name: '古诗词汇',
    difficulty: 'intermediate',
    chars: '春晓花鸟啼眠晴雪梅江南塞外'
  },
  {
    id: 'idioms',
    name: '成语常字',
    difficulty: 'intermediate',
    chars: '龙凤虎豹鹤鹏雄伟壮丽宏博精深'
  }
];

// 难度级别配置
export const difficultyLevels = [
  { id: 'alphabet', name: '笔画入门', description: '最简单的汉字和笔画' },
  { id: 'beginner', name: '启蒙级', description: '幼儿园/学前班常用字' },
  { id: 'elementary', name: '小学低年级', description: '一二年级常用字' },
  { id: 'intermediate', name: '小学中高年级', description: '三至六年级常用字' },
  { id: 'custom', name: '自定义', description: '手动输入练习内容' }
];

// 根据难度获取分类
export function getCategoriesByDifficulty(difficulty: string): ChineseCategory[] {
  if (difficulty === 'custom') return [];
  return chineseDatabase.filter(cat => cat.difficulty === difficulty);
}

// 获取默认内容
export function getDefaultChineseContent(difficulty: string, categoryId?: string): string {
  if (difficulty === 'custom') return '';

  if (categoryId) {
    const category = chineseDatabase.find(c => c.id === categoryId);
    if (category) return category.chars;
  }

  // 返回该难度下第一个分类的内容
  const categories = getCategoriesByDifficulty(difficulty);
  return categories.length > 0 ? categories[0].chars : '天地玄黄';
}
