import { BadRequestException } from '@nestjs/common';

export const COMMENT_CONTENT_RULES = {
  minLength: 2,
  maxLength: 2000,
  maxWords: 350,
  maxConsecutiveLineBreaks: 2,
  maxRepeatedCharacterStreak: 8,
} as const;

const hasReadableCharacters = (value: string): boolean =>
  /[A-Za-z0-9\u00C0-\u024F]/.test(value);

const countWords = (value: string): number =>
  value.trim().split(/\s+/).filter(Boolean).length;

const URL_PATTERN = /(https?:\/\/|www\.)/i;

const isOnlyNumbers = (value: string): boolean => {
  const compact = value.replace(/\s+/g, '');
  return /^[0-9]+$/.test(compact);
};

const normalizeCommentWhitespace = (value: string): string => {
  const normalizedLines = value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim());

  return normalizedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const buildComparableCommentFingerprint = (value: string): string =>
  normalizeCommentWhitespace(value).toLowerCase();

export const normalizeCommentContent = (content: string, fieldLabel: string): string => {
  const normalized = normalizeCommentWhitespace(content);

  if (!normalized) {
    throw new BadRequestException({
      message: `${fieldLabel} no puede estar vacío.`,
      details: {
        content: `${fieldLabel} no puede estar vacío.`,
      },
    });
  }

  if (normalized.length < COMMENT_CONTENT_RULES.minLength) {
    throw new BadRequestException({
      message: `${fieldLabel} debe tener al menos ${COMMENT_CONTENT_RULES.minLength} caracteres.`,
      details: {
        content: `${fieldLabel} debe tener al menos ${COMMENT_CONTENT_RULES.minLength} caracteres.`,
      },
    });
  }

  if (normalized.length > COMMENT_CONTENT_RULES.maxLength) {
    throw new BadRequestException({
      message: `${fieldLabel} no puede superar los ${COMMENT_CONTENT_RULES.maxLength} caracteres.`,
      details: {
        content: `${fieldLabel} no puede superar los ${COMMENT_CONTENT_RULES.maxLength} caracteres.`,
      },
    });
  }

  if (!hasReadableCharacters(normalized)) {
    throw new BadRequestException({
      message: `${fieldLabel} debe incluir letras o números legibles.`,
      details: {
        content: `${fieldLabel} debe incluir letras o números legibles.`,
      },
    });
  }

  if (isOnlyNumbers(normalized)) {
    throw new BadRequestException({
      message: `${fieldLabel} no puede contener solo números.`,
      details: {
        content: `${fieldLabel} no puede contener solo números.`,
      },
    });
  }

  const words = countWords(normalized);
  if (words > COMMENT_CONTENT_RULES.maxWords) {
    throw new BadRequestException({
      message: `${fieldLabel} no puede superar ${COMMENT_CONTENT_RULES.maxWords} palabras.`,
      details: {
        content: `${fieldLabel} no puede superar ${COMMENT_CONTENT_RULES.maxWords} palabras.`,
      },
    });
  }

  const repeatedCharsRegex = new RegExp(`(.)\\1{${COMMENT_CONTENT_RULES.maxRepeatedCharacterStreak - 1},}`);
  if (repeatedCharsRegex.test(normalized)) {
    throw new BadRequestException({
      message: `${fieldLabel} contiene repeticiones excesivas de caracteres.`,
      details: {
        content: `${fieldLabel} contiene repeticiones excesivas de caracteres.`,
      },
    });
  }

  const consecutiveBreaksRegex = new RegExp(`\\n{${COMMENT_CONTENT_RULES.maxConsecutiveLineBreaks + 1},}`);
  if (consecutiveBreaksRegex.test(content.replace(/\r\n/g, '\n'))) {
    throw new BadRequestException({
      message: `${fieldLabel} tiene demasiados saltos de línea consecutivos.`,
      details: {
        content: `${fieldLabel} tiene demasiados saltos de línea consecutivos.`,
      },
    });
  }

  if (URL_PATTERN.test(normalized)) {
    throw new BadRequestException({
      message: `${fieldLabel} no debe incluir enlaces.`,
      details: {
        content: `${fieldLabel} no debe incluir enlaces.`,
      },
    });
  }

  return normalized;
};