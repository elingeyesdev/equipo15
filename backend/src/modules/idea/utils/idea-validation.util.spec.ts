import { BadRequestException } from '@nestjs/common';
import {
  countWords,
  assertWordRange,
  ensureActiveChallengeStatus,
  IDEA_WORD_RULES,
} from './idea-validation.util';

describe('idea-validation.util', () => {
  describe('countWords', () => {
    it('counts simple words', () => {
      expect(countWords('hello world foo')).toBe(3);
    });

    it('handles extra spaces', () => {
      expect(countWords('  hello   world  ')).toBe(2);
    });

    it('returns 0 for empty string', () => {
      expect(countWords('')).toBe(0);
    });

    it('returns 0 for whitespace only', () => {
      expect(countWords('   ')).toBe(0);
    });
  });

  describe('assertWordRange', () => {
    it('passes when within range', () => {
      const text = Array(10).fill('word').join(' ');
      expect(() =>
        assertWordRange('ideaName', 'El título', text, 5, 20),
      ).not.toThrow();
    });

    it('throws when below minimum', () => {
      expect(() =>
        assertWordRange('ideaName', 'El título', 'two words', 5, 20),
      ).toThrow(BadRequestException);
    });

    it('throws when above maximum', () => {
      const text = Array(25).fill('word').join(' ');
      expect(() =>
        assertWordRange('ideaName', 'El título', text, 5, 20),
      ).toThrow(BadRequestException);
    });

    it('includes word count in error message', () => {
      try {
        assertWordRange('ideaName', 'El título', 'one two', 5, 20);
      } catch (e: any) {
        expect(e.getResponse().message).toContain('2');
        expect(e.getResponse().message).toContain('5');
        expect(e.getResponse().message).toContain('20');
      }
    });
  });

  describe('ensureActiveChallengeStatus', () => {
    it('passes for "Activo"', () => {
      expect(() => ensureActiveChallengeStatus('Activo')).not.toThrow();
    });

    it('passes for "active" (case insensitive)', () => {
      expect(() => ensureActiveChallengeStatus('ACTIVE')).not.toThrow();
    });

    it('passes for "active" lowercase', () => {
      expect(() => ensureActiveChallengeStatus('active')).not.toThrow();
    });

    it('throws for "DRAFT"', () => {
      expect(() => ensureActiveChallengeStatus('DRAFT')).toThrow(
        BadRequestException,
      );
    });

    it('throws for null', () => {
      expect(() => ensureActiveChallengeStatus(null)).toThrow(
        BadRequestException,
      );
    });

    it('throws for undefined', () => {
      expect(() => ensureActiveChallengeStatus(undefined)).toThrow(
        BadRequestException,
      );
    });

    it('throws for empty string', () => {
      expect(() => ensureActiveChallengeStatus('')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('IDEA_WORD_RULES constants', () => {
    it('has correct title bounds', () => {
      expect(IDEA_WORD_RULES.title).toEqual({ min: 2, max: 10 });
    });

    it('has correct problem bounds', () => {
      expect(IDEA_WORD_RULES.problem).toEqual({ min: 10, max: 200 });
    });

    it('has correct solution bounds', () => {
      expect(IDEA_WORD_RULES.solution).toEqual({ min: 10, max: 200 });
    });
  });
});
