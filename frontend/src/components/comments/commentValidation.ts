export const COMMENT_CONTENT_RULES = {
  minLength: 2,
  maxLength: 2000,
  maxWords: 350,
  minLetters: 2,
  maxConsecutiveLineBreaks: 2,
  maxRepeatedCharacterStreak: 5,
  maxRepeatedWordRun: 3,
  maxUppercaseRatio: 0.8,
} as const;

const URL_PATTERN = /(https?:\/\/|www\.|discord\.gg|t\.me)/i;
const SUSPICIOUS_HTML_PATTERN = /<\s*\/?\s*[a-z][^>]*>|onerror\s*=|onclick\s*=|javascript:/i;
const KEYBOARD_SPAM_PATTERN = /\b(qwerty|asdf|zxcv|qazwsx)\b/i;
const REPEATED_WORD_PATTERN = /\b([\p{L}\p{N}]{1,})\b(?:\s+\1\b){2,}/iu;
const REPEATED_SEQUENCE_PATTERN = /(.{2,6})\1{2,}/u;
const REPEATED_CHAR_PATTERN = /([\p{L}\p{N}])\1{4,}/iu;
const INVISIBLE_CHARS_PATTERN = /[\u200B-\u200D\uFEFF]/g;

export const normalizeCommentInput = (value: string): string =>
  value
    .replace(/\r\n/g, '\n')
    .replace(INVISIBLE_CHARS_PATTERN, '')
    .split('\n')
    .map((line) => line.replace(/[\t\f\v ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const countWords = (value: string): number =>
  value.trim().split(/\s+/).filter(Boolean).length;

const countLetters = (value: string): number => (value.match(/\p{L}/gu) || []).length;

const countUppercaseLetters = (value: string): number =>
  (value.match(/\p{Lu}/gu) || []).length;

const isOnlyNumbers = (value: string): boolean => {
  const compact = value.replace(/\s+/g, '');
  return /^[0-9]+$/.test(compact);
};

const isAcronymLike = (value: string): boolean => {
  const words = value.split(/\s+/).filter(Boolean);
  return words.length <= 3 && words.every((word) => word.length <= 4);
};

export const getCommentValidationError = (
  rawValue: string,
): string | null => {
  const value = normalizeCommentInput(rawValue);

  if (!value) {
    return 'El comentario no puede estar vacío.';
  }

  if (new RegExp(`\\n{${COMMENT_CONTENT_RULES.maxConsecutiveLineBreaks + 1},}`).test(rawValue.replace(/\r\n/g, '\n'))) {
    return 'El comentario tiene demasiados saltos de línea consecutivos.';
  }

  if (URL_PATTERN.test(value)) {
    return 'No se permiten enlaces.';
  }

  if (SUSPICIOUS_HTML_PATTERN.test(value)) {
    return 'El comentario contiene código o HTML no permitido.';
  }

  if (value.length < COMMENT_CONTENT_RULES.minLength) {
    return 'El comentario es demasiado corto.';
  }

  if (value.length > COMMENT_CONTENT_RULES.maxLength) {
    return `El comentario no puede superar ${COMMENT_CONTENT_RULES.maxLength} caracteres.`;
  }

  if (countLetters(value) < COMMENT_CONTENT_RULES.minLetters) {
    return 'El comentario debe incluir texto real, no solo símbolos o emojis.';
  }

  if (isOnlyNumbers(value)) {
    return 'El comentario no puede contener solo números.';
  }

  if (countWords(value) > COMMENT_CONTENT_RULES.maxWords) {
    return `El comentario no puede superar ${COMMENT_CONTENT_RULES.maxWords} palabras.`;
  }

  if (REPEATED_CHAR_PATTERN.test(value)) {
    return 'El comentario contiene spam o letras repetidas de forma excesiva.';
  }

  if (REPEATED_WORD_PATTERN.test(value) || KEYBOARD_SPAM_PATTERN.test(value) || REPEATED_SEQUENCE_PATTERN.test(value)) {
    return 'El comentario contiene spam.';
  }

  const words = value.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  if (words.length >= 4 && uniqueWords.size / words.length <= 0.5) {
    return 'El comentario contiene demasiado texto repetido.';
  }

  const letters = countLetters(value);
  const uppercaseRatio = letters > 0 ? countUppercaseLetters(value) / letters : 0;
  if (letters >= 8 && uppercaseRatio >= COMMENT_CONTENT_RULES.maxUppercaseRatio && !isAcronymLike(value)) {
    return 'Evita escribir el comentario completamente en mayúsculas.';
  }

  return null;
};