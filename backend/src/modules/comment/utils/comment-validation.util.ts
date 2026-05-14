import { BadRequestException } from '@nestjs/common';

export const COMMENT_CONTENT_RULES = {
  minLength: 2,
  maxLength: 2000,
  maxWords: 350,
  minLetters: 2,
  maxConsecutiveLineBreaks: 2,
  maxRepeatedCharacterStreak: 5,
  maxRepeatedWordRun: 3,
  maxUppercaseRatio: 0.8,
  maxCommentsPerMinute: 10,
  cooldownMs: 12_000,
  duplicateWindowMs: 30_000,
} as const;

const URL_PATTERN = /(https?:\/\/|www\.|discord\.gg|t\.me)/i;
const SUSPICIOUS_HTML_PATTERN =
  /<\s*\/?\s*[a-z][^>]*>|onerror\s*=|onclick\s*=|javascript:/i;
const KEYBOARD_SPAM_PATTERN = /\b(qwerty|asdf|zxcv|qazwsx)\b/i;
const REPEATED_WORD_PATTERN = /\b([\p{L}\p{N}]{1,})\b(?:\s+\1\b){2,}/iu;
const REPEATED_SEQUENCE_PATTERN = /(.{2,6})\1{2,}/u;
const REPEATED_CHAR_PATTERN = /([\p{L}\p{N}])\1{4,}/iu;
const INVISIBLE_CHARS_PATTERN = /[\u200B-\u200D\uFEFF]/g;

const normalizeCommentWhitespace = (value: string): string => {
  const normalizedLines = value
    .replace(/\r\n/g, '\n')
    .replace(INVISIBLE_CHARS_PATTERN, '')
    .split('\n')
    .map((line) => line.replace(/[\t\f\v ]+/g, ' ').trim());

  return normalizedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const countWords = (value: string): number =>
  value.trim().split(/\s+/).filter(Boolean).length;

const countLetters = (value: string): number =>
  (value.match(/\p{L}/gu) || []).length;

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

const buildValidationError = (fieldLabel: string, message: string): never => {
  throw new BadRequestException(message);
};

const assertSafeContent = (value: string, fieldLabel: string): void => {
  if (URL_PATTERN.test(value)) {
    buildValidationError(fieldLabel, 'No se permiten enlaces.');
  }

  if (SUSPICIOUS_HTML_PATTERN.test(value)) {
    buildValidationError(
      fieldLabel,
      'El comentario contiene código o HTML no permitido.',
    );
  }
};

const assertTextQuality = (value: string, fieldLabel: string): void => {
  const words = value.split(/\s+/).filter(Boolean);
  const letters = countLetters(value);

  if (letters < COMMENT_CONTENT_RULES.minLetters) {
    buildValidationError(
      fieldLabel,
      'El comentario debe incluir texto real, no solo símbolos o emojis.',
    );
  }

  if (isOnlyNumbers(value)) {
    buildValidationError(
      fieldLabel,
      'El comentario no puede contener solo números.',
    );
  }

  if (words.length > COMMENT_CONTENT_RULES.maxWords) {
    buildValidationError(
      fieldLabel,
      `El comentario no puede superar ${COMMENT_CONTENT_RULES.maxWords} palabras.`,
    );
  }

  const repeatedCharCount = (value.match(REPEATED_CHAR_PATTERN) || []).length;
  if (repeatedCharCount > 0) {
    buildValidationError(
      fieldLabel,
      'El comentario contiene spam o letras repetidas de forma excesiva.',
    );
  }

  const repeatedWordCount = (value.match(REPEATED_WORD_PATTERN) || []).length;
  if (
    repeatedWordCount > 0 ||
    KEYBOARD_SPAM_PATTERN.test(value) ||
    REPEATED_SEQUENCE_PATTERN.test(value)
  ) {
    buildValidationError(fieldLabel, 'El comentario contiene spam.');
  }

  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  if (words.length >= 4 && uniqueWords.size / words.length <= 0.5) {
    buildValidationError(
      fieldLabel,
      'El comentario contiene demasiado texto repetido.',
    );
  }

  const uppercaseLetters = countUppercaseLetters(value);
  const uppercaseRatio = letters > 0 ? uppercaseLetters / letters : 0;
  if (
    letters >= 8 &&
    uppercaseRatio >= COMMENT_CONTENT_RULES.maxUppercaseRatio &&
    !isAcronymLike(value)
  ) {
    buildValidationError(
      fieldLabel,
      'Evita escribir el comentario completamente en mayúsculas.',
    );
  }
};

const assertWhitespaceRules = (rawValue: string, fieldLabel: string): void => {
  const normalizedNewlines = rawValue.replace(/\r\n/g, '\n');
  const consecutiveBreaksRegex = new RegExp(
    `\\n{${COMMENT_CONTENT_RULES.maxConsecutiveLineBreaks + 1},}`,
  );

  if (consecutiveBreaksRegex.test(normalizedNewlines)) {
    buildValidationError(
      fieldLabel,
      'El comentario tiene demasiados saltos de línea consecutivos.',
    );
  }
};

export const buildComparableCommentFingerprint = (value: string): string =>
  normalizeCommentWhitespace(value).toLowerCase();

export const normalizeCommentContent = (
  content: string,
  fieldLabel: string,
): string => {
  const normalized = normalizeCommentWhitespace(content);

  if (!normalized) {
    buildValidationError(fieldLabel, 'El comentario no puede estar vacío.');
  }

  assertWhitespaceRules(content, fieldLabel);
  assertSafeContent(normalized, fieldLabel);

  if (normalized.length < COMMENT_CONTENT_RULES.minLength) {
    buildValidationError(fieldLabel, 'El comentario es demasiado corto.');
  }

  if (normalized.length > COMMENT_CONTENT_RULES.maxLength) {
    buildValidationError(
      fieldLabel,
      `El comentario no puede superar los ${COMMENT_CONTENT_RULES.maxLength} caracteres.`,
    );
  }

  assertTextQuality(normalized, fieldLabel);

  return normalized;
};

export const getCommentValidationMessage = (
  content: string,
  fieldLabel: string,
): string | null => {
  try {
    normalizeCommentContent(content, fieldLabel);
    return null;
  } catch (error) {
    if (error instanceof BadRequestException) {
      const response = error.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (response && typeof response === 'object' && 'message' in response) {
        const message = (response as { message?: unknown }).message;
        if (typeof message === 'string') return message;
        if (Array.isArray(message) && typeof message[0] === 'string')
          return message[0];
      }
    }

    return 'El comentario contiene contenido no permitido.';
  }
};
