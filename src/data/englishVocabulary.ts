export interface VocabularyCategory {
  id: string;
  name: string;
  words: string[];
}

export const vocabularyDatabase: VocabularyCategory[] = [
  {
    id: 'animals',
    name: 'Animals (动物)',
    words: ['cat', 'dog', 'pig', 'fox', 'lion', 'bear', 'duck', 'bird', 'fish', 'frog', 'tiger', 'zebra', 'panda', 'rabbit', 'monkey', 'mouse', 'horse', 'sheep', 'snake', 'whale']
  },
  {
    id: 'colors',
    name: 'Colors (颜色)',
    words: ['red', 'blue', 'green', 'pink', 'gray', 'gold', 'teal', 'cyan', 'lime', 'plum', 'navy', 'ruby', 'snow', 'rose', 'jade', 'onyx', 'black', 'white', 'brown', 'purple', 'orange', 'yellow']
  },
  {
    id: 'numbers',
    name: 'Numbers (数字)',
    words: ['one', 'two', 'six', 'ten', 'three', 'four', 'five', 'nine', 'zero', 'eight', 'seven', 'twelve', 'eleven', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred']
  },
  {
    id: 'family',
    name: 'Family (家庭)',
    words: ['dad', 'mom', 'son', 'baby', 'aunt', 'wife', 'papa', 'mama', 'uncle', 'sister', 'brother', 'father', 'mother', 'grandpa', 'grandma', 'cousin', 'nephew', 'niece', 'parent', 'family']
  },
  {
    id: 'fruits',
    name: 'Fruits (水果)',
    words: ['fig', 'nut', 'pear', 'lime', 'kiwi', 'plum', 'date', 'apple', 'lemon', 'melon', 'berry', 'grape', 'mango', 'peach', 'banana', 'orange', 'cherry', 'papaya', 'tomato', 'coconut']
  },
  {
    id: 'body',
    name: 'Body (身体)',
    words: ['eye', 'ear', 'arm', 'leg', 'toe', 'lip', 'hip', 'jaw', 'rib', 'gum', 'head', 'hand', 'foot', 'face', 'nose', 'neck', 'hair', 'knee', 'skin', 'chin', 'mouth', 'tooth', 'heart', 'brain']
  },
  {
    id: 'sight_words_pre_k',
    name: 'Sight Words (Pre-K)',
    words: ['a', 'I', 'to', 'is', 'it', 'in', 'my', 'go', 'me', 'up', 'we', 'on', 'at', 'he', 'so', 'no', 'am', 'do', 'an', 'as', 'be', 'by', 'if', 'of', 'or', 'us']
  }
];

export const sentenceTemplates = [
  "I see a [word].",
  "This is a [word].",
  "I like the [word].",
  "The [word] is here.",
  "Look at the [word]."
];
