export const CURRENT_SCALE: 'SMALL' | 'MEDIUM' | 'LARGE' = 'SMALL';

export const MODERATION_RULES = {
  SMALL: {
    likesThresholdPhase1: 10,
    likesThresholdPhase2: 20,
    penaltyHoursPhase1: 2,
    penaltyHoursPhase2: 2,
  },
  MEDIUM: {
    likesThresholdPhase1: 75,
    likesThresholdPhase2: 150,
    penaltyHoursPhase1: 24,
    penaltyHoursPhase2: 24,
  },
  LARGE: {
    likesThresholdPhase1: 100,
    likesThresholdPhase2: 200,
    penaltyHoursPhase1: 48,
    penaltyHoursPhase2: 72,
  },
};
