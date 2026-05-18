export const IDEA_WORD_RULES = {
  title: { min: 2, max: 10 },
  // Allow proposals to be between 10 and 200 words (was 20 min previously)
  problem: { min: 10, max: 200 },
  solution: { min: 10, max: 200 },
} as const;

export const countWords = (text: string): number =>
  text.trim().split(' ').filter(Boolean).length;

export const getWordRangeError = (
  label: string,
  value: string,
  minWords: number,
  maxWords: number,
): string | undefined => {
  const words = countWords(value);
  if (words < minWords || words > maxWords) {
    return `${label} debe tener entre ${minWords} y ${maxWords} palabras. Actualmente tiene ${words}.`;
  }
  return undefined;
};

export const isWordCountInRange = (
  value: string,
  minWords: number,
  maxWords: number,
): boolean => {
  const words = countWords(value);
  return words >= minWords && words <= maxWords;
};
