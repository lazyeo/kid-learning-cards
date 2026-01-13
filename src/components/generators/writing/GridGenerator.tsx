import { type GridType } from '../../../types/generator';
import { ChineseGrid } from './ChineseGrid';
import { EnglishGrid } from './EnglishGrid';

interface GridGeneratorProps {
  type: GridType;
  char?: string;
  pinyin?: string;
  showTracing?: boolean;
}

export function GridGenerator({ type, char, pinyin, showTracing }: GridGeneratorProps) {
  switch (type) {
    case 'tian-zi-ge':
      return <ChineseGrid char={char} pinyin={pinyin} showTracing={showTracing} />;

    case 'si-xian-san-ge':
      return <EnglishGrid char={char} showTracing={showTracing} />;

    // 默认为田字格
    default:
      return <ChineseGrid char={char} pinyin={pinyin} showTracing={showTracing} />;
  }
}
