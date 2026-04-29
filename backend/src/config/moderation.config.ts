export const CURRENT_SCALE: 'SMALL' | 'MEDIUM' | 'LARGE' = 'SMALL';

export const MODERATION_RULES = {
  SMALL: {
    likesThresholdPhase1: 10,
    likesThresholdPhase2: 20,
    penaltyHoursPhase1: 2,
    penaltyHoursPhase2: 2,
    commentsThresholdPhase1: 5,
    commentsThresholdPhase2: 15,
    commentPenaltyHoursPhase1: 2,
    commentPenaltyHoursPhase2: 2,
  },
  MEDIUM: {
    likesThresholdPhase1: 75,
    likesThresholdPhase2: 150,
    penaltyHoursPhase1: 24,
    penaltyHoursPhase2: 24,
    commentsThresholdPhase1: 20,
    commentsThresholdPhase2: 40,
    commentPenaltyHoursPhase1: 24,
    commentPenaltyHoursPhase2: 24,
  },
  LARGE: {
    likesThresholdPhase1: 100,
    likesThresholdPhase2: 200,
    penaltyHoursPhase1: 48,
    penaltyHoursPhase2: 72,
    commentsThresholdPhase1: 30,
    commentsThresholdPhase2: 60,
    commentPenaltyHoursPhase1: 48,
    commentPenaltyHoursPhase2: 72,
  },
};
