const BASE_SIZE = 56;
const SCALE_FACTOR = 0.05;
const MAX_SCALE = 2.0;
const BASE_FLOAT_DURATION = 3.0;
const MIN_FLOAT_DURATION = 1.2;
const FLOAT_SPEED_FACTOR = 0.12;
const STEP_PX = 40;
const CANVAS_ACTIVE_CAP = 0.82;
const MIN_CANVAS_HEIGHT = 600;

export const LANE_HEIGHT_PER_IDEA = 110;
export const TOP_PADDING = 120;
export const BOTTOM_PADDING = 100;
const START_X = 80;

export const computeScale = (likesCount: number): number => {
  const scale = 1 + (likesCount * SCALE_FACTOR);
  return Math.min(scale, MAX_SCALE);
};

export const computeFloatDuration = (likesCount: number): number => {
  const duration = BASE_FLOAT_DURATION - (likesCount * FLOAT_SPEED_FACTOR);
  return Math.max(duration, MIN_FLOAT_DURATION);
};

export const computeSize = (likesCount: number): number => {
  return Math.round(BASE_SIZE * computeScale(likesCount));
};

export const computeXPosition = (commentsCount: number, canvasWidth: number): number =>
  Math.min(START_X + commentsCount * STEP_PX, canvasWidth * CANVAS_ACTIVE_CAP);

export const computeCanvasHeight = (ideaCount: number): number => {
  const contentHeight = ideaCount * LANE_HEIGHT_PER_IDEA;
  const total = contentHeight + TOP_PADDING + BOTTOM_PADDING;
  return Math.max(MIN_CANVAS_HEIGHT, total);
};

export const assignLanes = (count: number): number[] => {
  if (count === 0) return [];
  return Array.from({ length: count }, (_, i) => TOP_PADDING + (i * LANE_HEIGHT_PER_IDEA));
};
