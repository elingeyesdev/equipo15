export const IDEA_WORD_RULES = {
  title: { min: 2, max: 10 },
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

const GIBBERISH_VOWELS = new Set('aeiouáéíóúüAEIOUÁÉÍÓÚÜ');
export function isGibberish(text: string): boolean {
  if (text.trim().length === 0) return false;

  // Catch 5 or more identical characters in a row
  if (/(.)\1{4,}/.test(text)) return true;



  const words = text.match(/[a-záéíóúüA-ZÁÉÍÓÚÄä]{3,}/gi) || [];
  if (words.length === 0 && text.trim().length > 0) return true;
  if (words.length === 0) return false;

  let gibberishWordCount = 0;
  
  for (const w of words) {
    const chars = [...w.toLowerCase()];
    const uniqueChars = new Set(chars).size;
    const vowels = chars.filter(ch => GIBBERISH_VOWELS.has(ch)).length;
    const vowelRatio = vowels / w.length;
    
    // Very low or very high vowel ratio
    if (vowelRatio < 0.20 || vowelRatio > 0.80) {
      gibberishWordCount++;
      continue;
    }
    
    // Low unique character ratio for words >= 5 chars
    if (w.length >= 5 && uniqueChars / w.length <= 0.4) {
      gibberishWordCount++;
      continue;
    }
  }

  return gibberishWordCount / words.length > 0.25;
}
