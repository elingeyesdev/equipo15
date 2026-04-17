import { BadRequestException } from '@nestjs/common';

export const IDEA_WORD_RULES = {
  title: { min: 5, max: 20 },
  problem: { min: 20, max: 200 },
  solution: { min: 30, max: 200 },
} as const;

export const countWords = (text: string): number =>
  text.trim().split(' ').filter(Boolean).length;

export const assertWordRange = (
  field: 'ideaName' | 'ideaProblem' | 'ideaSolution',
  label: string,
  value: string,
  minWords: number,
  maxWords: number,
): void => {
  const words = countWords(value);
  if (words < minWords || words > maxWords) {
    throw new BadRequestException({
      message: `${label} debe tener entre ${minWords} y ${maxWords} palabras. Actualmente tiene ${words}.`,
      details: {
        [field]: `${label} debe tener entre ${minWords} y ${maxWords} palabras. Actualmente tiene ${words}.`,
      },
    });
  }
};

export const ensureActiveChallengeStatus = (status: string | null | undefined): void => {
  const normalized = (status || '').trim().toLowerCase();
  if (normalized !== 'activo' && normalized !== 'active') {
    throw new BadRequestException({
      message: 'El reto no está activo y no acepta nuevas ideas.',
      details: {
        challenge: 'El reto debe estar en estado ACTIVE/Activo para crear ideas.',
      },
    });
  }
};
