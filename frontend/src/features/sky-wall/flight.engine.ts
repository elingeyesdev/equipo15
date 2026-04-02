const BASE_SIZE = 56;
const SIZE_FACTOR = 4;
const MAX_SIZE = 120;
const STEP_PX = 40;
const CANVAS_ACTIVE_CAP = 0.82;
const MIN_CANVAS_HEIGHT = 600;
const LANE_HEIGHT_PER_IDEA = 110;
const LANE_PADDING = 55;

export const computeSize = (likesCount: number): number =>
  Math.min(BASE_SIZE + likesCount * SIZE_FACTOR, MAX_SIZE);

export const computeXPosition = (commentsCount: number, canvasWidth: number): number =>
  Math.min(commentsCount * STEP_PX, canvasWidth * CANVAS_ACTIVE_CAP);

export const computeCanvasHeight = (ideaCount: number): number =>
  Math.max(MIN_CANVAS_HEIGHT, ideaCount * LANE_HEIGHT_PER_IDEA);

export const assignLanes = (count: number, canvasHeight: number): number[] => {
  if (count === 0) return [];
  const usableHeight = canvasHeight - LANE_PADDING * 2;
  return Array.from({ length: count }, (_, i) =>
    LANE_PADDING + (i / Math.max(count - 1, 1)) * usableHeight,
  );
};
