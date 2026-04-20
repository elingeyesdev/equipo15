import { BadRequestException } from '@nestjs/common';

export const COMMENT_CONTENT_RULES = {
  minLength: 2,
  maxLength: 2000,
} as const;

export const normalizeCommentContent = (content: string, fieldLabel: string): string => {
  const normalized = content.trim();

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

  return normalized;
};